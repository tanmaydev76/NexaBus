import { NextResponse } from 'next/server';

const protectedPaths = ['/my-bookings', '/profile'];

export function middleware(request) {
  const { pathname } = request.nextUrl;
  const isProtected = protectedPaths.some((p) => pathname.startsWith(p));

  if (isProtected) {
    const token = request.cookies.get('nb_token')?.value;
    if (!token) {
      const url = new URL('/auth/login', request.url);
      url.searchParams.set('redirect', pathname);
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/my-bookings/:path*', '/profile/:path*'],
};
