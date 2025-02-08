import React from 'react'
import { employees }from '@/utils/mockData'
import { IoMdNotificationsOutline } from "react-icons/io";
import Selectors from '@/components/Selectors/Selectors';
import TextBox from '@/components/TextBox/TextBox';

function Tables() {
  return (
    <div className="overflow-x-none">
        <div className={employees.length > 8 ? "overflow-y-auto max-h-[500px]" : ""}>
            <table className="table">
                {/* head */}
                <thead>
                    <tr className='text-black'>
                        <th>Name</th>
                        <th>Occupation</th>
                        <th></th>
                    </tr>
                </thead>  
                {employees.map((data, index) => (
                    <tbody key={data.id}>
                    {/* rows*/}
                        <tr>
                            <td>
                                <div className="flex items-center gap-3">
                                    <div className="avatar">
                                        <div className="mask mask-squircle h-12 w-12">
                                            <img
                                            src={data.profilePicture}
                                            alt="Avatar Tailwind CSS Component" />
                                        </div>
                                    </div>
                                    <div>
                                        <div className="font-bold">{data.name}</div>
                                    </div>
                                </div>
                            </td>
                            <td>
                                {data.occupation}
                            </td>
                            <th>
                                <button className="btn btn-ghost btn-xs">
                                    <div className="indicator">
                                        <span className="indicator-item badge-success h-2 w-2 rounded-lg"></span>
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
            {employees.map((data, index) => (
                <React.Fragment key={index}>
                <input type="checkbox" id={`modal_${index}`} className="modal-toggle" />
                <div className="modal" role="dialog">
                    <div className="modal-box bg-white">
                        <div className='flex flex-col gap-5'>
                            <h3 className="text-lg font-bold text-center">{data.name}</h3>
                            <Selectors/>
                            <TextBox />
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