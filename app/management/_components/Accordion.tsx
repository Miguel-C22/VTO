'use client'

import React, { useEffect, useState } from 'react'
import getAllUsers from '@/utils/getAllUsers';
import getUsersSelectedChoices from '@/utils/getUsersSelectedChoices';
import getChoices from '@/utils/getChoices';

function Accordion() {
  const [associates, setAssociates] = useState<any[]>([])
  const [associatesSelectedChoices, setAssociatesSelectedChoices] = useState<any[]>([])
  const [choices, setChoices] = useState<any[]>([])

  async function fetchAssociates() {
    const data = await getAllUsers();

    if (data?.associates) {
      setAssociates(data.associates);
    }
  }

  async function fetchAssociatesUserChoices() {
    const data = await getUsersSelectedChoices();
    if (data?.data) {
      setAssociatesSelectedChoices(data.data)
    }
  }

  async function getAllSelectedChoices(){
    const data = await getChoices()

    if (data?.choices) {
      setChoices(data.choices)
    }
  }
  useEffect(() => {        
      getAllSelectedChoices()
      fetchAssociates();
      fetchAssociatesUserChoices()
    }, [])

    useEffect(() => {
      console.log(associates)
    }, [associates])
    
    return (
        <div className="flex flex-col gap-3">
          <div className={associates.length > 6 ? "overflow-y-auto max-h-[700px]" : ""}>
          {associates.map((associate) => (
              <div
                key={associate.user_id}
                className="collapse bg-white border border-gray-300 shadow-lg rounded-lg mb-4"
              >
                <input type="checkbox" className="collapse-checkbox" />
                <div className="collapse-title text-xl font-medium rounded-t-lg p-4">
                  {associate.display_name ? associate.display_name : "Missing Name"}
                </div>
                <div className="collapse-content flex gap-8 flex-wrap rounded-b-lg p-4">
                  {choices.map((choiceData) => {
                    const associateSelection = associatesSelectedChoices.find(
                      (user) => user.user_id === associate.user_id
                    );
                    const choiceAmount = associateSelection?.choices.find(
                      (amount: any) => amount.choiceId === choiceData.id
                    )?.amountSelected || 0;
                      return (
                        <div
                          key={choiceData.id}
                          className="indicator flex flex-col items-center"
                        >
                          <span className="indicator-item badge badge-info-content text-white">
                            {choiceAmount}
                          </span>
                          <div className="bg-white rounded-lg shadow-md p-2 text-center">
                            {choiceData.choice}
                          </div>
                        </div>
                      );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      );
}

export default Accordion