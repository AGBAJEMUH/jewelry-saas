import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import { z } from 'zod';

const RegisterSchema = z.object({
    name: z.string().min(2),
    email: z.string().email(),
    password: z.string().min(6),
});

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const parsed = RegisterSchema.safeParse(body);
        if (!parsed.success) {
            return NextResponse.json({ error: 'Invalid input', issues: parsed.error.issues }, { status: 400 });
        }

        const { name, email, password } = parsed.data;

        // Check existing user
        const [existing] = await db.select().from(users).where(eq(users.email, email)).limit(1);
        if (existing) {
            return NextResponse.json({ error: 'Email already registered' }, { status: 409 });
        }

        const passwordHash = await bcrypt.hash(password, 12);
        const [user] = await db.insert(users).values({ name, email, passwordHash }).returning();

        return NextResponse.json({ success: true, userId: user.id }, { status: 201 });
    } catch (error) {
        console.error('[REGISTER]', error);
        return NextResponse.json({ error: 'Registration failed' }, { status: 500 });
    }
}
