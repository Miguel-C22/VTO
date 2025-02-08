import { signInAction } from "@/app/actions";
import { Message } from "@/components/form-message";
import Form from "@/components/Form/Form";

export default async function Login(props: { searchParams: Promise<Message> }) {
  const searchParams = await props.searchParams;
  return (
      <Form 
        actionName="Sign In" 
        submitFn={signInAction} 
        searchParamMessage={searchParams}
      />
  );
}
