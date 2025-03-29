"use client"

import React, { useContext } from 'react'
import { IoMdNotificationsOutline } from "react-icons/io";
import { v4 as uuidv4 } from 'uuid';
import SubmissionModal from './SubmissionModal';
import { SubmissionsContext } from '@/context/SubmissionsContext';
import Loader from '@/components/Loader/Loader';

interface SubmissionModalProps {
    handleNotifyUpdate: (userId: string) => void
    associates: any[]
    loading: boolean
}

function Tables({ handleNotifyUpdate, associates, loading }: SubmissionModalProps) {
    const { submissions } = useContext(SubmissionsContext)

  return (
    <div className="overflow-x-none">
        <div className={associates.length > 8 ? "overflow-y-auto max-h-[500px]" : ""}>
            {loading ? <Loader /> : 
                <table className="table table-zebra">
                    {/* head */}
                    <thead>
                        <tr className='text-black'>
                            <th></th>
                            <th>Name</th>
                        </tr>
                    </thead>
                        {/* rows*/}  
                    <tbody>
                        {associates.map((data, index) => (
                            <tr key={data.user_id}>
                                <th>{index + 1}</th>
                                <td className="font-bold">{data.display_name ? data.display_name : "Missing Name"}</td>
                                <td>{data.occupation}</td>
                                <td>
                                    <button onClick={() => handleNotifyUpdate(data.user_id)} className="btn btn-ghost btn-xs">
                                        <div className="indicator">
                                        {submissions
                                            .filter((submission) => submission.user_id === data.user_id)
                                            .map((submission) => 
                                            <span 
                                                key={uuidv4()} 
                                                className={`indicator-item ${submission.notify ? "status-success" : ""} 
                                                h-2 w-2 rounded-lg`}
                                            >
                                            </span>
                                            )}
                                            <label htmlFor={`modal_${index}`} className="grid h-5 w-5">
                                                <IoMdNotificationsOutline size={24} />
                                            </label>
                                        </div>
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                    {/* foot */}
                    <tfoot>
                        <tr>
                        </tr>
                    </tfoot>
                </table>
            }
            <SubmissionModal 
                associates={associates} 
                submissions={submissions} 
            />
        </div>
    </div>
  )
}

export default Tables
