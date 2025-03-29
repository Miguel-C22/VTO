'use client'

import { createContext, useState, useEffect } from "react";
import getAllUsersSubmissions from "@/utils/getUsersSubmission";

interface SubmissionsContextType {
  submissions: any[];
  fetchSubmissions: () => Promise<void>;
  setSubmissions: React.Dispatch<React.SetStateAction<any[]>>;
}

const defaultContextValue: SubmissionsContextType = {
    submissions: [], 
    fetchSubmissions: async () => {},
    setSubmissions: () => {},
};

export const SubmissionsContext = createContext<SubmissionsContextType>(defaultContextValue);

export function SubmissionsProvider({ children }: { children: React.ReactNode }) {
  const [submissions, setSubmissions] = useState<any[]>([]);

  async function fetchSubmissions() {
    const data = await getAllUsersSubmissions();
    if (data?.submissions) {
      setSubmissions(data.submissions);
    }
  }

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const contextValue = {
    submissions, 
    fetchSubmissions, 
    setSubmissions 
  }

  return (
    <SubmissionsContext.Provider value={contextValue}>
      {children}
    </SubmissionsContext.Provider>
  );
}
