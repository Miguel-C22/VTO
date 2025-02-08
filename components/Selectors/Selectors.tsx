"use client";
import React, { useState } from "react";
import { selectorChoices } from "@/utils/mockData";

const Selectors = () => {
  const [selectedButtons, setSelectedButtons] = useState<{ id: number; choice: string }[]>([]);

  const handleButtonClick = (id: number, choice: string) => {
    setSelectedButtons((prevSelectedButtons) => {
      const buttonIndex = prevSelectedButtons.findIndex((button) => button.id === id);
      if (buttonIndex === -1) {
        return [...prevSelectedButtons, { id, choice }];
      } else {
        return prevSelectedButtons.filter((button) => button.id !== id);
      }
    });
  };

  return (
    <div className="flex flex-col items-center gap-4">
      {selectorChoices.map((data) => (
        <button
          key={data.id}
          onClick={() => handleButtonClick(data.id, data.choice)}
          className={`btn-custom ${selectedButtons.some((btn) => btn.id === data.id) ? "btn-clicked" : "btn-default"}`}
        >
          {data.choice}
        </button>
      ))}
    </div>
  );
};

export default Selectors;