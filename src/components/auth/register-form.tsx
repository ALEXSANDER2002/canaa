"use client";

import { useActionState } from "react";
import { registerAction, type ActionState } from "@/server/actions/auth";
import { Input, Label } from "@/components/ui/input";
import { SubmitButton } from "@/components/ui/submit-button";
import { FieldError, FormAlert } from "@/components/ui/field-error";

const initialState: ActionState = {};

export function RegisterForm() {
  const [state, formAction] = useActionState(registerAction, initialState);

  return (
    <form action={formAction} className="space-y-4">
      <FormAlert message={state.error} />

      <div>
        <Label htmlFor="name">Nome completo</Label>
        <Input
          id="name"
          name="name"
          autoComplete="name"
          placeholder="Seu nome"
          required
        />
        <FieldError messages={state.fieldErrors?.name} />
      </div>

      <div>
        <Label htmlFor="email">E-mail</Label>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="voce@exemplo.com"
          required
        />
        <FieldError messages={state.fieldErrors?.email} />
      </div>

      <div>
        <Label htmlFor="password">Senha</Label>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          placeholder="Mínimo de 8 caracteres"
          required
        />
        <FieldError messages={state.fieldErrors?.password} />
      </div>

      <div>
        <Label htmlFor="confirmPassword">Confirmar senha</Label>
        <Input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          autoComplete="new-password"
          placeholder="Repita a senha"
          required
        />
        <FieldError messages={state.fieldErrors?.confirmPassword} />
      </div>

      <SubmitButton className="w-full" size="lg" pendingText="Criando conta...">
        Criar conta
      </SubmitButton>
    </form>
  );
}
