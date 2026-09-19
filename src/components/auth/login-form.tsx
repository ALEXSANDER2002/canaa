"use client";

import { useActionState } from "react";
import { loginAction, type ActionState } from "@/server/actions/auth";
import { Input, Label } from "@/components/ui/input";
import { SubmitButton } from "@/components/ui/submit-button";
import { FieldError, FormAlert } from "@/components/ui/field-error";

const initialState: ActionState = {};

export function LoginForm() {
  const [state, formAction] = useActionState(loginAction, initialState);

  return (
    <form action={formAction} className="space-y-4">
      <FormAlert message={state.error} />

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
          autoComplete="current-password"
          placeholder="••••••••"
          required
        />
        <FieldError messages={state.fieldErrors?.password} />
      </div>

      <SubmitButton className="w-full" size="lg" pendingText="Entrando...">
        Entrar
      </SubmitButton>
    </form>
  );
}
