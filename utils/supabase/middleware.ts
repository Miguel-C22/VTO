import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";
import getUserData from "../getUserData";

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
              request.cookies.set(name, value),
            );
            response = NextResponse.next({
              request,
            });
            cookiesToSet.forEach(({ name, value, options }) =>
              response.cookies.set(name, value, options),
            );
          },
        },
      },
    );

    // This will refresh session if expired - required for Server Components
    // https://supabase.com/docs/guides/auth/server-side/nextjs


    // All this is controlling what routes the user has access to depending on there role.
    
    // const user = await supabase.auth.getUser();
    const { data, authUser } = await getUserData();

    const publicRoutes = ["/sign-in", "/sign-up", "/forgot-password", "/reset-password"];

    // Get the requested path
    const requestedPath = request.nextUrl.pathname;

    // **Allow access if the requested route is public**
    if (publicRoutes.includes(requestedPath)) {
      return NextResponse.next();
    }

    const rolePermissions: Record<string, string[]> = {
      admin: ["/associates", "/management",],
      associate: ["/associates"],
      manager: ["/management", "/management/associates", "/management/history", "/management/history", "/associates" ],
    };
    
    if (!data || data.length === 0 || !data[0]?.role_name) {
      return NextResponse.redirect(new URL("/sign-in", request.url));
    }
    
    if(data){
      const userRole = data[0]?.role_name; 
      const requestedPath = request.nextUrl.pathname;
      try {
        const allowedRoutes = rolePermissions[userRole] || [];
        if (!allowedRoutes.includes(requestedPath)) {
          return NextResponse.redirect(new URL("/sign-in", request.url));
        }
    
        return NextResponse.next();
      } catch (error) {
        console.error("Middleware error:", error);
        return NextResponse.redirect(new URL("/sign-in", request.url));
      }
    }

    

    // // protected routes
    // if (request.nextUrl.pathname.startsWith("/protected") && user.error) {
    //   return NextResponse.redirect(new URL("/sign-in", request.url));
    // }

    // if (request.nextUrl.pathname === "/" && !user.error) {
    //   return NextResponse.redirect(new URL("/protected", request.url));
    // }

    // return response;
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
