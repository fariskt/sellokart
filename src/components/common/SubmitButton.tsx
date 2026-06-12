"use client";

import { useFormStatus } from "react-dom";

import { Button } from "@/components/ui/button";

interface Props {
  createText: string;
  updateText: string;
  form: string;
  mode: "create" | "edit";
}

export function SubmitButton({
  createText,
  updateText,
  mode,
  form,
}: Props) {
  const { pending } = useFormStatus();

  return (
    <Button
      type="submit"
      form={form}
      disabled={pending}
    >
      {pending
        ? "Saving..."
        : mode === "create"
          ? createText
          : updateText}
    </Button>
  );
}