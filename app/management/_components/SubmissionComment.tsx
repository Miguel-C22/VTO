import React from "react";

const commentStyle = `max-w-lg w-full p-4 bg-gray-100 shadow-md rounded-lg 
border border-gray-300 text-gray-800 text-lg leading-relaxed 
break-words overflow-hidden max-h-60 overflow-y-auto`

type SubmissionCommentProps = {
  usersSubmission: any;
  submission: any[];
};

function SubmissionComment({ usersSubmission, submission }: SubmissionCommentProps) {
  return (
    <div className="flex justify-center w-full p-6">
      {submission
        .filter((sub) => sub.user_id === usersSubmission.user_id)
        .map((sub) => (
          <p
            key={sub.user_id}
            id="comment-box"
            className={commentStyle}
          >          
            {sub.comment == "" ? "No comment" : sub.comment} 
          </p>
        ))}
    </div>
  );
}

export default SubmissionComment;