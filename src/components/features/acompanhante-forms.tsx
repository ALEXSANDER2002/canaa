"use client";

import { useActionState } from "react";

import {
  criarConviteAction,
  ajustarEscoposAction,
  aceitarConviteAction,
} from "@/server/actions/acompanhante";
import type { ActionState } from "@/server/actions/auth";
import {
  ESCOPOS_ACOMPANHANTE,
  ESCOPOS_PADRAO,
  FORA_DE_ESCOPO,
  AVISO_CONVITE,
  escoposDe,
} from "@core/acompanhante";
import { Input, Label } from "@/components/ui/input";
import { SubmitButton } from "@/components/ui/submit-button";
import { FieldError, FormAlert } from "@/components/ui/field-error";
import { Card, CardTitle } from "@/components/ui/card";

const inicial: ActionState = {};

function CaixasDeEscopo({ marcados }: { marcados: string[] }) {
  return (
    <div className="space-y-2">
      {ESCOPOS_ACOMPANHANTE.map((e) => (
        <label
          key={e.value}
          className="flex cursor-pointer items-start gap-3 rounded-xl border border-line px-3.5 py-3 hover:border-plum-300"
        >
          <input
            type="checkbox"
            name="escopos"
            value={e.value}
            defaultChecked={marcados.includes(e.value)}
            className="mt-0.5 h-4 w-4 accent-[var(--color-plum-700)]"
          />
          <span>
            <span className="block text-sm font-semibold text-ink">
              {e.label}
            </span>
            <span className="block text-sm text-muted">{e.descricao}</span>
          </span>
        </label>
      ))}
    </div>
  );
}

export function ConviteForm() {
  const [state, formAction] = useActionState(criarConviteAction, inicial);

  return (
    <Card>
      <CardTitle>Convidar alguém para acompanhar</CardTitle>
      <p className="mt-1 text-sm text-muted">{AVISO_CONVITE}</p>

      <form action={formAction} className="mt-5 space-y-5">
        <FormAlert message={state.error} />

        <div>
          <Label>O que ele vai ver</Label>
          <CaixasDeEscopo marcados={ESCOPOS_PADRAO} />
          <FieldError messages={state.fieldErrors?.escopos} />
        </div>

        <div className="rounded-xl border border-line bg-mist p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-muted">
            O que ele nunca vê
          </p>
          <ul className="mt-2 space-y-1 text-sm text-ink">
            {FORA_DE_ESCOPO.map((f) => (
              <li key={f} className="flex gap-2">
                <span aria-hidden className="text-muted">
                  —
                </span>
                {f}
              </li>
            ))}
          </ul>
        </div>

        <div>
          <Label htmlFor="apelido">Como ele aparece para você</Label>
          <Input id="apelido" name="apelido" placeholder="Ex.: meu parceiro" />
        </div>

        <SubmitButton pendingText="Gerando…">Gerar código</SubmitButton>
      </form>
    </Card>
  );
}

export function EscoposForm({
  id,
  escopos,
}: {
  id: string;
  escopos: string;
}) {
  const [state, formAction] = useActionState(ajustarEscoposAction, inicial);

  return (
    <form action={formAction} className="mt-4 space-y-3">
      <input type="hidden" name="id" value={id} />
      <FormAlert message={state.error} />
      <CaixasDeEscopo marcados={escoposDe(escopos)} />
      <SubmitButton size="sm" variant="outline" pendingText="Salvando…">
        Salvar o que ele vê
      </SubmitButton>
      {state.success && (
        <p className="text-sm text-sage-600">Atualizado. Vale a partir de agora.</p>
      )}
    </form>
  );
}

export function AceitarForm() {
  const [state, formAction] = useActionState(aceitarConviteAction, inicial);

  return (
    <Card>
      <CardTitle>Acompanhar alguém</CardTitle>
      <p className="mt-1 text-sm text-muted">
        Se alguém te passou um código de seis letras, digite aqui. Você vê
        apenas o que ela escolheu compartilhar.
      </p>

      <form action={formAction} className="mt-4 flex flex-wrap items-end gap-3">
        <div>
          <Label htmlFor="codigo">Código</Label>
          <Input
            id="codigo"
            name="codigo"
            required
            maxLength={6}
            autoCapitalize="characters"
            placeholder="XXXXXX"
            className="w-40 font-mono uppercase tracking-[0.2em]"
          />
          <FieldError messages={state.fieldErrors?.codigo} />
        </div>
        <SubmitButton pendingText="Verificando…">Entrar</SubmitButton>
      </form>

      <FormAlert message={state.error} />
    </Card>
  );
}
