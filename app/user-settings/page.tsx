'use server'

import { updateNameAction } from "@/app/actions";
import { Message } from '@/components/form-message';
import UserSettings from '@/components/UserSettings/UserSettings'

async function page(props: {
    searchParams: Promise<Message>;
  }) {
    const searchParams = await props.searchParams;

  return (
    <>
        <UserSettings 
            submitFn={updateNameAction} 
            searchParamMessage={searchParams}
        />
    </>
  )
}

export default page