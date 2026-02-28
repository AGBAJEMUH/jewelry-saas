import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { products, generations, campaigns } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import OpenAI from 'openai';
import { v2 as cloudinary } from 'cloudinary';
import { buildImagePrompt, type Tone } from '@/lib/ai/promptBuilder';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(req: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { generationId } = await req.json();
        if (!generationId) return NextResponse.json({ error: 'generationId required' }, { status: 400 });

        const [generation] = await db.select().from(generations).where(eq(generations.id, generationId)).limit(1);
        if (!generation) return NextResponse.json({ error: 'Generation not found' }, { status: 404 });

        const [product] = await db.select().from(products).where(eq(products.id, generation.productId)).limit(1);
        if (!product) return NextResponse.json({ error: 'Product not found' }, { status: 404 });

        const [campaign] = await db.select().from(campaigns).where(eq(campaigns.id, product.campaignId)).limit(1);
        if (!campaign || campaign.userId !== session.user.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        // Build DALL-E 3 prompt
        const imagePrompt = buildImagePrompt(
            product.name || 'jewelry piece',
            campaign.tone as Tone,
            generation.captionInstagram || '',
            product.description || ''
        );

        // Generate image via DALL-E 3
        const imageResponse = await openai.images.generate({
            model: 'dall-e-3',
            prompt: imagePrompt,
            n: 1,
            size: '1024x1024',
            quality: 'hd',
            style: campaign.tone === 'Trendy' ? 'vivid' : 'natural',
        });

        const generatedImageUrl = imageResponse.data[0].url;
        if (!generatedImageUrl) {
            return NextResponse.json({ error: 'Image generation failed' }, { status: 500 });
        }

        // Upload to Cloudinary for permanent storage
        const uploaded = await cloudinary.uploader.upload(generatedImageUrl, {
            folder: `jewelry-saas/promo/${product.campaignId}`,
            transformation: [{ quality: 'auto', fetch_format: 'auto' }],
        });

        // Save promo image to generation record
        const [updated] = await db.update(generations)
            .set({
                promoImageUrl: uploaded.secure_url,
                imagePrompt,
            })
            .where(eq(generations.id, generationId))
            .returning();

        return NextResponse.json({ promoImageUrl: updated.promoImageUrl, imagePrompt });
    } catch (error) {
        console.error('[GENERATE-IMAGE]', error);
        return NextResponse.json({ error: 'Image generation failed' }, { status: 500 });
    }
}
