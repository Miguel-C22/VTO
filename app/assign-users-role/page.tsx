'use client'

import React, { useEffect, useState } from 'react';
import { CircularProgress } from '@mui/material';
import assignUsersRole from '@/utils/assignUsersRole';
import { useRouter } from 'next/navigation';

function Page() {
    const router = useRouter();
    const [loading, setLoading] = useState(true); // State to manage loading state
    const [roleAssigned, setRoleAssigned] = useState(false); // State to track if the role has been assigned

    useEffect(() => {

        const assignRole = async () => {
            const success = await assignUsersRole(); // Call assignUserRole and get the result
            setRoleAssigned(success); // Set the role assignment result
            setLoading(false); // Stop loading after role assignment

            if (success) {
                router.push('/associates'); // Redirect to dashboard if successful
            } else {
                router.push('/error'); // Redirect to error page if role assignment fails
            }
        };

        assignRole(); // Invoke the async function inside useEffect
    }, [router]);

    // If loading, show a circular progress spinner
    if (loading) {
        return <CircularProgress />;
    }

    return null; // You can customize what to return once the role assignment is complete
}

export default Page;