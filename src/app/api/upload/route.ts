import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { campaigns, products } from '@/lib/db/schema';
import { v2 as cloudinary } from 'cloudinary';

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

        const formData = await req.formData();
        const title = formData.get('title') as string || 'Untitled Campaign';
        const theme = formData.get('theme') as string || 'jewelry';
        const tone = formData.get('tone') as string || 'Luxury';
        const files = formData.getAll('images') as File[];
        const names = formData.getAll('names') as string[];
        const prices = formData.getAll('prices') as string[];
        const descriptions = formData.getAll('descriptions') as string[];

        if (!files.length || files.length > 20) {
            return NextResponse.json({ error: 'Upload 1–20 images' }, { status: 400 });
        }

        // Create campaign
        const [campaign] = await db.insert(campaigns).values({
            userId: session.user.id,
            title,
            theme,
            tone,
            status: 'draft',
        }).returning();

        // Upload each image to Cloudinary and create product records
        const productRecords = await Promise.all(
            files.map(async (file, i) => {
                const arrayBuffer = await file.arrayBuffer();
                const base64 = Buffer.from(arrayBuffer).toString('base64');
                const dataUri = `data:${file.type};base64,${base64}`;

                const uploadResult = await cloudinary.uploader.upload(dataUri, {
                    folder: `jewelry-saas/${campaign.id}`,
                    transformation: [{ quality: 'auto', fetch_format: 'auto' }],
                });

                const [product] = await db.insert(products).values({
                    campaignId: campaign.id,
                    name: names[i] || undefined,
                    price: prices[i] || undefined,
                    description: descriptions[i] || undefined,
                    imageUrl: uploadResult.secure_url,
                    cloudinaryPublicId: uploadResult.public_id,
                    sortOrder: i,
                }).returning();

                return product;
            })
        );

        return NextResponse.json({
            campaignId: campaign.id,
            products: productRecords,
        });
    } catch (error) {
        console.error('[UPLOAD]', error);
        return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
    }
}
