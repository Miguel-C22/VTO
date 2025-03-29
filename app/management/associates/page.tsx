'use client'

import React, { useEffect } from 'react'
import Tables from '../_components/Tables'
import useNotifyUpdate from '../_hooks/useNotifyUpdate'
import useGetAllUsers from '@/hooks/useGetAllUsers'


function associates() {
  const { handleNotifyUpdate } = useNotifyUpdate() 
  const { fetchAssociates, associates, loading } = useGetAllUsers()

  useEffect(() => {
      fetchAssociates()
  }, [])

  return (
    <div className='w-1/2 m-auto mt-10 '> 
      <Tables 
             handleNotifyUpdate={handleNotifyUpdate}
             associates={associates}
             loading={loading}
      />
    </div>
  )
}

export default associates