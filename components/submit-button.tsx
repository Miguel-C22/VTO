'use client'

import { useFormStatus } from "react-dom"
import { Button } from "@/components/ui/button"
import { ComponentProps } from "react"

type Props = ComponentProps<typeof Button> & {
  pendingText?: string
  formAction?: (formData: FormData) => void
}

export function SubmitButton({ children, pendingText, formAction, ...props }: Props) {
  const { pending } = useFormStatus()

  return (
    <Button
      type="submit"
      disabled={pending}
      formAction={formAction}
      {...props}
    >
      {pending ? pendingText || "Loading..." : children}
    </Button>
  )
}