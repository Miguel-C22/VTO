'use server'

import { createClient } from "@/utils/supabase/client";

const getAllUsers = async () => {
  try {
    const supabase = createClient(); 
    
    const { data: roles, error } = await supabase
      .from("user_roles_view")
      .select("*");

    if (error) {
      throw new Error(`Failed to fetch all associates: ${error.message}`);
    }

    const associates = roles.filter((role) => role.role_name === "associate");
    const manager = roles.filter((role) => role.role_name === "manager");

    return { associates, manager };
  } catch (error) {
    console.error("Error fetching associates:", error);
    return { associates: [] };
  }
}

export default getAllUsers