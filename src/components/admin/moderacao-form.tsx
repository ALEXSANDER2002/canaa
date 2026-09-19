"use client";

import { useActionState } from "react";

import { decidirModeracaoAction } from "@/server/actions/admin";
import type { ActionState } from "@/server/actions/auth";
import { DECISOES } from "@core/moderacao";
import { Input, Label, Select } from "@/components/ui/input";
import { SubmitButton } from "@/components/ui/submit-button";
import { FormAlert } from "@/components/ui/field-error";

const inicial: ActionState = {};

export function ModeracaoForm({ postId }: { postId: string }) {
  const [state, formAction] = useActionState(decidirModeracaoAction, inicial);

  if (state.success) {
    return <p className="text-sm text-sage-600">Decisão registrada.</p>;
  }

  return (
    <form action={formAction} className="space-y-3">
      <input type="hidden" name="postId" value={postId} />
      <FormAlert message={state.error} />

      <div className="grid gap-3 sm:grid-cols-[200px_1fr_auto] sm:items-end">
        <div>
          <Label htmlFor={`decisao-${postId}`}>Decisão</Label>
          <Select id={`decisao-${postId}`} name="decisao" defaultValue="restaurar">
            {DECISOES.map((d) => (
              <option key={d.value} value={d.value}>
                {d.label}
              </option>
            ))}
          </Select>
        </div>
        <div>
          <Label htmlFor={`nota-${postId}`}>Nota (fica na auditoria)</Label>
          <Input
            id={`nota-${postId}`}
            name="nota"
            placeholder="Por que você decidiu assim"
          />
        </div>
        <SubmitButton size="sm" pendingText="Registrando…">
          Registrar
        </SubmitButton>
      </div>

      <ul className="space-y-1 text-xs text-muted">
        {DECISOES.map((d) => (
          <li key={d.value}>
            <span className="font-semibold text-ink">{d.label}:</span>{" "}
            {d.descricao}
          </li>
        ))}
      </ul>
    </form>
  );
}
