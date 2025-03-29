
import { useContext } from 'react';
import { SubmissionsContext } from '@/context/SubmissionsContext';

function useNotifyUpdate() {
    const {setSubmissions } = useContext(SubmissionsContext)

    const handleNotifyUpdate = async (userId: string) => {
        // Optimistically update the UI
        setSubmissions((prevSubmissions) =>
          prevSubmissions.map((submission) =>
            submission.user_id === userId ? { ...submission, notify: false } : submission
          )
        );
    
        // Make the API request
        const response = await fetch(`/api/update-notify`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ user_id: userId }),
        });

        if (!response.ok) {
          // Revert UI update if the request fails
          setSubmissions((prevSubmissions) => [...prevSubmissions.map(submission => 
            submission.user_id === userId ? { ...submission, notify: false } : submission
          )]);
        }
      };

  return { handleNotifyUpdate }
}

export default useNotifyUpdate