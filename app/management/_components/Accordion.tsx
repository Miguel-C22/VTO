import React from 'react'
import { employees, selectorChoices }from '@/utils/mockData'

function Accordion() {
    return (
        <div className="flex flex-col gap-3">
          <div className={employees.length > 6 ? "overflow-y-auto max-h-[700px]" : ""}>
            {employees.map((data) => (
              <div key={data.id} className="collapse bg-white border border-gray-300 shadow-lg rounded-lg mb-4">
                <input type="checkbox" className="collapse-checkbox" />
                <div className="collapse-title text-xl font-medium rounded-t-lg p-4">
                  {data.name}
                </div>
                <div className="collapse-content flex gap-8 flex-wrap rounded-b-lg p-4">
                  {selectorChoices.map((choiceData) => (
                    <div key={choiceData.id} className="indicator flex flex-col items-center">
                      <span className="indicator-item badge badge-info-content text-white">{choiceData.selected}</span>
                      <div className="bg-white rounded-lg shadow-md p-2 text-center">
                        {choiceData.choice}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      );
}

export default Accordion