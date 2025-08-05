"use client";

import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { deleteObjectionChoiceAction } from "@/app/actions";

interface DeleteObjectionButtonProps {
  choiceId: number;
}

export function DeleteObjectionButton({ choiceId }: DeleteObjectionButtonProps) {
  const handleDelete = (formData: FormData) => {
    if (confirm('Are you sure you want to delete this objection reason?')) {
      deleteObjectionChoiceAction(formData);
    }
  };

  return (
    <form action={handleDelete} className="inline">
      <input type="hidden" name="id" value={choiceId} />
      <Button
        type="submit"
        variant="ghost"
        size="sm"
        className="text-destructive hover:text-destructive/80"
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </form>
  );
}