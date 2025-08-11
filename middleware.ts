import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

const isPublicRoute = createRouteMatcher([
  '/sign-in',
  '/sign-up',
  '/api/videos', // we can treat this as public API if needed
]);

export default clerkMiddleware(async (auth, req) => {
  const { userId } = await auth();
  const url = new URL(req.url);
  const path = url.pathname;

  // Special handling for "/"
  if (path === '/') {
    if (!userId) {
      return NextResponse.redirect(new URL('/sign-in', req.url));
    } else {
      return NextResponse.redirect(new URL('/home', req.url));
    }
  }

  // If not signed in & route is not public
  if (!userId && !isPublicRoute(req)) {
    return NextResponse.redirect(new URL('/sign-in', req.url));
  }

  // If signed in and visiting public route (like /sign-in), send to home
  if (userId && isPublicRoute(req) && path !== '/api/videos') {
    return NextResponse.redirect(new URL('/home', req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    '/((?!.*\\..*|_next).*)', // All paths except static files
    '/',
    '/(api|trpc)(.*)',
  ],
};
