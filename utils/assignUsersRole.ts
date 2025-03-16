'use server'

import { BASE_URL } from "@/constants/global";
import { createClient } from "@/utils/supabase/server";

async function assignUserRole() {

    const supabase = await createClient();

    try {
      // Get the session using the updated method
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session) {
        throw new Error('User is not logged in');
      }
  
      const token = session.access_token; // Get the access token
  
      // Get the user data from Supabase
      const { data: { user }, error: userError } = await supabase.auth.getUser();
  
      if (userError || !user) {
        throw new Error('User data not found');
      }
  
      // Call your backend API and pass the user data in the request body
      const response = await fetch(`${BASE_URL}/api/assign-users-role`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,  // Pass the token here
        },
        body: JSON.stringify({ user }),  // Pass the user object here
      });
     
      const data = await response.json();
  
      if (data.error) {
        console.error('Error assigning role:', data.error);
        return false
      } else {
        console.log('Role assigned successfully:', data);
        return true
      }
    } catch (error) {
      console.error('Error in assigning role:', error);
      return false
    }
  }

  export default assignUserRole