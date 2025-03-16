'use server'

import React from 'react'
import { FormMessage } from '../form-message';

interface FormProps {
    submitFn: (formData: FormData) => Promise<void>,
    searchParamMessage: any,
}

async function UserSettings({submitFn, searchParamMessage }: FormProps) {
    return (
        <div className="max-w-2xl mx-auto p-6">
            <div className="card bg-white shadow-md border border-gray-200 rounded-lg">
                <div className="card-body p-6">
                    <h2 className="card-title text-2xl font-semibold text-gray-800">Settings</h2>
                    <p className="text-sm text-gray-500">Update your account details below</p>
                    
                    <div className="divider my-3"></div> {/* Subtle Divider */}
    
                    <form className="flex flex-col gap-5">
                        {/* First Name Field */}
                        <div className="form-control">
                            <input
                                id="first_name"
                                name="first_name"
                                type="text"
                                placeholder="First Name"
                                required
                                className="bg-white border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full drop-shadow-md"
                            />
                        </div>
    
                        {/* Last Name Field */}
                        <div className="form-control">
                            <input
                                id="last_name"
                                name="last_name"
                                type="text"
                                placeholder="Last Name"
                                required
                                className="bg-white border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full drop-shadow-md"
                            />
                        </div>
    
                        {/* Submit Button */}
                        <div className="mt-4">
                            <button
                                type="submit"
                                className="bg-blue-500 text-white p-2 rounded-md hover:bg-blue-600 transition duration-200 w-full"
                                formAction={submitFn}
                            >
                                Update
                            </button>
                        </div>
    
                        {/* Form Message */}
                        <FormMessage message={searchParamMessage} />
                    </form>
                </div>
            </div>
        </div>
    );
}

export default UserSettings;