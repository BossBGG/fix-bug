import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  const response = NextResponse.next();
  
  // Add headers for service worker
  if (request.nextUrl.pathname.includes('sw.js')) {
    response.headers.set('Service-Worker-Allowed', '/');
  }
  
  return response;
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)']
};