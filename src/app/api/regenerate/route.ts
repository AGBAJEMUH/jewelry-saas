import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { products, generations, campaigns } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import OpenAI from 'openai';
import { buildGenerationPrompt, type Tone } from '@/lib/ai/promptBuilder';
import { GenerationOutputSchema, getFallbackGeneration } from '@/lib/ai/responseValidator';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { productId, variationHint } = await req.json();
        if (!productId) return NextResponse.json({ error: 'productId required' }, { status: 400 });

        const [product] = await db.select().from(products).where(eq(products.id, productId)).limit(1);
        if (!product) return NextResponse.json({ error: 'Product not found' }, { status: 404 });

        const [campaign] = await db.select().from(campaigns).where(eq(campaigns.id, product.campaignId)).limit(1);
        if (!campaign || campaign.userId !== session.user.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        // Count existing variations
        const existingGens = await db.select().from(generations).where(eq(generations.productId, productId));
        const nextVariation = existingGens.length + 1;

        const variationInstruction = variationHint
            ? `\n\nVARIATION INSTRUCTION: ${variationHint}. Make this variation distinctly different from previous ones.`
            : `\n\nVARIATION INSTRUCTION: Generate variation #${nextVariation}. Use a fresh creative angle.`;

        const prompt = buildGenerationPrompt(
            [{ name: product.name ?? undefined, price: product.price ?? undefined, description: product.description ?? undefined, imageUrl: product.imageUrl }],
            campaign.tone as Tone,
            campaign.theme
        ) + variationInstruction;

        let aiOutput;
        try {
            const response = await openai.chat.completions.create({
                model: 'gpt-4o',
                messages: [{
                    role: 'user',
                    content: [
                        { type: 'text', text: prompt },
                        { type: 'image_url', image_url: { url: product.imageUrl, detail: 'high' } },
                    ],
                }],
                response_format: { type: 'json_object' },
                max_tokens: 1500,
            });

            const rawJson = response.choices[0].message.content || '{"products":[]}';
            const parsed = GenerationOutputSchema.parse(JSON.parse(rawJson));
            aiOutput = parsed.products[0];
        } catch {
            aiOutput = getFallbackGeneration(product.name ?? undefined);
        }

        const [gen] = await db.insert(generations).values({
            productId,
            captionInstagram: aiOutput.captions.instagram,
            captionFacebook: aiOutput.captions.facebook,
            captionTiktok: aiOutput.captions.tiktok,
            hashtags: aiOutput.hashtags,
            estimatedPrice: aiOutput.estimatedPrice,
            priceConfidence: aiOutput.priceConfidence,
            variationNumber: nextVariation,
        }).returning();

        return NextResponse.json({ generation: gen });
    } catch (error) {
        console.error('[REGENERATE]', error);
        return NextResponse.json({ error: 'Regeneration failed' }, { status: 500 });
    }
}
