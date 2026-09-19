"use client";

import { useActionState, useEffect, useRef } from "react";
import { addDailyLogAction } from "@/server/actions/daily";
import type { ActionState } from "@/server/actions/auth";
import { COMMON_SYMPTOMS } from "@/lib/constants";
import { Input, Label, Textarea } from "@/components/ui/input";
import { SubmitButton } from "@/components/ui/submit-button";
import { Card, CardTitle } from "@/components/ui/card";

const initialState: ActionState = {};

function Scale({ name, label }: { name: string; label: string }) {
  return (
    <div>
      <Label htmlFor={name}>{label}</Label>
      <input
        id={name}
        name={name}
        type="range"
        min={1}
        max={5}
        defaultValue={3}
        className="w-full accent-plum-500"
      />
      <div className="flex justify-between text-xs text-muted">
        <span>1</span>
        <span>5</span>
      </div>
    </div>
  );
}

export function DailyForm() {
  const [state, formAction] = useActionState(addDailyLogAction, initialState);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.success) formRef.current?.reset();
  }, [state.success]);

  return (
    <Card>
      <CardTitle>Check-in de hoje</CardTitle>
      <form ref={formRef} action={formAction} className="mt-4 space-y-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <Scale name="energy" label="Energia" />
          <Scale name="pain" label="Dor / cólica" />
        </div>

        <div>
          <Label htmlFor="sleepHours">Horas de sono</Label>
          <Input
            id="sleepHours"
            name="sleepHours"
            type="number"
            step="0.5"
            min={0}
            max={24}
            placeholder="Ex.: 7.5"
          />
        </div>

        <fieldset>
          <legend className="mb-1.5 text-sm font-medium text-ink">
            Sintomas
          </legend>
          <div className="flex flex-wrap gap-2">
            {COMMON_SYMPTOMS.map((s) => (
              <label
                key={s}
                className="flex cursor-pointer items-center gap-2 rounded-full border border-line px-3 py-1.5 text-sm text-ink has-[:checked]:border-plum-400 has-[:checked]:bg-plum-50"
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
          <Label htmlFor="note">Como foi o dia?</Label>
          <Textarea id="note" name="note" placeholder="Anotações livres…" />
        </div>

        <SubmitButton>Salvar check-in</SubmitButton>
      </form>
    </Card>
  );
}
