import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { campaigns, products, generations } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function GET() {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const userCampaigns = await db
            .select()
            .from(campaigns)
            .where(eq(campaigns.userId, session.user.id))
            .orderBy(campaigns.createdAt);

        // Get product count and cover image for each campaign
        const enriched = await Promise.all(
            userCampaigns.map(async (c) => {
                const prods = await db.select().from(products).where(eq(products.campaignId, c.id)).orderBy(products.sortOrder);
                return {
                    ...c,
                    productCount: prods.length,
                    coverImage: prods[0]?.imageUrl || null,
                };
            })
        );

        return NextResponse.json({ campaigns: enriched.reverse() });
    } catch (error) {
        console.error('[CAMPAIGNS GET]', error);
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}
