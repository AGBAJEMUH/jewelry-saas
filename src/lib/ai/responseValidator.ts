import { z } from 'zod';

export const GenerationOutputSchema = z.object({
    products: z.array(
        z.object({
            inferredName: z.string(),
            inferredDescription: z.string(),
            estimatedPrice: z.string(),
            priceConfidence: z.enum(['high', 'medium', 'low']),
            captions: z.object({
                instagram: z.string(),
                facebook: z.string(),
                tiktok: z.string(),
                whatsapp: z.string(),
            }),
            hashtags: z.array(z.string()),
        })
    ),
    masterCopy: z.object({
        captions: z.object({
            instagram: z.string(),
            facebook: z.string(),
            tiktok: z.string(),
            whatsapp: z.string(),
        }),
        hashtags: z.array(z.string()),
    }),
});

export type GenerationOutput = z.infer<typeof GenerationOutputSchema>;

// Fallback template when AI fails
export function getFallbackGeneration(productName?: string) {
    const name = productName || 'this beautiful piece';
    return {
        inferredName: name,
        inferredDescription: 'A stunning piece of jewelry, crafted with exceptional attention to detail.',
        estimatedPrice: 'Contact us for pricing',
        priceConfidence: 'low' as const,
        captions: {
            instagram: `✨ Elevate your style with ${name}. Each piece tells a story. Shop now through the link in bio! 💍`,
            facebook: `Discover ${name} — a beautiful addition to any collection. Handcrafted with care and designed to last a lifetime. Visit our store today!`,
            tiktok: `POV: you just found your new favorite jewelry 💍✨ #jewelry #style`,
            whatsapp: `Hey! ✨ You have to check out ${name}. It's absolutely stunning! Let me know if you want more details. 💍`,
        },
        hashtags: ['jewelry', 'luxuryjewelry', 'jewelrylover', 'accessories', 'style', 'fashion', 'handmade', 'gold', 'silver', 'rings', 'necklace', 'earrings', 'jewels', 'bling', 'fashionista'],
    };
}
