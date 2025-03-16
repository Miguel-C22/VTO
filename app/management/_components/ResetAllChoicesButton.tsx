
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
    <button onClick={resetAllChoices} disabled={loading}>
      {loading ? 'Resetting all choices...' : 'Reset All Users\' Choices'}
    </button>
  );
};

export default ResetAllChoicesButton;