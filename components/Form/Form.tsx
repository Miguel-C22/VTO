'use client'
import React, { useEffect, useState } from 'react';
import { FormMessage } from '../form-message';

interface FormProps {
    actionName: string;
    submitFn: (formData: FormData) => Promise<any>; 
    searchParamMessage: any;
}

const Form = ({ actionName, submitFn, searchParamMessage }: FormProps) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [formData, setFormData] = useState<Record<string, string>>({
        first_name: '',
        last_name: '',
        email: '',
        password: '',
        confirmPassword: '',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({
          ...prevData,
          [name]: value,
        }));
      };
    
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null); // Reset previous error
    
        const form = new FormData();
        Object.keys(formData).forEach((key) => {
          if (formData[key]) form.append(key, formData[key] as string);
        });
    
        try {
          const result = await submitFn(form);
    
          if (result.errorMessage) {
            setError(result.errorMessage); 
          }
        } finally {
          setLoading(false);
        }
      };

      return (
        <form
          className="flex flex-col gap-4 w-full max-w-md mx-auto p-6 border rounded-lg shadow-lg"
          onSubmit={handleSubmit}
        >
          <h2 className="text-2xl font-semibold text-center">{actionName}</h2>
    
          {(actionName === "Forgot Password" || actionName === "Reset Password") && (
            <a href="/sign-in" className="text-blue-500 hover:underline text-sm self-center">
              Back to Sign In
            </a>
          )}
    
          {actionName === "Reset Password" ? (
            <>
              <div className="flex flex-col">
                <label htmlFor="first_name" className="text-sm font-medium text-gray-700 mb-2">
                  First Name
                </label>
                <input
                  id="first_name"
                  name="first_name"
                  type="text"
                  required
                  value={formData.first_name || ""}
                  onChange={handleChange}
                  className="border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
    
              <div className="flex flex-col">
                <label htmlFor="last_name" className="text-sm font-medium text-gray-700 mb-2">
                  Last Name
                </label>
                <input
                  id="last_name"
                  name="last_name"
                  type="text"
                  required
                  value={formData.last_name || ""}
                  onChange={handleChange}
                  className="border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
    
              <div className="flex flex-col">
                <label htmlFor="password" className="text-sm font-medium text-gray-700 mb-2">
                  New password
                </label>
                <input
                  type="password"
                  name="password"
                  placeholder="New password"
                  required
                  value={formData.password || ""}
                  onChange={handleChange}
                  className="border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
    
              <div className="flex flex-col">
                <label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700 mb-2">
                  Confirm password
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  placeholder="Confirm password"
                  required
                  value={formData.confirmPassword || ""}
                  onChange={handleChange}
                  className="border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </>
          ) : actionName === "Forgot Password" ? (
            <div className="flex flex-col">
              <label htmlFor="email" className="text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={formData.email || ""}
                onChange={handleChange}
                className="border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          ) : (
            <div className="flex flex-col">
              <label htmlFor="email" className="text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={formData.email || ""}
                onChange={handleChange}
                className="border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          )}
    
          {actionName === "Sign Up" && (
            <>
              <div className="flex flex-col">
                <label htmlFor="first_name" className="text-sm font-medium text-gray-700 mb-2">
                  First Name
                </label>
                <input
                  id="first_name"
                  name="first_name"
                  type="text"
                  required
                  value={formData.first_name || ""}
                  onChange={handleChange}
                  className="border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
    
              <div className="flex flex-col">
                <label htmlFor="last_name" className="text-sm font-medium text-gray-700 mb-2">
                  Last Name
                </label>
                <input
                  id="last_name"
                  name="last_name"
                  type="text"
                  required
                  value={formData.last_name || ""}
                  onChange={handleChange}
                  className="border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </>
          )}
    
          {actionName !== "Forgot Password" && actionName !== "Reset Password" && (
            <div className="flex flex-col">
              <label htmlFor="password" className="text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={formData.password || ""}
                onChange={handleChange}
                className="border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          )}
    
          <div className="flex justify-between">
            {actionName === "Sign Up" ? (
              <a href="/sign-in" className="text-sm text-blue-500 mt-2 self-end hover:underline">
                Sign In
              </a>
            ) : (
              <>
                <a href="/sign-up" className="text-sm text-blue-500 mt-2 self-end hover:underline">
                  Sign Up
                </a>
                <a href="/forgot-password" className="text-sm text-blue-500 mt-2 self-end hover:underline">
                  Forgot Password?
                </a>
              </>
            )}
          </div>
    
          <button
            type="submit"
            className="bg-blue-500 text-white p-2 rounded-md hover:bg-blue-600 transition duration-200"
            disabled={loading} // Disable the button while loading
          >
            {loading ? "Submitting..." : actionName}
          </button>
    
          {error && (
            <div className="mt-4 p-2 bg-red-200 text-red-700 border border-red-400 rounded-md">
              {error}
            </div>
          )}
    
          <FormMessage message={searchParamMessage} />
        </form>
      );
};

export default Form;