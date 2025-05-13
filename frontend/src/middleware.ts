import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Function to get the base path using the environment variable
const getBasePath = () => {
    const branch = process.env.NEXT_PUBLIC_BRANCH_NAME || 'main';
    if (branch === 'main') {
        return '';
    }
    return `/${branch}`;
};

export function middleware(request: NextRequest) {
    const sessionToken = request.cookies.get('session_token');
    const path = request.nextUrl.pathname;

    // Get base path from environment variable
    const basePath = getBasePath();

    // Check if the current path is a login page based on the base path
    const loginPath = `${basePath}/login`;
    const isLoginPage = path === '/login' || path === loginPath;

    // Public paths that don't require authentication
    const isPublicPath =
        isLoginPage ||
        path.startsWith('/api') ||
        path.startsWith('/_next') ||
        path === '/favicon.ico';

    // Redirect unauthenticated users from protected paths to branch-specific login
    if (!sessionToken && !isPublicPath) {
        return NextResponse.redirect(new URL(loginPath, request.url));
    }

    // Redirect authenticated users from login to branch-specific home
    if (sessionToken && isLoginPage) {
        const homePath = basePath || '/';
        return NextResponse.redirect(new URL(homePath, request.url));
    }

    return NextResponse.next();
}

// Match ALL paths
export const config = {
    matcher: [
        // Match root and all paths
        '/',
        '/:path*',
    ],
}; 