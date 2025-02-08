"use client";
import React from "react";

function TextBox() {
  return (
    <div className="flex justify-center w-full">
      <textarea
        id="comment-box"
        className="w-[40em] p-2 bg-white shadow-sm rounded-md border-2 border-black focus:border-2 focus:border-black focus:outline-none"
        placeholder="Comment"
      ></textarea>
    </div>
  );
}

export default TextBox;