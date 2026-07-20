import { NextResponse } from 'next/server';

export function middleware(req) {
  const token = req.cookies.get('token');
  const { pathname } = req.nextUrl;

  // Protect dashboard routes
  const protectedRoutes = ['/buyer', '/seller', '/admin'];
  const isProtected = protectedRoutes.some((r) => pathname.startsWith(r));

  if (isProtected && !token) {
    const response = NextResponse.redirect(new URL('/login', req.url));
    response.headers.set('Cross-Origin-Opener-Policy', 'unsafe-none');
    response.headers.set('Cross-Origin-Embedder-Policy', 'unsafe-none');
    return response;
  }

  const response = NextResponse.next();
  response.headers.set('Cross-Origin-Opener-Policy', 'unsafe-none');
  response.headers.set('Cross-Origin-Embedder-Policy', 'unsafe-none');
  return response;
}

export const config = {
  // Match ALL routes so COOP header is set everywhere (needed for Google OAuth)
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
