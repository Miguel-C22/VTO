'use server'

import { getAuth } from "@/utils/supabase/auth/server";
import { createClient } from "@/utils/supabase/client";

export default async function getUserData() {
  const supabase = await createClient();
  const auth = await getAuth(); 
  const authUser = (await auth.getUser()).data.user;

  const { data, error } = await supabase
  .from('user_roles_with_names')
  .select('role_name')
  .eq('user_id', authUser?.id);

  return { data, authUser }
}