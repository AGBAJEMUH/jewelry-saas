import { auth } from '@/lib/auth';
import { NextResponse } from 'next/server';

export default auth((req) => {
    const { pathname } = req.nextUrl;
    const isLoggedIn = !!req.auth;
    const isAuthPage = pathname.startsWith('/auth');

    if (!isLoggedIn && !isAuthPage) {
        return NextResponse.redirect(new URL('/auth/login', req.url));
    }

    if (isLoggedIn && isAuthPage) {
        return NextResponse.redirect(new URL('/dashboard', req.url));
    }

    return NextResponse.next();
});

export const config = {
    matcher: ['/dashboard/:path*', '/auth/:path*'],
};
