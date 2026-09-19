"use client";

import { Button } from "./button";

/**
 * Botão de exclusão que envia uma Server Action via <form>, com confirmação.
 * `action` é a Server Action; `id` é enviado como campo oculto.
 */
export function DeleteButton({
  action,
  id,
  label = "Excluir",
  confirmMessage = "Tem certeza que deseja excluir?",
}: {
  action: (formData: FormData) => void | Promise<void>;
  id: string;
  label?: string;
  confirmMessage?: string;
}) {
  return (
    <form
      action={action}
      onSubmit={(e) => {
        if (!confirm(confirmMessage)) e.preventDefault();
      }}
    >
      <input type="hidden" name="id" value={id} />
      <Button
        type="submit"
        variant="ghost"
        size="sm"
        className="text-danger-600 hover:bg-danger-50"
      >
        {label}
      </Button>
    </form>
  );
}
