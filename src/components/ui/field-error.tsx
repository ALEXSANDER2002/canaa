/** Exibe a primeira mensagem de erro de um campo, se houver. */
export function FieldError({ messages }: { messages?: string[] }) {
  if (!messages || messages.length === 0) return null;
  return <p className="mt-1 text-xs text-danger-600">{messages[0]}</p>;
}

/** Alerta de erro geral do formulário. */
export function FormAlert({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <div className="rounded-xl border border-danger-200 bg-danger-50 px-4 py-3 text-sm text-danger-700">
      {message}
    </div>
  );
}
