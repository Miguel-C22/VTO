'use server'

import { getAuth } from "@/utils/supabase/auth/server";
import { createClient } from "@/utils/supabase/client";

export default async function getUserData() {
  const supabase = createClient();
  const auth = await getAuth();
  const { data: userData, error: authError } = await auth.getUser();
  
  if (authError || !userData?.user) {
    return { error: "Failed to authenticate user" };
  }
  
  const authUser = userData.user;
  
  try {
    const { data, error } = await supabase
      .from("user_roles_view")
      .select("role_name")
      .eq("user_id", authUser.id);
  
    if (error) {
      console.error("Supabase Error:", error);
      return { error: "Failed to fetch user roles" };
    }
  
    return { data, authUser };
  } catch (error) {
    console.error("Unexpected Error:", error);
    return { error: "An unexpected error occurred while fetching user roles" };
  }
}