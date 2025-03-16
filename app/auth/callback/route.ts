import { ASSOCIATES } from "@/constants/global";
import getUserData from "@/utils/getUserData";
import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  // The `/auth/callback` route is required for the server-side auth flow implemented
  // by the SSR package. It exchanges an auth code for the user's session.
  // https://supabase.com/docs/guides/auth/server-side/nextjs
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const origin = requestUrl.origin;
  const redirectTo = requestUrl.searchParams.get("redirect_to")?.toString();

  if (code) {
    const supabase = await createClient();
    await supabase.auth.exchangeCodeForSession(code);
  }

  if (redirectTo) {
    return NextResponse.redirect(`${origin}${redirectTo}`);
  }

  const { data } = await getUserData();
  const role = data?.[0]?.role_name;
  
  if(!role){
    return NextResponse.redirect(`${origin}/sign-in`);
  }
  // Redirect based on role
  return NextResponse.redirect(role === ASSOCIATES ? "/associates" : "/management");
}
