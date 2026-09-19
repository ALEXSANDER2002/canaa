"use client";

import { useActionState, useEffect, useRef } from "react";

import { salvarAcaoAction } from "@/server/actions/admin";
import type { ActionState } from "@/server/actions/auth";
import { CITY_CATEGORIES } from "@core/apoio";
import { Input, Label, Select, Textarea } from "@/components/ui/input";
import { SubmitButton } from "@/components/ui/submit-button";
import { FieldError, FormAlert } from "@/components/ui/field-error";
import { Card, CardTitle, CardDescription } from "@/components/ui/card";

const inicial: ActionState = {};

export function AcaoForm() {
  const [state, formAction] = useActionState(salvarAcaoAction, inicial);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.success) formRef.current?.reset();
  }, [state.success]);

  return (
    <Card>
      <CardTitle>Nova campanha</CardTitle>
      <CardDescription>
        Aparece na aba Comunidade do app, para todas as usuárias do município.
        Deixe as datas em branco quando for um serviço contínuo.
      </CardDescription>

      <form ref={formRef} action={formAction} className="mt-5 space-y-4">
        <FormAlert message={state.error} />

        <div className="grid gap-4 sm:grid-cols-[1fr_200px]">
          <div>
            <Label htmlFor="title">Título *</Label>
            <Input
              id="title"
              name="title"
              placeholder="Ex.: Mutirão do preventivo"
              required
            />
            <FieldError messages={state.fieldErrors?.title} />
          </div>
          <div>
            <Label htmlFor="category">Categoria *</Label>
            <Select id="category" name="category" defaultValue="mulher">
              {CITY_CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </Select>
          </div>
        </div>

        <div>
          <Label htmlFor="summary">Resumo *</Label>
          <Textarea
            id="summary"
            name="summary"
            placeholder="Uma ou duas frases: o que é, quem pode ir, o que levar."
            required
          />
          <FieldError messages={state.fieldErrors?.summary} />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="location">Onde acontece</Label>
            <Input
              id="location"
              name="location"
              placeholder="UBS do Bairro Novo Horizonte"
            />
          </div>
          <div>
            <Label htmlFor="contact">Contato</Label>
            <Input
              id="contact"
              name="contact"
              placeholder="Telefone ou setor responsável"
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="startsAt">Começa em</Label>
            <Input id="startsAt" name="startsAt" type="date" />
          </div>
          <div>
            <Label htmlFor="endsAt">Termina em</Label>
            <Input id="endsAt" name="endsAt" type="date" />
          </div>
        </div>

        <div>
          <Label htmlFor="url">Link</Label>
          <Input id="url" name="url" type="url" placeholder="https://…" />
          <FieldError messages={state.fieldErrors?.url} />
        </div>

        <label className="flex cursor-pointer items-center gap-2.5 text-sm text-ink">
          <input
            type="checkbox"
            name="pinned"
            className="h-4 w-4 accent-[var(--color-plum-700)]"
          />
          Fixar no topo — use só para o que é urgente.
        </label>

        <SubmitButton pendingText="Publicando…">Publicar campanha</SubmitButton>
      </form>
    </Card>
  );
}
