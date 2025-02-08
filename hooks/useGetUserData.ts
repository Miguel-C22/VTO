import React, { useEffect, useState } from 'react'
import getUserData from '@/utils/getUserData';

// Used for Client Side
// If you need to get users email and role on the server side go to utils/getUserData.ts

function useGetUserData() {
    const [userEmail, setUserEmail] = useState<any>(null);
    const [roleName, setRoleName] = useState<any | null>(null);
    const [error, setError] = useState<any>(null);

    useEffect(() => {
        async function fetchRole() {
          try {
            const { data, authUser } = await getUserData();
            if (data) {
                setRoleName(data[0].role_name);
                setUserEmail(authUser?.email)
            }
          } catch (error) {
            setError(error)
          }
        }
    
        fetchRole();
      }, []); 
  

    return {userEmail, roleName, error}

}

export default useGetUserData