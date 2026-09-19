"use client";

import { useActionState } from "react";
import { completeOnboardingAction } from "@/server/actions/onboarding";
import type { ActionState } from "@/server/actions/auth";
import { GOAL_OPTIONS } from "@/lib/constants";
import { Input, Label } from "@/components/ui/input";
import { SubmitButton } from "@/components/ui/submit-button";
import { FieldError } from "@/components/ui/field-error";

const initialState: ActionState = {};

export function OnboardingForm() {
  const [state, formAction] = useActionState(
    completeOnboardingAction,
    initialState,
  );

  return (
    <form action={formAction} className="space-y-6">
      <div>
        <p className="mb-3 text-sm font-medium text-ink">
          Qual é o seu objetivo agora?
        </p>
        <div className="space-y-3">
          {GOAL_OPTIONS.map((g, i) => (
            <label
              key={g.value}
              className="flex cursor-pointer items-start gap-3 rounded-[var(--radius-card)] border border-line p-4 transition-colors hover:border-plum-300 has-[:checked]:border-plum-400 has-[:checked]:bg-plum-50"
            >
              <input
                type="radio"
                name="goal"
                value={g.value}
                defaultChecked={i === 0}
                className="mt-1 accent-plum-500"
              />
              <span>
                <span className="block font-medium text-ink">{g.label}</span>
                <span className="block text-sm text-muted">
                  {g.description}
                </span>
              </span>
            </label>
          ))}
        </div>
        <FieldError messages={state.fieldErrors?.goal} />
      </div>

      <div>
        <Label htmlFor="birthDate">Data de nascimento (opcional)</Label>
        <Input id="birthDate" name="birthDate" type="date" />
      </div>

      <SubmitButton className="w-full" size="lg" pendingText="Salvando...">
        Continuar
      </SubmitButton>
    </form>
  );
}
