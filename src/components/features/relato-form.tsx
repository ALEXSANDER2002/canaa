"use client";

import { useActionState, useEffect, useRef } from "react";

import { publicarRelatoAction, responderAction } from "@/server/actions/comunidade";
import type { ActionState } from "@/server/actions/auth";
import {
  COMMUNITY_CATEGORIES,
  AVISO_COMUNIDADE,
  LIMITES,
  apelidoDe,
} from "@core/community";
import { Selo } from "@/components/ui/selo";
import { Label, Select, Textarea } from "@/components/ui/input";
import { SubmitButton } from "@/components/ui/submit-button";
import { FieldError, FormAlert } from "@/components/ui/field-error";
import { Card, CardTitle } from "@/components/ui/card";

const inicial: ActionState = {};

export function RelatoForm({ userId }: { userId: string }) {
  const apelido = apelidoDe(userId);
  const [state, formAction] = useActionState(publicarRelatoAction, inicial);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.success) formRef.current?.reset();
  }, [state.success]);

  return (
    <Card>
      <CardTitle>Escrever</CardTitle>
      {/* O selo dela, do tamanho em que aparece no feed. Ver o próprio
          desenho aqui é o que faz ela reconhecê-lo depois, rolando a lista,
          sem precisar ler apelido nenhum. */}
      <div className="mt-3 flex items-start gap-3 rounded-[var(--radius-control)] bg-mist px-3.5 py-3">
        <Selo userId={userId} size={38} className="mt-0.5" />
        <p className="text-sm text-muted">
          Na comunidade você é{" "}
          <strong className="font-display text-ink">{apelido}</strong>, e este
          desenho é seu — não muda. Seu nome não aparece em lugar nenhum, e não
          há caminho de volta do apelido até você.
        </p>
      </div>

      <p className="mt-3 rounded-xl bg-mist p-3 text-sm text-ink">
        {AVISO_COMUNIDADE}
      </p>

      <form ref={formRef} action={formAction} className="mt-4 space-y-4">
        <FormAlert message={state.error} />

        <div>
          <Label htmlFor="category">Assunto</Label>
          <Select id="category" name="category" defaultValue="ciclo">
            {COMMUNITY_CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </Select>
        </div>

        <div>
          <Label htmlFor="body">Seu relato</Label>
          <Textarea
            id="body"
            name="body"
            required
            minLength={LIMITES.postMin}
            maxLength={LIMITES.postMax}
            placeholder="Conte o que aconteceu com você. Evite nomes e endereços — os seus e os dos outros."
          />
          <FieldError messages={state.fieldErrors?.body} />
        </div>

        <SubmitButton pendingText="Publicando…">Publicar</SubmitButton>
      </form>
    </Card>
  );
}

export function RespostaForm({ postId }: { postId: string }) {
  const [state, formAction] = useActionState(responderAction, inicial);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.success) formRef.current?.reset();
  }, [state.success]);

  return (
    <form ref={formRef} action={formAction} className="mt-3 space-y-2">
      <input type="hidden" name="postId" value={postId} />
      <Textarea
        name="body"
        required
        minLength={LIMITES.replyMin}
        maxLength={LIMITES.replyMax}
        placeholder="Responder…"
        className="min-h-16"
      />
      <FieldError messages={state.fieldErrors?.body} />
      <SubmitButton size="sm" variant="outline" pendingText="Enviando…">
        Responder
      </SubmitButton>
    </form>
  );
}
