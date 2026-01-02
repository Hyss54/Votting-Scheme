import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
    let response = NextResponse.next({
        request: {
            headers: request.headers,
        },
    });

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll();
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value));
                    response = NextResponse.next({
                        request: {
                            headers: request.headers,
                        },
                    });
                    cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
                },
            },
        }
    );

    const { data: { user } } = await supabase.auth.getUser();
    const { pathname } = request.nextUrl;

    const publicRoutes = ['/', '/login', '/register', '/api/auth'];
    const isPublicRoute = publicRoutes.some(route => pathname === route || pathname.startsWith('/api/auth'));

    if (!user && !isPublicRoute) {
        return NextResponse.redirect(new URL('/login', request.url));
    }

    if (user && pathname !== '/dashboard' && !isPublicRoute) {
        // Fetch users roles
        const { data: userData } = await supabase
            .from('users')
            .select('roles')
            .eq('id', user.id)
            .single();

        const userRoles = userData?.roles || [];

        // Role-based protection
        if (pathname.startsWith('/admin') && !userRoles.includes('admin')) {
            return NextResponse.redirect(new URL('/voter/events', request.url));
        }

        if (pathname.startsWith('/nominee') && !userRoles.includes('nominee')) {
            return NextResponse.redirect(new URL('/voter/events', request.url));
        }
    }

    return response;
}

export const config = {
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico).*)',
    ],
};
