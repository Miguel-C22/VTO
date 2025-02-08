import { User as SupabaseUser } from "@supabase/supabase-js";
import { createClient } from "../server";

export async function getAuth() {
  const supabase = await createClient(); 
  return supabase.auth;
}

export const getUser = async () => {
  const auth = await getAuth(); 
  const authUser = (await auth.getUser()).data.user;
  if (!authUser) return null;

  const user: SupabaseUser = {
    ...authUser
  };

  return user;
};