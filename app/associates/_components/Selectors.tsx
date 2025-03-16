"use client";
import React, { useContext } from "react";
import { Choice, ChoicesContext } from "@/context/ChoicesContext";

const selectorContainer = `w-full mt-40 flex flex-col items-center gap-4`;
const baseButtonClasses = "w-full py-3 px-6 rounded-lg font-semibold text-lg transition-all duration-200 ease-in-out";
const selectedButtonClasses = "bg-green-600 text-white shadow-md border border-green-700 hover:bg-green-700 focus:outline-none focus:ring-green-500 ";
const defaultButtonClasses = "bg-transparent text-black border border-black hover:bg-gray-200 focus:outline-none focus:ring-black ";

const Selectors = () => {
  const { selectedChoices, setSelectedChoices, choices } = useContext(ChoicesContext);
  
  const handleButtonClick = (id: string, choice: string) => {
    setSelectedChoices((prevSelectedButtons: Choice[]) => {
      const buttonIndex = prevSelectedButtons.findIndex((button) => button.id === id);
      if (buttonIndex === -1) {
        return [...prevSelectedButtons, { id, choice }];
      } else {
        return prevSelectedButtons.filter((button) => button.id !== id);
      }
    });
  };

  return (
    <div className={selectorContainer}>
      {choices.map((data) => (
        <button
          key={data.id}
          onClick={() => handleButtonClick(data.id, data.choice)}
          className={`${baseButtonClasses} 
          ${selectedChoices.some((btn) => btn.id === data.id) 
            ? selectedButtonClasses : defaultButtonClasses}`}
        >
          {data.choice}
        </button>
      ))}
    </div>
  );
};

export default Selectors;