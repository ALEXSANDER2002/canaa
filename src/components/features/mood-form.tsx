"use client";

import { useActionState, useEffect, useRef } from "react";
import { addMoodAction } from "@/server/actions/mood";
import type { ActionState } from "@/server/actions/auth";
import { MOOD_OPTIONS } from "@/lib/constants";
import { Label, Textarea } from "@/components/ui/input";
import { SubmitButton } from "@/components/ui/submit-button";
import { FieldError } from "@/components/ui/field-error";
import { Card, CardTitle } from "@/components/ui/card";

const initialState: ActionState = {};

export function MoodForm() {
  const [state, formAction] = useActionState(addMoodAction, initialState);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.success) formRef.current?.reset();
  }, [state.success]);

  return (
    <Card>
      <CardTitle>Como você está se sentindo?</CardTitle>
      <form ref={formRef} action={formAction} className="mt-4 space-y-5">
        <div>
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
            {MOOD_OPTIONS.map((m, i) => (
              <label
                key={m.value}
                className="flex cursor-pointer flex-col items-center gap-2 rounded-[var(--radius-chip)] border border-line py-3.5 text-center text-xs text-ink transition-colors hover:border-plum-300 has-[:checked]:border-plum-400 has-[:checked]:bg-plum-50"
              >
                <input
                  type="radio"
                  name="mood"
                  value={m.value}
                  defaultChecked={i === 0}
                  className="sr-only"
                />
                <span
                  className="h-6 w-6 rounded-full ring-1 ring-black/5"
                  style={{ backgroundColor: m.color }}
                />
                {m.label}
              </label>
            ))}
          </div>
          <FieldError messages={state.fieldErrors?.mood} />
        </div>

        <div>
          <Label htmlFor="intensity">Intensidade</Label>
          <input
            id="intensity"
            name="intensity"
            type="range"
            min={1}
            max={5}
            defaultValue={3}
            className="w-full accent-plum-500"
          />
          <div className="flex justify-between text-xs text-muted">
            <span>Leve</span>
            <span>Intensa</span>
          </div>
        </div>

        <div>
          <Label htmlFor="note">Anotação (opcional)</Label>
          <Textarea
            id="note"
            name="note"
            placeholder="O que influenciou seu humor hoje?"
          />
        </div>

        <SubmitButton>Registrar</SubmitButton>
      </form>
    </Card>
  );
}
