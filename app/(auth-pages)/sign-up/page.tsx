import { signUpAction } from "@/app/actions";
import { FormMessage, Message } from "@/components/form-message";
import Form from "@/components/Form/Form";

export default async function Signup(props: {
  searchParams: Promise<Message>;
}) {
  const searchParams = await props.searchParams;
  if ("message" in searchParams) {
    return (
      <div className="w-full flex-1 flex items-center h-screen sm:max-w-md justify-center gap-2 p-4">
        <FormMessage message={searchParams} />
      </div>
    );
  }

  return (
    <Form 
      actionName="Sign Up" 
      submitFn={signUpAction} 
      searchParamMessage={searchParams}
    />
  );
}
