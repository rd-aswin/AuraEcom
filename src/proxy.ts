import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
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
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const { pathname } = request.nextUrl;

  // Redirect logged-in users away from the login page
  if (pathname.startsWith('/login')) {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      let redirectPath = request.nextUrl.searchParams.get('redirect') || '/';
      // Open redirect vulnerability protection
      if (!redirectPath.startsWith('/') || redirectPath.startsWith('//')) {
        redirectPath = '/';
      }
      const url = request.nextUrl.clone();
      url.pathname = redirectPath;
      url.searchParams.delete('redirect');
      return NextResponse.redirect(url);
    }
  }

  // Protect the checkout and orders routes
  if (pathname.startsWith('/checkout') || pathname.startsWith('/orders')) {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      const url = request.nextUrl.clone();
      url.pathname = '/login';
      url.searchParams.set('redirect', pathname);
      return NextResponse.redirect(url);
    }
  }

  // Protect the admin routes
  if (pathname.startsWith('/admin')) {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      const url = request.nextUrl.clone();
      url.pathname = '/login';
      url.searchParams.set('redirect', pathname);
      return NextResponse.redirect(url);
    }

    // Check if the user has admin flag in PostgreSQL profiles
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', user.id)
        .single();

      if (error || !profile || !profile.is_admin) {
        console.warn(`Unauthorized admin access attempt by: ${user.email}`);
        const url = request.nextUrl.clone();
        url.pathname = '/'; // Redirect non-admins to storefront homepage
        return NextResponse.redirect(url);
      }
    } catch (err) {
      console.error('Proxy admin check error:', err);
      const url = request.nextUrl.clone();
      url.pathname = '/';
      return NextResponse.redirect(url);
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - media assets (svg, png, jpg, etc)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
