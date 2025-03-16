'use server'

import { createClient } from "@/utils/supabase/client";

const getAllUsersSubmissions = async () => {
  try {
    const supabase = createClient(); 
    
    const { data: submissions, error } = await supabase
      .from("users_submission")
      .select("*");

    if (error) {
      throw new Error(`Failed to fetch all associates: ${error.message}`);
    }

    return { submissions }
  } catch (error) {
    console.error("Error fetching associates:", error);
    return { associates: [] };
  }
}

export default getAllUsersSubmissions