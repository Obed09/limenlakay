import { updateSession } from "@/lib/supabase/middleware";
import { type NextRequest, NextResponse } from "next/server";

const supportedLocales = ['en', 'fr', 'es', 'ht'];
const defaultLocale = 'en';

// Admin routes that should NOT be localized
const adminRoutes = [
  '/admin',
  '/api',
  '/auth',
  '/inventory-dashboard',
  '/feedback-admin',
  '/workshop-settings',
  '/social-media-manager',
];

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Skip admin and API routes - don't add locale prefix
  const shouldSkipLocale = adminRoutes.some(route => pathname.startsWith(route));
  
  if (!shouldSkipLocale) {
    // Check if pathname already has a locale
    const pathnameHasLocale = supportedLocales.some(
      locale => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
    );

    if (!pathnameHasLocale && pathname !== '/') {
      // Redirect to default locale with locale prefix
      return NextResponse.redirect(
        new URL(`/${defaultLocale}${pathname}`, request.url)
      );
    }

    if (pathname === '/') {
      return NextResponse.redirect(
        new URL(`/${defaultLocale}/`, request.url)
      );
    }
  }

  // Continue with Supabase session update
  return await updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - images - .svg, .png, .jpg, .jpeg, .gif, .webp
     * Feel free to modify this pattern to include more paths.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
