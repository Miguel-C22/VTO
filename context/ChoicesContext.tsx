"use client";
import getChoices from "@/utils/getChoices";
import getUsersSelectedChoices from "@/utils/getUsersSelectedChoices";
import React, { createContext, useEffect, useState } from "react";

export interface Choice {
  id: string;
  choice: string;
}

interface ChoicesContextType {
    choices: Choice[];
    setChoices: React.Dispatch<React.SetStateAction<Choice[]>>;
    selectedChoices: Choice[]; 
    setSelectedChoices: React.Dispatch<React.SetStateAction<Choice[]>>;
    loading: boolean;
    setLoading: React.Dispatch<React.SetStateAction<boolean>>;
    associatesSelectedChoices: any[] 
    setAssociatesSelectedChoices: React.Dispatch<React.SetStateAction<any[]>>;
}

const defaultContextValue: ChoicesContextType = {
    choices: [],
    setChoices: () => {},
    selectedChoices: [],
    setSelectedChoices: () => {},
    loading: false, 
    setLoading: () => {},
    associatesSelectedChoices: [], 
    setAssociatesSelectedChoices: () => {},
};

export const ChoicesContext = createContext<ChoicesContextType>(defaultContextValue);

export const ChoicesProvider = ({ children }: { children: React.ReactNode }) => {
  const [choices, setChoices] = useState<Choice[]>([]);
  const [selectedChoices, setSelectedChoices] = useState<Choice[]>([]);
  const [loading, setLoading] = useState<boolean>(true)
  const [associatesSelectedChoices, setAssociatesSelectedChoices] = useState<any[]>([])


  async function fetchAssociatesUserChoices() {
    const data = await getUsersSelectedChoices();
    if (data?.data) {
      setAssociatesSelectedChoices(data.data)
    }
  }

  useEffect(() => {
    // Fetch choices only if it's empty, to avoid unnecessary network requests
    const fetchChoices = async () => {
      if (choices.length === 0) {
        const { choices, error } = await getChoices();
        if (choices) {
          setChoices(choices); 
        } else if (error) {
          console.error(error);
        }
      }
      setLoading(false)
    };

    fetchChoices();
    fetchAssociatesUserChoices()
  }, [choices.length]);

  const contextValue = {
    choices,
    setChoices,
    selectedChoices, 
    setSelectedChoices,
    associatesSelectedChoices, 
    setAssociatesSelectedChoices,
    loading, 
    setLoading
  };

  return (
    <ChoicesContext.Provider value={contextValue}>
      {children}
    </ChoicesContext.Provider>
  );
};