"use client";

import { useActionState, useEffect, useRef } from "react";
import { addReminderAction } from "@/server/actions/reminders";
import type { ActionState } from "@/server/actions/auth";
import { REMINDER_TYPES } from "@/lib/constants";
import { Input, Label, Select, Textarea } from "@/components/ui/input";
import { SubmitButton } from "@/components/ui/submit-button";
import { FieldError } from "@/components/ui/field-error";
import { Card, CardTitle } from "@/components/ui/card";

const initialState: ActionState = {};

export function ReminderForm() {
  const [state, formAction] = useActionState(addReminderAction, initialState);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.success) formRef.current?.reset();
  }, [state.success]);

  return (
    <Card>
      <CardTitle>Novo lembrete</CardTitle>
      <form ref={formRef} action={formAction} className="mt-4 space-y-4">
        <div>
          <Label htmlFor="title">Título *</Label>
          <Input
            id="title"
            name="title"
            placeholder="Ex.: Papanicolau"
            required
          />
          <FieldError messages={state.fieldErrors?.title} />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="type">Tipo *</Label>
            <Select id="type" name="type" defaultValue="exame">
              {REMINDER_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </Select>
            <FieldError messages={state.fieldErrors?.type} />
          </div>
          <div>
            <Label htmlFor="dueDate">Data *</Label>
            <Input id="dueDate" name="dueDate" type="date" required />
            <FieldError messages={state.fieldErrors?.dueDate} />
          </div>
        </div>

        <div>
          <Label htmlFor="notes">Observações</Label>
          <Textarea id="notes" name="notes" placeholder="Detalhes…" />
        </div>

        <SubmitButton>Adicionar lembrete</SubmitButton>
      </form>
    </Card>
  );
}
