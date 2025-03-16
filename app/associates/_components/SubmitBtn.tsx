'use client';
import React from 'react';
import useSendSubmission from '../_hooks/useSendSubmission';
import useSubmitSelectedChoices from '../_hooks/useSubmitSelectedChoices';

const buttonClass = "bg-[#274c77] text-white w-full max-w-screen-xl py-3 px-6 rounded-lg font-semibold text-lg transition-transform duration-300 ease-in-out transform hover:scale-105 hover:bg-[#1e3c5d] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#274c77]";
const errorAlertClass = "border-[1px] border-red-500 text-red-500 bg-transparent rounded-lg p-4";
const successAlertClass = "border-[1px] border-green-500 text-green-500 bg-transparent rounded-lg p-4";


function SubmitBtn() {
  const { sendSubmission, loading, error, success } = useSendSubmission(); 
  const { submitSelectedChoices } = useSubmitSelectedChoices()
  
  return (
    <div className='w-full flex flex-col gap-4'>
      <button
        className={buttonClass}
        onClick={() => {
          submitSelectedChoices()
          sendSubmission();
        }}
      >
        {loading ? "Sending...": "Submit"}
      </button>
      {error && 
        <div role="alert" className={errorAlertClass}>
          <span>Error! Failed to send</span>
        </div>
      }
      {success && 
        <div role="alert" className={successAlertClass}>
          <span>Submission sent successfully! </span>
        </div>
      }
    </div>
  );
}

export default SubmitBtn;