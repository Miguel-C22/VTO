import { ChoicesContext } from '@/context/ChoicesContext';
import React, { useContext } from 'react'
import { v4 as uuidv4 } from 'uuid';

type SubmissionChoicesProps = {
    usersSubmission: any;
    submission: any[];
  };
  
  function SubmissionChoices({ usersSubmission, submission }: SubmissionChoicesProps) {
    const { choices } = useContext(ChoicesContext);

    return (
        <div key={usersSubmission.user_id}>
          {submission
            .filter((sub) => sub.user_id === usersSubmission.user_id)
            .map((sub) => (
              <div key={uuidv4()} className="flex flex-col items-center gap-4 bg-white  ">
                {choices
                  .filter((choice) => sub.choices.some((sChoice: any) => sChoice.choiceId === choice.id))
                  .map((matchedChoice) => (
                    <p
                      key={uuidv4()}
                      className="px-5 py-2 text-white bg-blue-600 rounded-lg"
                    >
                      {matchedChoice.choice}
                    </p>
                  ))}
              </div>
            ))}
        </div>
      );
}


export default SubmissionChoices