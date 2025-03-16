"use client"

import React, { useContext, useEffect, useState } from 'react'
import { IoMdNotificationsOutline } from "react-icons/io";
import Selectors from '@/app/associates/_components/Selectors';
import TextBox from '@/app/associates/_components/TextBox';
import getAllUsers from '@/utils/getAllUsers';
import getAllUsersSubmissions from '@/utils/getUsersSubmission';
import { ChoicesContext } from '@/context/ChoicesContext';
import { BASE_URL } from '@/constants/global';

function Tables() {
    const [associates, setAssociates] = useState<any[]>([])
    const [submissions, setSubmissions] = useState<any[]>([])
    const { choices } = useContext(ChoicesContext);


    useEffect(() => {
        async function fetchAssociates() {
            const data = await getAllUsers();
            if (data?.associates) {
              setAssociates(data.associates);
            }
          }
          
          fetchAssociates();
          
        async function fetchSubmissions() {
            const data = await getAllUsersSubmissions();
            if (data?.submissions) {
             setSubmissions(data.submissions)
            }
          }
          
        fetchSubmissions();
      }, [])

      useEffect(() => {
        console.log(submissions)
        console.log(associates)
        console.log(choices)
      }, [associates, submissions, choices])

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
    
        const data = await response.json();
        console.log(data);
    
        if (!response.ok) {
          // Revert UI update if the request fails
          setSubmissions((prevSubmissions) =>
            prevSubmissions.map((submission) =>
              submission.user_id === userId ? { ...submission, notify: true } : submission
            )
          );
        }
      };

  return (
    <div className="overflow-x-none">
        <div className={associates.length > 8 ? "overflow-y-auto max-h-[500px]" : ""}>
            <table className="table">
                {/* head */}
                <thead>
                    <tr className='text-black'>
                        <th>Name</th>
                        <th></th>
                        <th></th>
                    </tr>
                </thead>  
                {associates.map((data, index) => (
                    <tbody key={data.user_id}>
                    {/* rows*/}
                        <tr>
                            <td>
                                <div className="flex items-center gap-3">
                                    <div className="avatar">
                                        <div className="mask mask-squircle h-12 w-12">
                                            <img
                                            src="https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png"
                                            alt="Avatar Tailwind CSS Component" />
                                        </div>
                                    </div>
                                    <div>
                                        <div className="font-bold">{data.display_name ? data.display_name : "Missing Name"}</div>
                                    </div>
                                </div>
                            </td>
                            <td>
                                {data.occupation}
                            </td>
                            <th>
                                <button onClick={() => handleNotifyUpdate(data.user_id)} className="btn btn-ghost btn-xs">
                                    <div className="indicator">
                                    {submissions
                                        .filter((submission) => submission.user_id === data.user_id)
                                        .map((submission) => ( 
                                            <span className={`indicator-item ${submission.notify ? "badge-success" : ""}  h-2 w-2 rounded-lg`}></span>
                                        ))}
                                       
                                        <label htmlFor={`modal_${index}`} className="grid h-5 w-5">
                                            <IoMdNotificationsOutline size={24} />
                                        </label>
                                    </div>
                                </button>
                            </th>
                        </tr>
                    </tbody>
                ))}
                {/* foot */}
                <tfoot>
                    <tr>
                    </tr>
                </tfoot>
            </table>
            {associates.map((data, index) => (
                <React.Fragment key={data.user_id}>
                <input type="checkbox" id={`modal_${index}`} className="modal-toggle" />
                <div className="modal" role="dialog">
                    <div className="modal-box bg-white">
                        <div className='flex flex-col gap-5'>
                            <h3 className="text-lg font-bold text-center">{data.display_name ? data.display_name : "Missing Name"}</h3>
                            {submissions
                            .filter((submission) => submission.user_id === data.user_id)
                            .map((submission) => (
                                <div key={submission.id} className="flex flex-col items-center gap-4">
                                {choices
                                    .filter((choice) => 
                                    submission.choices.some((sChoice: any) => sChoice.choiceId === choice.id)
                                    )
                                    .map((matchedChoice) => (
                                            <button 
                                                key={data.id}
                                                className={`btn-custom  "btn-default"}`}
                                            >
                                                {matchedChoice.choice}
                                            </button>
                                    ))
                                }
                                    <div className="flex justify-center w-full">
                                        <textarea
                                            value={submission.comment}
                                            id="comment-box"
                                            className="w-[40em] p-2 bg-white shadow-sm rounded-md border-2 border-black focus:border-2 focus:border-black focus:outline-none"
                                            placeholder="Comment"
                                        ></textarea>
                                    </div>
                                </div>
                            ))}
                            {/* <Selectors/> */}
                            
                            {/* <TextBox /> */}
                        </div>
                    </div>
                    <label className="modal-backdrop" htmlFor={`modal_${index}`}>
                        Close
                    </label>
                </div>
                </React.Fragment>
            ))}
        </div>
    </div>
  )
}

export default Tables