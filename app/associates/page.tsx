import React from 'react'
import TextBox from '../../components/TextBox/TextBox'
import Selectors from '@/components/Selectors/Selectors'
import SubmitButton from './_components/SubmitBtn'


function Page() {
  return (
    <div>
      <div className="flex flex-col items-center gap-4 px-5 py-0">
        <div className="mt-40 w-full">
          <Selectors />
        </div>
        <TextBox />
        <SubmitButton />
      </div>
    </div>
  )
}

export default Page;