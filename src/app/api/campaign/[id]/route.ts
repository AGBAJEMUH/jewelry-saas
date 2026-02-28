import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { campaigns, products } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';

export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;

        // Verify ownership
        const [campaign] = await db
            .select()
            .from(campaigns)
            .where(and(eq(campaigns.id, id), eq(campaigns.userId, session.user.id)))
            .limit(1);

        if (!campaign) return NextResponse.json({ error: 'Not found' }, { status: 404 });

        // Cascade delete (FK -> products -> generations)
        await db.delete(campaigns).where(eq(campaigns.id, id));

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('[CAMPAIGN DELETE]', error);
        return NextResponse.json({ error: 'Delete failed' }, { status: 500 });
    }
}

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;

        const [campaign] = await db
            .select()
            .from(campaigns)
            .where(and(eq(campaigns.id, id), eq(campaigns.userId, session.user.id)))
            .limit(1);

        if (!campaign) return NextResponse.json({ error: 'Not found' }, { status: 404 });

        const productList = await db
            .select()
            .from(products)
            .where(eq(products.campaignId, id))
            .orderBy(products.sortOrder);

        // Import generations inline to avoid circular imports at module level
        const { generations } = await import('@/lib/db/schema');
        const { eq: eqAlias } = await import('drizzle-orm');

        const productsWithGenerations = await Promise.all(
            productList.map(async (p) => {
                const gens = await db
                    .select()
                    .from(generations)
                    .where(eqAlias(generations.productId, p.id))
                    .orderBy(generations.variationNumber);
                return { ...p, generations: gens };
            })
        );

        return NextResponse.json({ campaign, products: productsWithGenerations });
    } catch (error) {
        console.error('[CAMPAIGN GET]', error);
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}
