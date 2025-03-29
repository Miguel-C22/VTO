import getAllUsers from '@/utils/getAllUsers';
import { useState } from 'react';

function useGetAllUsers() {
    const [associates, setAssociates] = useState<any[]>([])
    const [loading, setLoading] = useState<boolean>(true)

    async function fetchAssociates() {
        const data = await getAllUsers();
        if (data?.associates) {
            setAssociates(data.associates);
            setLoading(false)
        }
    }

    return { fetchAssociates, associates, loading }
}

export default useGetAllUsers