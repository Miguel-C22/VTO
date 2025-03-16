import { BASE_URL } from '@/constants/global';
import { ChoicesContext } from '@/context/ChoicesContext';
import { CommentContext } from '@/context/CommentContext';
import useGetUserData from '@/hooks/useGetUserData';
import React, { useContext, useState } from 'react'
import { fetchManager } from '../_utils/fetchManager';

function useSendSubmission() {
    const { userId } = useGetUserData();
    const { selectedChoices } = useContext(ChoicesContext);
    const { comment, setComment } = useContext(CommentContext);
    const [loading, setLoading] = useState<boolean>(false)
    const [error, setError] = useState<boolean>(false)
    const [success, setSuccess] = useState<boolean>(false)

    const sendEmail = async (managerEmail: string, selectedChoices: any[], comment: string) => {
        try {
          const emailResponse = await fetch(`${BASE_URL}/api/send`, {
            method: "POST",
            headers: {
              'Content-Type': "application/json",
            },
            body: JSON.stringify({
              managerEmail,
              selectedChoices,
              comment,
            }),
          });
      
          if (!emailResponse.ok) {
            throw new Error('Failed to send email');
          }
        } catch (error) {
          console.log("Error sending email:", error);
        }
      };
    
      const sendSubmission = async () => {
        setError(false);
        setLoading(true)
        try {
          const response = await fetch (`${BASE_URL}/api/user-submission`, {
            method: "POST",
            headers: {
              'Content-Type': "application/json",
            },
            body: JSON.stringify({
              user_id: userId,
              new_choices: selectedChoices.map((data) => ({
                choiceId: data.id,
              })), 
              comment: comment,
              notify: true
            })
          })
          if (!response.ok) {
            throw new Error('Failed to post data');
          }
          const manager = await fetchManager();
    
          if (manager) {
            await sendEmail(manager, selectedChoices, comment);
          }
    
          setComment("")
          setLoading(false)
          setSuccess(true)
          setTimeout(() => {
            setSuccess(false)
          }, 5000)
        } catch (error) {
          setError(true);
          setComment("")
        }
      }

      return { sendSubmission, loading, error, success};
}

export default useSendSubmission