export type Tone = 'Luxury' | 'Trendy' | 'Minimal' | 'Bold';

const toneDescriptions: Record<Tone, string> = {
  Luxury: 'sophisticated, elegant, aspirational, high-end brand voice',
  Trendy: 'fun, youthful, energetic, Gen-Z lifestyle brand voice',
  Minimal: 'clean, simple, understated, Scandinavian minimalist voice',
  Bold: 'powerful, dramatic, statement-making, confident brand voice',
};

export interface ProductInput {
  name?: string;
  price?: string;
  description?: string;
  imageUrl: string;
}

export function buildGenerationPrompt(
  products: ProductInput[],
  tone: Tone,
  theme: string
): string {
  const toneDesc = toneDescriptions[tone];

  return `You are an expert jewelry marketing copywriter with deep knowledge of social media algorithms.

CAMPAIGN CONTEXT:
- Theme: ${theme}
- Tone: ${tone} (${toneDesc})
- Products count: ${products.length}

TASK: For each product image provided (in order), generate complete marketing content.

${products.map((p, i) => `Product ${i + 1}:
- Name: ${p.name || 'UNKNOWN - infer from image'}
- Price: ${p.price || 'UNKNOWN - estimate from image quality and style'}
- Description: ${p.description || 'UNKNOWN - describe from image'}`).join('\n\n')}

RESPONSE FORMAT (strict JSON, no markdown, no explanation):
{
  "products": [
    {
      "inferredName": "string (if name was unknown, provide best guess; else repeat given name)",
      "inferredDescription": "string (2-3 sentences about the product)",
      "estimatedPrice": "string (e.g. '$89' or '$120-$150')",
      "priceConfidence": "high|medium|low",
      "captions": {
        "instagram": "string (1-3 sentences, emoji-rich, lifestyle-focused, ends with soft CTA)",
        "facebook": "string (2-4 sentences, story-driven, community-focused, includes price mention)",
        "tiktok": "string (punchy, trend-aware, very short, max 150 chars, hook-first)",
        "whatsapp": "string (conversational, persuasive, highly shareable, natural sounding for direct messages/status, emoji-rich)"
      },
      "hashtags": ["tag1", "tag2", ... (15-20 tags, mix of niche and trending, no # prefix)]
    }
  ]
}`;
}

export function buildImagePrompt(
  productName: string,
  tone: Tone,
  caption: string,
  description: string
): string {
  const visualStyles: Record<Tone, string> = {
    Luxury: 'soft editorial lighting, gold and ivory background, luxury velvet and marble surfaces, champagne and warm tones, sophisticated depth of field, Vogue magazine aesthetic',
    Trendy: 'vibrant colorful gradient background, trendy lifestyle setting, bright and fun colors, social-media-viral aesthetic, Gen-Z color palette, energetic composition',
    Minimal: 'pure white studio background, clean Scandinavian minimalism, negative space, monochromatic neutral tones, precise product placement, Apple product photography style',
    Bold: 'dramatic chiaroscuro lighting, dark jewel-toned background, deep contrast, powerful composition, fashion-forward editorial, high-impact visual statement',
  };

  const style = visualStyles[tone];

  return `A stunning professional jewelry product advertisement photograph. The jewelry piece shown is: "${productName}". ${description ? `Product details: ${description}.` : ''} Visual style: ${style}. The image should be optimized for social media marketing, with the jewelry as the hero element. Shot in the style of a luxury fashion brand campaign. Ultra high resolution, photorealistic, no text or watermarks.`;
}

export function buildCampaignHeroImagePrompt(
  theme: string,
  tone: Tone
): string {
  const visualStyles: Record<Tone, string> = {
    Luxury: 'soft editorial lighting, gold and ivory background, luxury velvet and marble surfaces, champagne and warm tones, sophisticated depth of field, Vogue magazine aesthetic',
    Trendy: 'vibrant colorful gradient background, trendy lifestyle setting, bright and fun colors, social-media-viral aesthetic, Gen-Z color palette, energetic composition',
    Minimal: 'pure white studio background, clean Scandinavian minimalism, negative space, monochromatic neutral tones, precise product placement, Apple product photography style',
    Bold: 'dramatic chiaroscuro lighting, dark jewel-toned background, deep contrast, powerful composition, fashion-forward editorial, high-impact visual statement',
  };

  const style = visualStyles[tone];

  return `A stunning professional hero campaign image representing a jewelry collection. The theme of the campaign is: "${theme}". Visual style: ${style}. The image should conceptually feature multiple elegant jewelry pieces beautifully arranged together to form a cohesive promotional poster or hero asset. Shot in the style of a luxury fashion brand campaign. Ultra high resolution, photorealistic, visually captivating, no text or watermarks.`;
}
