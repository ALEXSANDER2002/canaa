"use client";

import { useActionState } from "react";
import {
  updateGoalAction,
  setPinAction,
  removePinAction,
  deleteAccountAction,
} from "@/server/actions/settings";
import type { ActionState } from "@/server/actions/auth";
import { GOAL_OPTIONS } from "@/lib/constants";
import { Input, Label, Select } from "@/components/ui/input";
import { SubmitButton } from "@/components/ui/submit-button";
import { Button } from "@/components/ui/button";
import { FieldError } from "@/components/ui/field-error";

const initial: ActionState = {};

export function GoalForm({ current }: { current: string | null }) {
  const [state, action] = useActionState(updateGoalAction, initial);
  return (
    <form action={action} className="flex flex-wrap items-end gap-3">
      <div className="min-w-56 flex-1">
        <Label htmlFor="goal">Objetivo</Label>
        <Select id="goal" name="goal" defaultValue={current ?? "acompanhar"}>
          {GOAL_OPTIONS.map((g) => (
            <option key={g.value} value={g.value}>
              {g.label}
            </option>
          ))}
        </Select>
        <FieldError messages={state.fieldErrors?.goal} />
      </div>
      <SubmitButton variant="outline">Salvar</SubmitButton>
      {state.success && (
        <span className="text-sm text-sage-600">Atualizado ✓</span>
      )}
    </form>
  );
}

export function PinForm({ hasPin }: { hasPin: boolean }) {
  const [state, action] = useActionState(setPinAction, initial);
  return (
    <div className="space-y-3">
      <form action={action} className="flex flex-wrap items-end gap-3">
        <div>
          <Label htmlFor="pin">{hasPin ? "Trocar PIN" : "Definir PIN"}</Label>
          <Input
            id="pin"
            name="pin"
            inputMode="numeric"
            maxLength={6}
            placeholder="4 a 6 dígitos"
            className="w-40"
          />
          <FieldError messages={state.fieldErrors?.pin} />
        </div>
        <SubmitButton variant="outline">
          {hasPin ? "Trocar" : "Ativar"}
        </SubmitButton>
        {state.success && (
          <span className="text-sm text-sage-600">PIN salvo ✓</span>
        )}
      </form>
      {hasPin && (
        <form action={removePinAction}>
          <Button variant="ghost" size="sm" className="text-plum-700">
            Remover PIN
          </Button>
        </form>
      )}
    </div>
  );
}

export function DeleteAccount() {
  return (
    <form
      action={deleteAccountAction}
      onSubmit={(e) => {
        if (
          !confirm(
            "Isso apaga sua conta e TODOS os seus dados permanentemente. Continuar?",
          )
        )
          e.preventDefault();
      }}
    >
      <Button variant="danger" size="sm">
        Excluir minha conta
      </Button>
    </form>
  );
}
