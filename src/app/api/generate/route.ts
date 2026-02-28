import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { campaigns, products, generations } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import OpenAI from 'openai';
import { buildGenerationPrompt, buildCampaignHeroImagePrompt, type Tone } from '@/lib/ai/promptBuilder';
import { GenerationOutputSchema, getFallbackGeneration, type GenerationOutput } from '@/lib/ai/responseValidator';
import { v2 as cloudinary } from 'cloudinary';

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

        const { campaignId } = await req.json();
        if (!campaignId) return NextResponse.json({ error: 'campaignId required' }, { status: 400 });

        // Fetch campaign + products
        const [campaign] = await db
            .select()
            .from(campaigns)
            .where(eq(campaigns.id, campaignId))
            .limit(1);

        if (!campaign || campaign.userId !== session.user.id) {
            return NextResponse.json({ error: 'Not found' }, { status: 404 });
        }

        const productList = await db
            .select()
            .from(products)
            .where(eq(products.campaignId, campaignId))
            .orderBy(products.sortOrder);

        if (!productList.length) {
            return NextResponse.json({ error: 'No products found' }, { status: 400 });
        }

        // Update campaign status
        await db.update(campaigns)
            .set({ status: 'generating' })
            .where(eq(campaigns.id, campaignId));

        // Build prompt and call GPT-4o Vision
        const prompt = buildGenerationPrompt(
            productList.map(p => ({
                name: p.name ?? undefined,
                price: p.price ?? undefined,
                description: p.description ?? undefined,
                imageUrl: p.imageUrl,
            })),
            campaign.tone as Tone,
            campaign.theme
        );

        const imageMessages = productList.map((p) => ({
            type: 'image_url' as const,
            image_url: { url: p.imageUrl, detail: 'high' as const },
        }));

        let aiOutput: GenerationOutput;
        try {
            const response = await openai.chat.completions.create({
                model: 'gpt-4o',
                messages: [
                    {
                        role: 'user',
                        content: [
                            { type: 'text', text: prompt },
                            ...imageMessages,
                        ],
                    },
                ],
                response_format: { type: 'json_object' },
                max_tokens: 4000,
            });

            const rawJson = response.choices[0].message.content || '{"products":[]}';
            aiOutput = GenerationOutputSchema.parse(JSON.parse(rawJson));
        } catch (aiErr) {
            console.error('[GENERATE AI ERROR]', aiErr);
            // Use fallbacks
            aiOutput = {
                products: productList.map(p => ({ ...getFallbackGeneration(p.name ?? undefined) })),
                masterCopy: {
                    captions: {
                        instagram: '', facebook: '', tiktok: '', whatsapp: ''
                    },
                    hashtags: []
                }
            };
        }

        // Save generations to DB
        const savedGenerations = await Promise.all(
            productList.map(async (product, i) => {
                const data = aiOutput.products[i] || getFallbackGeneration(product.name ?? undefined);

                const [gen] = await db.insert(generations).values({
                    productId: product.id,
                    captionInstagram: data.captions.instagram,
                    captionFacebook: data.captions.facebook,
                    captionTiktok: data.captions.tiktok,
                    captionWhatsapp: data.captions.whatsapp,
                    hashtags: data.hashtags,
                    estimatedPrice: data.estimatedPrice,
                    priceConfidence: data.priceConfidence,
                    variationNumber: 1,
                }).returning();

                // Update product with inferred data
                await db.update(products)
                    .set({
                        name: product.name || data.inferredName,
                        description: product.description || data.inferredDescription,
                    })
                    .where(eq(products.id, product.id));

                return { product, generation: gen };
            })
        );

        // Generate Campaign Hero Image
        const heroImagePrompt = buildCampaignHeroImagePrompt(campaign.theme, campaign.tone as Tone);
        let heroImageUrl = null;

        try {
            const imageResponse = await openai.images.generate({
                model: 'dall-e-3',
                prompt: heroImagePrompt,
                n: 1,
                size: '1024x1024',
                quality: 'hd',
                style: campaign.tone === 'Trendy' ? 'vivid' : 'natural',
            });

            const generatedUrl = imageResponse.data?.[0]?.url;
            if (generatedUrl) {
                const uploaded = await cloudinary.uploader.upload(generatedUrl, {
                    folder: `jewelry-saas/campaigns/${campaign.id}`,
                    transformation: [{ quality: 'auto', fetch_format: 'auto' }],
                });
                heroImageUrl = uploaded.secure_url;
            }
        } catch (heroErr) {
            console.error('[GENERATE HERO IMAGE ERROR]', heroErr);
            // Non-fatal, we continue to save the campaign
        }

        // Mark campaign done and save hero image
        await db.update(campaigns)
            .set({
                status: 'done',
                heroImageUrl,
                heroImagePrompt,
                masterCaptionInstagram: aiOutput.masterCopy.captions.instagram,
                masterCaptionFacebook: aiOutput.masterCopy.captions.facebook,
                masterCaptionTiktok: aiOutput.masterCopy.captions.tiktok,
                masterCaptionWhatsapp: aiOutput.masterCopy.captions.whatsapp,
                masterHashtags: aiOutput.masterCopy.hashtags,
            })
            .where(eq(campaigns.id, campaignId));

        return NextResponse.json({ success: true, generations: savedGenerations });
    } catch (error) {
        console.error('[GENERATE]', error);
        return NextResponse.json({ error: 'Generation failed' }, { status: 500 });
    }
}
