import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

export const updateSession = async (request: NextRequest) => {
  // This `try/catch` block is only here for the interactive tutorial.
  // Feel free to remove once you have Supabase connected.
  try {
    // Create an unmodified response
    let response = NextResponse.next({
      request: {
        headers: request.headers,
      },
    });

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value }) =>
              request.cookies.set(name, value)
            );
            response = NextResponse.next({
              request,
            });
            cookiesToSet.forEach(({ name, value, options }) =>
              response.cookies.set(name, value, options)
            );
          },
        },
      }
    );

    // This will refresh session if expired - required for Server Components
    // https://supabase.com/docs/guides/auth/server-side/nextjs
    const user = await supabase.auth.getUser();

    const isAuthPage =
      request.nextUrl.pathname.startsWith("/sign-in") ||
      request.nextUrl.pathname.startsWith("/sign-up") ||
      request.nextUrl.pathname.startsWith("/forgot-password");

    const isAuthCallback =
      request.nextUrl.pathname.startsWith("/auth/callback");

    const isOnboardingRoute =
      request.nextUrl.pathname === "/path-selection" ||
      request.nextUrl.pathname.startsWith("/sign-up/create-dealership") ||
      request.nextUrl.pathname.startsWith("/sign-up/join-dealership");

    // Allow auth callback to handle its own redirects first
    if (isAuthCallback) {
      return response;
    }

    // If user is not authenticated and trying to access protected routes
    if (!isAuthPage && user.error) {
      return NextResponse.redirect(new URL("/sign-in", request.url));
    }

    // For authenticated users, get profile once and reuse
    let profile = null;
    if (!user.error && user.data.user) {
      const { data: userProfile } = await supabase
        .from("profiles")
        .select("dealership_id, role")
        .eq("id", user.data.user.id)
        .single();
      profile = userProfile;
    }

    // Helper function to redirect based on user role
    const redirectBasedOnRole = (profile: any) => {
      if (profile?.role === "manager") {
        return NextResponse.redirect(new URL("/dashboard", request.url));
      } else {
        return NextResponse.redirect(new URL("/sales-assist-form", request.url));
      }
    };

    // For onboarding routes, check if user is authenticated and hasn't completed onboarding
    if (isOnboardingRoute && !user.error) {
      // If user has completed onboarding, redirect to appropriate dashboard
      if (profile && profile.dealership_id) {
        return redirectBasedOnRole(profile);
      }
      
      // Allow access to onboarding routes for authenticated users who haven't completed onboarding
      return response;
    }

    // If user is authenticated and trying to access auth pages, redirect based on onboarding status
    if (isAuthPage && !user.error) {
      if (profile && profile.dealership_id) {
        // User has completed onboarding, redirect to dashboard
        return redirectBasedOnRole(profile);
      } else {
        // User hasn't completed onboarding, redirect to path-selection
        return NextResponse.redirect(new URL("/path-selection", request.url));
      }
    }

    // Redirect root to sign-in if not authenticated, or appropriate page if authenticated
    if (request.nextUrl.pathname === "/") {
      if (user.error) {
        return NextResponse.redirect(new URL("/sign-in", request.url));
      } else {
        if (profile && profile.dealership_id) {
          // User has completed onboarding
          return redirectBasedOnRole(profile);
        } else {
          // User hasn't completed onboarding
          return NextResponse.redirect(new URL("/path-selection", request.url));
        }
      }
    }

    return response;
  } catch (e) {
    // If you are here, a Supabase client could not be created!
    // This is likely because you have not set up environment variables.
    // Check out http://localhost:3000 for Next Steps.
    return NextResponse.next({
      request: {
        headers: request.headers,
      },
    });
  }
};
