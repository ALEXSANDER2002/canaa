"use client";

import { useFormStatus } from "react-dom";
import { Button, type ButtonProps } from "./button";

/**
 * Botão de submit que exibe estado de carregamento automaticamente,
 * baseado no status do <form> pai (React `useFormStatus`).
 */
export function SubmitButton({
  children,
  pendingText = "Salvando...",
  ...props
}: ButtonProps & { pendingText?: string }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} {...props}>
      {pending ? pendingText : children}
    </Button>
  );
}
