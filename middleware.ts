import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createMiddlewareClient } from "@/lib/supabase/middleware";

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient(req, res);

  const {
    data: { session },
  } = await supabase.auth.getSession();

  // Check if the user is trying to access protected routes
  const isProtectedRoute = req.nextUrl.pathname.startsWith("/dashboard");
  const isAuthRoute =
    req.nextUrl.pathname === "/login" || req.nextUrl.pathname === "/register";

  // If it's a protected route and the user is not authenticated,
  // redirect to the login page
  if (isProtectedRoute && !session) {
    const redirectUrl = new URL("/login", req.url);
    redirectUrl.searchParams.set("from", req.nextUrl.pathname);
    return NextResponse.redirect(redirectUrl);
  }

  // If user is authenticated and trying to access dashboard,
  // check if they have the required role
  if (isProtectedRoute && session) {
    try {
      const { data: userProfile } = await supabase
        .from("users")
        .select("role")
        .eq("id", session.user.id)
        .single();

      // If user doesn't have author or admin role, redirect to home
      if (userProfile?.role !== "author" && userProfile?.role !== "admin") {
        return NextResponse.redirect(new URL("/", req.url));
      }
    } catch (error) {
      // If we can't get user profile, redirect to login
      return NextResponse.redirect(new URL("/login", req.url));
    }
  }

  // If it's an auth route and the user is authenticated,
  // redirect appropriately based on their role
  if (isAuthRoute && session) {
    try {
      const { data: userProfile } = await supabase
        .from("users")
        .select("role")
        .eq("id", session.user.id)
        .single();

      // If user has author or admin role, redirect to dashboard
      if (userProfile?.role === "author" || userProfile?.role === "admin") {
        return NextResponse.redirect(new URL("/dashboard", req.url));
      } else {
        // Otherwise redirect to home page
        return NextResponse.redirect(new URL("/", req.url));
      }
    } catch (error) {
      // If we can't get user profile, let them stay on auth page
      return res;
    }
  }

  return res;
}

export const config = {
  matcher: ["/dashboard/:path*", "/login", "/register"],
};
