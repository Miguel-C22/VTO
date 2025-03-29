
import { BASE_URL } from '@/constants/global';
import React, { useState } from 'react';

const ResetAllChoicesButton = () => {
  const [loading, setLoading] = useState(false);

  const resetAllChoices = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${BASE_URL}/api/reset-choices-selected`, {
        method: 'PATCH',  
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();

      if (response.ok) {
        alert(result.message);
      } else {
        alert(result.error || 'Failed to reset choices');
      }
    } catch (error) {
      alert('Error resetting choices');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center mt-20 gap-4">
      <button 
        onClick={resetAllChoices} 
        disabled={loading}
        className={`btn btn-primary ${loading ? 'btn-disabled' : ''} btn-lg rounded-lg`}
      >
        {loading ? 'Resetting all choices...' : "Reset All Users' Choices"}
      </button>
      <p className="text-sm text-gray-600 bg-gray-100 p-2 rounded-lg shadow">
        All choices that have been selected will reset to 0.
      </p>
    </div>
  );
};

export default ResetAllChoicesButton;