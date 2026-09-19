"use client";

import { useActionState, useEffect, useRef } from "react";

import { salvarServicoAction } from "@/server/actions/admin";
import type { ActionState } from "@/server/actions/auth";
import { TIPOS_SERVICO_APOIO } from "@core/protecao";
import { Input, Label, Select, Textarea } from "@/components/ui/input";
import { SubmitButton } from "@/components/ui/submit-button";
import { FieldError, FormAlert } from "@/components/ui/field-error";
import { Card, CardTitle, CardDescription } from "@/components/ui/card";

const inicial: ActionState = {};

export interface ServicoEditavel {
  id: string;
  name: string;
  kind: string;
  address: string | null;
  phone: string | null;
  hours: string | null;
  notes: string | null;
  ordem: number;
  verifiedBy: string | null;
}

export function ServicoForm({ servico }: { servico?: ServicoEditavel }) {
  const [state, formAction] = useActionState(salvarServicoAction, inicial);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.success && !servico) formRef.current?.reset();
  }, [state.success, servico]);

  return (
    <Card>
      <CardTitle>{servico ? "Editar contato" : "Novo contato"}</CardTitle>
      <CardDescription>
        Ligue para o número antes de salvar. A data de verificação é gravada no
        momento em que você salva, e o contato some da tela das usuárias 90 dias
        depois se ninguém reverificar.
      </CardDescription>

      <form ref={formRef} action={formAction} className="mt-5 space-y-4">
        {servico && <input type="hidden" name="id" value={servico.id} />}
        <FormAlert message={state.error} />

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="name">Nome do serviço *</Label>
            <Input
              id="name"
              name="name"
              defaultValue={servico?.name}
              placeholder="Ex.: Delegacia de Canaã dos Carajás"
              required
            />
            <FieldError messages={state.fieldErrors?.name} />
          </div>
          <div>
            <Label htmlFor="kind">Tipo *</Label>
            <Select id="kind" name="kind" defaultValue={servico?.kind ?? "violencia"}>
              {TIPOS_SERVICO_APOIO.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label} — {t.exemplo}
                </option>
              ))}
            </Select>
            <FieldError messages={state.fieldErrors?.kind} />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="phone">Telefone</Label>
            <Input
              id="phone"
              name="phone"
              defaultValue={servico?.phone ?? ""}
              placeholder="(94) 3356-0000"
            />
            <FieldError messages={state.fieldErrors?.phone} />
          </div>
          <div>
            <Label htmlFor="hours">Horário</Label>
            <Input
              id="hours"
              name="hours"
              defaultValue={servico?.hours ?? ""}
              placeholder="24 horas · ou: seg a sex, 8h às 17h"
            />
          </div>
        </div>

        <div>
          <Label htmlFor="address">Endereço</Label>
          <Input
            id="address"
            name="address"
            defaultValue={servico?.address ?? ""}
            placeholder="Rua, número, bairro"
          />
        </div>

        <div>
          <Label htmlFor="notes">Observação</Label>
          <Textarea
            id="notes"
            name="notes"
            defaultValue={servico?.notes ?? ""}
            placeholder="O que a pessoa precisa saber antes de ir. Ex.: atende sem agendamento."
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-[1fr_120px]">
          <div>
            <Label htmlFor="verifiedBy">Quem ligou e confirmou *</Label>
            <Input
              id="verifiedBy"
              name="verifiedBy"
              defaultValue={servico?.verifiedBy ?? ""}
              placeholder="Nome de uma pessoa, não um setor"
              required
            />
            <FieldError messages={state.fieldErrors?.verifiedBy} />
          </div>
          <div>
            <Label htmlFor="ordem">Ordem</Label>
            <Input
              id="ordem"
              name="ordem"
              type="number"
              min={0}
              defaultValue={servico?.ordem ?? 0}
            />
          </div>
        </div>

        <SubmitButton pendingText="Salvando…">
          {servico ? "Salvar alterações" : "Cadastrar contato"}
        </SubmitButton>
        {state.success && (
          <p className="text-sm text-sage-600">Verificação registrada agora.</p>
        )}
      </form>
    </Card>
  );
}
