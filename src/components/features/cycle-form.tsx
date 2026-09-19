"use client";

import { useActionState, useEffect, useRef } from "react";
import { addCycleAction } from "@/server/actions/cycle";
import type { ActionState } from "@/server/actions/auth";
import { FLOW_OPTIONS, COMMON_SYMPTOMS } from "@/lib/constants";
import { Input, Label, Select, Textarea } from "@/components/ui/input";
import { SubmitButton } from "@/components/ui/submit-button";
import { FieldError } from "@/components/ui/field-error";
import { Card, CardTitle } from "@/components/ui/card";

const initialState: ActionState = {};

export function CycleForm() {
  const [state, formAction] = useActionState(addCycleAction, initialState);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.success) formRef.current?.reset();
  }, [state.success]);

  return (
    <Card>
      <CardTitle>Registrar novo ciclo</CardTitle>
      <form ref={formRef} action={formAction} className="mt-4 space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="startDate">Início *</Label>
            <Input id="startDate" name="startDate" type="date" required />
            <FieldError messages={state.fieldErrors?.startDate} />
          </div>
          <div>
            <Label htmlFor="endDate">Fim</Label>
            <Input id="endDate" name="endDate" type="date" />
          </div>
        </div>

        <div>
          <Label htmlFor="flow">Fluxo</Label>
          <Select id="flow" name="flow" defaultValue="">
            <option value="">Selecione…</option>
            {FLOW_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </Select>
        </div>

        <fieldset>
          <legend className="mb-1.5 text-sm font-medium text-ink">
            Sintomas
          </legend>
          <div className="flex flex-wrap gap-2">
            {COMMON_SYMPTOMS.map((s) => (
              <label
                key={s}
                className="flex cursor-pointer items-center gap-2 rounded-full border border-plum-200 px-3 py-1.5 text-sm text-ink has-[:checked]:border-plum-400 has-[:checked]:bg-plum-50"
              >
                <input
                  type="checkbox"
                  name="symptoms"
                  value={s}
                  className="accent-plum-500"
                />
                {s}
              </label>
            ))}
          </div>
        </fieldset>

        <div>
          <Label htmlFor="notes">Observações</Label>
          <Textarea id="notes" name="notes" placeholder="Anotações…" />
        </div>

        <SubmitButton>Salvar ciclo</SubmitButton>
      </form>
    </Card>
  );
}
