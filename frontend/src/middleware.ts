import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const PUBLIC_PATHS = ['/', '/register', '/forgot-password', '/reset-password', '/403'];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('token')?.value;
  const role = request.cookies.get('role')?.value;

  const isPublicPath = PUBLIC_PATHS.some((path) => pathname === path || pathname.startsWith(`${path}/`) && path !== '/');

  // 1. If user is logged in and trying to access auth pages, redirect to home page (/feed)
  if (token && (pathname === '/' || pathname === '/register' || pathname === '/forgot-password' || pathname === '/reset-password')) {
    return NextResponse.redirect(new URL('/feed', request.url));
  }

  // 2. If user is NOT logged in and trying to access a protected path, redirect to login page (/)
  if (!token && !isPublicPath) {
    const loginUrl = new URL('/', request.url);
    // Keep track of the original page to redirect back after login
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // 3. If authenticated but trying to access creator dashboard without creator privileges
  if (pathname.startsWith('/dashboard') && role !== 'CREATOR') {
    return NextResponse.redirect(new URL('/403', request.url));
  }

  return NextResponse.next();
}

// Config to specify matching routes: match all paths except API, static files, and icons
export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)'],
};
