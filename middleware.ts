import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

const isPublicRoute = createRouteMatcher([
  '/sign-in(.*)',              // Clerk sign-in routes
  '/sign-up(.*)',              
  '/sso-callback(.*)',         
  '/sign-up/verify(.*)',      
            
]);

export default clerkMiddleware(async (auth, req) => {
  const { userId } = await auth();
  const url = new URL(req.url);
  const path = url.pathname;

  // Handle root route "/"
  if (path === '/') {
    if (!userId) {
      return NextResponse.redirect(new URL('/sign-in', req.url));
    }
    return NextResponse.redirect(new URL('/home', req.url));
  }

  // If route is NOT public and user is NOT signed in → redirect to /sign-in
  if (!userId && !isPublicRoute(req)) {
    return NextResponse.redirect(new URL('/sign-in', req.url));
  }

  // If route is public (except /api/videos) and user IS signed in → redirect to /home
  if (userId && isPublicRoute(req) && !path.startsWith('/api/videos')) {
    return NextResponse.redirect(new URL('/home', req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    '/((?!.*\\..*|_next).*)', // all routes except static files/_next
    '/',
    '/(api|trpc)(.*)',
  ],
};
