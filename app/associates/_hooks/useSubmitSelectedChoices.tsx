import { BASE_URL } from '@/constants/global';
import { ChoicesContext } from '@/context/ChoicesContext';
import useGetUserData from '@/hooks/useGetUserData';
import React, { useContext, useEffect } from 'react'

function useSubmitSelectedChoices() {
    const { selectedChoices, setSelectedChoices } = useContext(ChoicesContext);
    const { userId } = useGetUserData();

    const submitSelectedChoices = async () => {
        try {
          const response = await fetch (`${BASE_URL}/api/choices-selected`, {
            method: "POST",
            headers: {
              'Content-Type': "application/json",
            },
            body: JSON.stringify({
              user_id: userId,
              new_choices: selectedChoices.map((data) => ({
                choiceId: data.id,
                amountSelected: 1
              }))
            })
          })
          if (!response.ok) {
            throw new Error('Failed to post data');
          }
          const result = await response.json();
          // setResponseData(result);
          console.log(result)
          setSelectedChoices([])
        } catch (error) {
          // setError(err.message || 'Something went wrong');
          console.log("error")
        }
      }

    return { submitSelectedChoices } 
}

export default useSubmitSelectedChoices