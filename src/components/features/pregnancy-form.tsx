"use client";

import { useActionState } from "react";
import { upsertPregnancyAction } from "@/server/actions/pregnancy";
import type { ActionState } from "@/server/actions/auth";
import { Input, Label, Textarea } from "@/components/ui/input";
import { SubmitButton } from "@/components/ui/submit-button";
import { FieldError } from "@/components/ui/field-error";
import { toDateInputValue } from "@/lib/utils";

const initialState: ActionState = {};

export function PregnancyForm({
  defaultLastPeriod,
  defaultNotes,
}: {
  defaultLastPeriod?: Date;
  defaultNotes?: string | null;
}) {
  const [state, formAction] = useActionState(
    upsertPregnancyAction,
    initialState,
  );

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <Label htmlFor="lastPeriodDate">
          Data da última menstruação (DUM) *
        </Label>
        <Input
          id="lastPeriodDate"
          name="lastPeriodDate"
          type="date"
          required
          defaultValue={
            defaultLastPeriod ? toDateInputValue(defaultLastPeriod) : undefined
          }
        />
        <FieldError messages={state.fieldErrors?.lastPeriodDate} />
        <p className="mt-1 text-xs text-muted">
          Usada para calcular as semanas de gestação e a data provável do parto.
        </p>
      </div>

      <div>
        <Label htmlFor="notes">Observações</Label>
        <Textarea
          id="notes"
          name="notes"
          defaultValue={defaultNotes ?? undefined}
          placeholder="Anotações sobre a gestação…"
        />
      </div>

      <SubmitButton>
        {defaultLastPeriod ? "Atualizar gestação" : "Iniciar acompanhamento"}
      </SubmitButton>
    </form>
  );
}
