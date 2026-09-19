"use client";

import { useActionState } from "react";

import { atribuirPapelAction } from "@/server/actions/admin";
import type { ActionState } from "@/server/actions/auth";
import { PAPEIS } from "@core/papeis";
import { Label, Select } from "@/components/ui/input";
import { SubmitButton } from "@/components/ui/submit-button";
import { FormAlert } from "@/components/ui/field-error";

const inicial: ActionState = {};

export function PapelForm({
  userId,
  papelAtual,
  organizationId,
  organizacoes,
}: {
  userId: string;
  papelAtual: string;
  organizationId: string | null;
  organizacoes: { id: string; name: string }[];
}) {
  const [state, formAction] = useActionState(atribuirPapelAction, inicial);

  return (
    <form action={formAction} className="space-y-2">
      <input type="hidden" name="userId" value={userId} />
      <FormAlert message={state.error} />

      <div className="flex flex-wrap items-end gap-2">
        <div>
          <Label htmlFor={`role-${userId}`}>Papel</Label>
          <Select
            id={`role-${userId}`}
            name="role"
            defaultValue={papelAtual}
            className="h-9 py-0 text-sm"
          >
            {PAPEIS.map((p) => (
              <option key={p.value} value={p.value}>
                {p.label}
              </option>
            ))}
          </Select>
        </div>

        <div>
          <Label htmlFor={`org-${userId}`}>Instituição</Label>
          <Select
            id={`org-${userId}`}
            name="organizationId"
            defaultValue={organizationId ?? ""}
            className="h-9 py-0 text-sm"
          >
            <option value="">Nenhuma</option>
            {organizacoes.map((o) => (
              <option key={o.id} value={o.id}>
                {o.name}
              </option>
            ))}
          </Select>
        </div>

        <SubmitButton size="sm" variant="outline" pendingText="Salvando…">
          Aplicar
        </SubmitButton>
      </div>

      {state.success && (
        <p className="text-xs text-sage-600">Papel atualizado.</p>
      )}
    </form>
  );
}
