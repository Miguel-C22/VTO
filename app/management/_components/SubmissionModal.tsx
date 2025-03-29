'use client'

import React from 'react'
import { v4 as uuidv4 } from 'uuid';
import SubmissionChoices from './SubmissionChoices';
import SubmissionComment from './SubmissionComment';

interface SubmissionModalProps {
    associates: any[]
    submissions: any[]
}

function SubmissionModal({associates, submissions}: SubmissionModalProps) {
    return (
        <>
            {associates.map((data, index) => (
                <React.Fragment key={data.user_id}>
                    <input type="checkbox" id={`modal_${index}`} className="modal-toggle" />
                    <div className="modal" role="dialog">
                        <div className="modal-box bg-white">
                            <div key={uuidv4()} className='flex flex-col gap-5'>
                                <h3 className="text-lg font-bold text-center">{data.display_name ? data.display_name : "Missing Name"}</h3>
                                <SubmissionChoices usersSubmission={data} submission={submissions}/>
                                <SubmissionComment usersSubmission={data} submission={submissions}/>
                            </div>
                        </div>
                        <label className="modal-backdrop" htmlFor={`modal_${index}`}>
                            Close
                        </label>
                    </div>
                </React.Fragment>
            ))}
        </>
    )
}

export default SubmissionModal