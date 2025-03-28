import { forgotPasswordAction } from "@/app/actions";
import { Message } from "@/components/form-message";
import Form from "@/components/Form/Form";

export default async function ForgotPassword(props: {
  searchParams: Promise<Message>;
}) {
  const searchParams = await props.searchParams;
  return (
    <Form
      actionName="Forgot Password" 
      submitFn={forgotPasswordAction} 
      searchParamMessage={searchParams}
    />
  );
}
