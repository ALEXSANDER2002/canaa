"use client";

import { useActionState, useEffect, useRef } from "react";
import { addMetricAction } from "@/server/actions/health";
import type { ActionState } from "@/server/actions/auth";
import { METRIC_TYPES } from "@/lib/constants";
import { Input, Label, Select, Textarea } from "@/components/ui/input";
import { SubmitButton } from "@/components/ui/submit-button";
import { FieldError } from "@/components/ui/field-error";
import { Card, CardTitle } from "@/components/ui/card";

const initial: ActionState = {};

export function MetricForm() {
  const [state, action] = useActionState(addMetricAction, initial);
  const ref = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.success) ref.current?.reset();
  }, [state.success]);

  return (
    <Card>
      <CardTitle>Nova medida</CardTitle>
      <form ref={ref} action={action} className="mt-4 space-y-4">
        <div>
          <Label htmlFor="type">Tipo</Label>
          <Select id="type" name="type" defaultValue="peso">
            {METRIC_TYPES.map((m) => (
              <option key={m.value} value={m.value}>
                {m.label} ({m.unit})
              </option>
            ))}
          </Select>
          <FieldError messages={state.fieldErrors?.type} />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="value">Valor</Label>
            <Input id="value" name="value" type="number" step="0.1" required />
            <FieldError messages={state.fieldErrors?.value} />
          </div>
          <div>
            <Label htmlFor="value2">Diastólica (pressão)</Label>
            <Input id="value2" name="value2" type="number" step="1" placeholder="opcional" />
          </div>
        </div>

        <div>
          <Label htmlFor="date">Data</Label>
          <Input id="date" name="date" type="date" />
        </div>

        <div>
          <Label htmlFor="note">Observação</Label>
          <Textarea id="note" name="note" placeholder="Opcional…" />
        </div>

        <SubmitButton>Salvar medida</SubmitButton>
      </form>
    </Card>
  );
}
