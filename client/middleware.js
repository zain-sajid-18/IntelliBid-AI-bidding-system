import { NextResponse } from 'next/server';

export function middleware(req) {
  // Only set security headers here; auth protection is handled client-side
  const response = NextResponse.next();
  response.headers.set('Cross-Origin-Opener-Policy', 'unsafe-none');
  response.headers.set('Cross-Origin-Embedder-Policy', 'unsafe-none');
  return response;
}

export const config = {
  // Match ALL routes so COOP header is set everywhere (needed for Google OAuth)
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
