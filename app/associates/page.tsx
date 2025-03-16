"use client"

import React, { Fragment, useContext } from 'react'
import TextBox from './_components/TextBox'
import Selectors from '@/app/associates/_components/Selectors'
import SubmitButton from './_components/SubmitBtn'

import { ChoicesContext } from '@/context/ChoicesContext'
import Loader from '@/components/Loader/Loader'

const containerStyle = `w-full max-w-[50em] flex flex-col items-center m-auto space-y-4 px-5 py-0`

function Page() {
  const { loading } = useContext(ChoicesContext);

  return (
    <div className={containerStyle}>
      {loading ? 
        <Loader /> 
        : 
        <Fragment>
          <Selectors />
          <TextBox />
          <SubmitButton />
        </Fragment>
    }
    </div>
  )
}

export default Page;