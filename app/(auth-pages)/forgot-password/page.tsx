import { forgotPasswordAction } from "@/app/actions";
import { FormMessage, Message } from "@/components/form-message";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import { SmtpMessage } from "../smtp-message";

export default async function ForgotPassword(props: {
  searchParams: Promise<Message>;
}) {
  const searchParams = await props.searchParams;
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight">
            Reset your password
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Enter your email address and we&apos;ll send you a link to reset your
            password
          </p>
        </div>

        <div className="bg-card border rounded-lg shadow-sm p-8">
          <form className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="you@example.com"
                required
                className="w-full"
              />
            </div>

            <FormMessage message={searchParams} />

            <Button
              formAction={forgotPasswordAction}
              className="w-full"
              size="lg"
            >
              Send Reset Link
            </Button>
          </form>

          <div className="mt-6">
            <Separator className="my-4" />
            <p className="text-center text-sm text-muted-foreground">
              Remember your password?{" "}
              <Link
                className="font-medium text-primary hover:text-primary/80 transition-colors"
                href="/sign-in"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>

        <SmtpMessage />
      </div>
    </div>
  );
}
