"use client";

import { useActionState, useEffect, useRef } from "react";

import { adicionarContatoAction } from "@/server/actions/protecao";
import type { ActionState } from "@/server/actions/auth";
import { Input, Label } from "@/components/ui/input";
import { SubmitButton } from "@/components/ui/submit-button";
import { FieldError, FormAlert } from "@/components/ui/field-error";
import { Card, CardTitle } from "@/components/ui/card";

const inicial: ActionState = {};

export function ContatoForm({ cheio }: { cheio: boolean }) {
  const [state, formAction] = useActionState(adicionarContatoAction, inicial);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.success) formRef.current?.reset();
  }, [state.success]);

  if (cheio) return null;

  return (
    <Card>
      <CardTitle>Adicionar pessoa</CardTitle>
      <form ref={formRef} action={formAction} className="mt-4 space-y-4">
        <FormAlert message={state.error} />

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="name">Nome *</Label>
            <Input id="name" name="name" required placeholder="Como você chama ela" />
            <FieldError messages={state.fieldErrors?.name} />
          </div>
          <div>
            <Label htmlFor="phone">Celular *</Label>
            <Input
              id="phone"
              name="phone"
              required
              inputMode="tel"
              placeholder="(94) 99999-0000"
            />
            <FieldError messages={state.fieldErrors?.phone} />
          </div>
        </div>

        <div>
          <Label htmlFor="relation">Quem é</Label>
          <Input
            id="relation"
            name="relation"
            placeholder="irmã, vizinha do 12, amiga do trabalho"
          />
        </div>

        <SubmitButton pendingText="Salvando…">Adicionar</SubmitButton>
      </form>
    </Card>
  );
}
