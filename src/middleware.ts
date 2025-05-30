// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  
  // Get the token from cookies
  const token = request.cookies.get('payload-token')?.value;
  
  // Define protected user routes
  const protectedUserRoutes = [
    '/my-dashboard',
    '/profile',
    '/reminders',
    '/pets',
    // Add other user-specific routes here as needed
  ];
  
  // Check if current path starts with any protected user route
  const isProtectedUserRoute = protectedUserRoutes.some(route => 
    path.startsWith(route)
  );
  
  // Only handle user dashboard routes, let Payload handle admin routes
  if (isProtectedUserRoute) {
    if (!token) {
      // If no token, redirect to login
      const url = new URL('/login', request.url);
      url.searchParams.set('redirect', path);
      return NextResponse.redirect(url);
    }
    
    // Check if user is admin and redirect to admin dashboard
    try {
      const response = await fetch(`${request.nextUrl.origin}/api/users/me`, {
        headers: {
          Cookie: `payload-token=${token}`,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.user?.roles === 'admin') {
          return NextResponse.redirect(new URL('/admin', request.url));
        }
      } else if (response.status === 401) {
        // Token is invalid, redirect to login
        const url = new URL('/login', request.url);
        url.searchParams.set('redirect', path);
        return NextResponse.redirect(url);
      }
    } catch (error) {
      console.error('Error checking user role:', error);
      // On error, let the request continue and let the page handle auth
    }
  }
  
  return NextResponse.next();
}

// Configure which routes to run middleware on
export const config = {
  matcher: [
    // User dashboard and related routes
    '/my-dashboard/:path*',
    '/profile/:path*',
    '/reminders/:path*',
    '/pets/:path*',
    // Add more user routes as needed
  ],
};