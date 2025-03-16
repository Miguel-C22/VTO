"use client";

import React, { createContext, useState } from "react";

interface CommentContextType {
    comment: string;
    setComment: React.Dispatch<React.SetStateAction<string>>;
}

const defaultContextValue: CommentContextType = {
    comment: "",
    setComment: () => {}
};

export const CommentContext = createContext<CommentContextType>(defaultContextValue);

export const CommentProvider = ({ children }: { children: React.ReactNode }) => {
  const [comment, setComment] = useState<string>("");

  const contextValue = {
    comment, 
    setComment
  };

  return (
    <CommentContext.Provider value={contextValue}>
      {children}
    </CommentContext.Provider>
  );
};