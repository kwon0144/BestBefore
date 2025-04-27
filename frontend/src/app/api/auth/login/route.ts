import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const { password } = await request.json();

        // Debug logging
        console.log('Received password:', password);
        console.log('Expected password:', process.env.NEXT_PUBLIC_SITE_PASSWORD);

        if (!process.env.NEXT_PUBLIC_SITE_PASSWORD) {
            console.error('NEXT_PUBLIC_SITE_PASSWORD is not set');
            return NextResponse.json(
                { error: 'Server configuration error' },
                { status: 500 }
            );
        }

        if (password === process.env.NEXT_PUBLIC_SITE_PASSWORD) {
            const response = NextResponse.json({ success: true });

            // Set a session token instead of storing the password
            response.cookies.set('session_token', 'authenticated', {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: 60 * 60 * 24 * 7, // 1 week
            });

            return response;
        }

        return NextResponse.json(
            { error: 'Invalid password' },
            { status: 401 }
        );
    } catch (error) {
        console.error('Login error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
} 