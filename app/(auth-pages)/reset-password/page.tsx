import { resetPasswordAction } from "@/app/actions";
import { Message } from "@/components/form-message";
import Form from "@/components/Form/Form";


export default async function ResetPassword(props: {
  searchParams: Promise<Message>;
}) {
  const searchParams = await props.searchParams;
  return (
    <Form 
      actionName="Reset Password" 
      submitFn={resetPasswordAction} 
      searchParamMessage={searchParams}
    />
  );
}
