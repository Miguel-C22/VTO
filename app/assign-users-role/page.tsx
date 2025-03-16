'use client'

import React, { useEffect, useState } from 'react';
import assignUsersRole from '@/utils/assignUsersRole';
import { useRouter } from 'next/navigation';

function Page() {
    const router = useRouter();
    const [loading, setLoading] = useState(true); 
    const [roleAssigned, setRoleAssigned] = useState(false); // State to track if the role has been assigned

    useEffect(() => {
        const assignRole = async () => {
            const success = await assignUsersRole(); // Call assignUserRole and get the result
            setRoleAssigned(success); 
            setLoading(false);

            if (success) {
                router.push('/associates'); // Redirect to dashboard if successful
            } else {
                router.push('/error'); // Redirect to error page if role assignment fails
            }
        };

        assignRole();
    }, [router]);

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen bg-gray-100">
              <div className="text-center">
                <span className="loading loading-spinner loading-lg text-blue-500"></span>
                <h2 className="mt-4 text-xl text-gray-700 font-semibold">Assigning your role...</h2>
                <p className="mt-2 text-sm text-gray-500">Please wait while we set up your account.</p>
              </div>
            </div>
          );
    }

    return null;
}

export default Page;