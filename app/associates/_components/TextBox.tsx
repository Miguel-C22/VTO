"use client";

import { CommentContext } from "@/context/CommentContext";
import React, { ChangeEvent, useContext } from "react";

const textAreaStyle = `w-full p-2 bg-white shadow-sm rounded-md border border-black focus:border focus:border-black focus:outline-none`;

function TextBox() {
  const {comment, setComment} = useContext(CommentContext)

  const handleOnChange = (e: ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
    setComment(e.target.value)
  }

  return (
      <textarea
        onChange={handleOnChange}
        value={comment}
        id="comment-box"
        className={textAreaStyle}
        placeholder="Comment"
      ></textarea>
  );
}

export default TextBox;