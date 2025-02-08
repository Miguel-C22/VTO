'use server'

import React from 'react'
import { FormMessage } from '../form-message';

interface FormProps {
    actionName: string,
    submitFn: (formData: FormData) => Promise<void>,
    searchParamMessage: any,
}

async function Form({ actionName, submitFn, searchParamMessage }: FormProps) {
    return (
        <form  className="flex flex-col gap-4 w-full max-w-md mx-auto p-6 border rounded-lg shadow-lg">
            <h2 className="text-2xl font-semibold text-center">{actionName}</h2>
           
            {( actionName === "Forgot Password" || actionName === "Reset Password") && (
                <a href="/sign-in" className="text-blue-500 hover:underline text-sm self-center">Back to Sign In</a>
            )}
                        
            {actionName === "Reset Password" ? 
                    <>
                        <div className="flex flex-col">
                            <label 
                                htmlFor="password" 
                                className="text-sm font-medium text-gray-700 mb-2"
                                >
                                    New password
                            </label>
                            <input
                                type="password"
                                name="password"
                                placeholder="New password"
                                required
                                className="border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                aria-describedby="password"
                            />
                        </div>   
                        <div className="flex flex-col">
                            <label 
                                htmlFor="confirmPassword" 
                                className="text-sm font-medium text-gray-700 mb-2"
                                >
                                    Confirm password
                                </label>
                            <input
                                type="password"
                                name="confirmPassword"
                                placeholder="Confirm password"
                                required
                                className="border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                aria-describedby="password"
                            />
                         </div>
                    </>   
                :
                    <div className="flex flex-col">
                        <label htmlFor="email" className="text-sm font-medium text-gray-700 mb-2">Email Address</label>
                        <input
                            id="email"
                            name="email"
                            type="email"
                            required
                            className="border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            aria-describedby="email"
                        />
                     </div>                 
            }
            
            {actionName !== "Forgot Password" && actionName !== "Reset Password" && (
                <div className="flex flex-col">
                    <label 
                        htmlFor="password" 
                        className="text-sm font-medium text-gray-700 mb-2"
                    >
                        Password
                    </label>
                    <input
                        id="password"
                        name="password"
                        type="password"
                        required
                        className="border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        aria-describedby="password"
                    />
                    <div className='flex justify-between'>
                        {actionName === "Sign Up" ?
                                <a href="/sign-in" className="text-sm text-blue-500 mt-2 self-end hover:underline">
                                    Sign In
                                </a>
                            :
                                <>
                                    <a href="/sign-up" className="text-sm text-blue-500 mt-2 self-end hover:underline">
                                        Sign Up
                                    </a>
                                    <a href="/forgot-password" className="text-sm text-blue-500 mt-2 self-end hover:underline">
                                        Forgot Password?
                                    </a>
                                </>
                        }
                    </div>
                </div>
            )}

            <button
                type="submit"
                className="bg-blue-500 text-white p-2 rounded-md hover:bg-blue-600 transition duration-200"
                formAction={submitFn}
            >
                {actionName}
            </button>

            <FormMessage message={searchParamMessage} />
        </form>
    );
}

export default Form;