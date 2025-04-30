import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    const sessionToken = request.cookies.get('session_token');
    const isLoginPage = request.nextUrl.pathname === '/login';

    // If user is not authenticated and not on login page, redirect to login
    if (!sessionToken && !isLoginPage) {
        return NextResponse.redirect(new URL('/login', request.url));
    }

    // If user is authenticated and on login page, redirect to home
    if (sessionToken && isLoginPage) {
        return NextResponse.redirect(new URL('/', request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}; 