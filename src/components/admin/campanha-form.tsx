"use client";

import { useActionState, useEffect, useRef } from "react";

import { enviarCampanhaAction } from "@/server/actions/admin";
import type { ActionState } from "@/server/actions/auth";
import { PARCERIA_LINHAS } from "@core/parcerias";
import { PILARES_COM_PARCERIA, pilar } from "@core/pilares";
import { Input, Label, Select, Textarea } from "@/components/ui/input";
import { SubmitButton } from "@/components/ui/submit-button";
import { FieldError, FormAlert } from "@/components/ui/field-error";
import { Card, CardTitle, CardDescription } from "@/components/ui/card";

const inicial: ActionState = {};

export function CampanhaForm({
  parceiros,
}: {
  parceiros: { id: string; nome: string }[];
}) {
  const [state, formAction] = useActionState(enviarCampanhaAction, inicial);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.success) formRef.current?.reset();
  }, [state.success]);

  if (parceiros.length === 0) {
    return (
      <Card>
        <CardTitle>Nenhum parceiro cadastrado</CardTitle>
        <CardDescription>
          Peça à equipe para cadastrar a instituição antes de enviar uma peça.
        </CardDescription>
      </Card>
    );
  }

  return (
    <Card>
      <CardTitle>Enviar peça</CardTitle>
      <CardDescription>
        Nada vai ao ar antes de alguém da equipe aprovar. Toda edição volta a
        peça para a fila.
      </CardDescription>

      <ul className="mt-4 space-y-1.5 rounded-xl border border-line bg-mist p-4 text-sm text-ink">
        {PARCERIA_LINHAS.map((linha) => (
          <li key={linha} className="flex gap-2">
            <span aria-hidden className="text-plum-700">
              —
            </span>
            {linha}
          </li>
        ))}
      </ul>

      <form ref={formRef} action={formAction} className="mt-5 space-y-4">
        <FormAlert message={state.error} />

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="partnerId">Parceiro *</Label>
            <Select id="partnerId" name="partnerId" required>
              {parceiros.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nome}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <Label htmlFor="pilar">Onde aparece *</Label>
            <Select id="pilar" name="pilar" defaultValue="saude">
              {PILARES_COM_PARCERIA.map((v) => (
                <option key={v} value={v}>
                  {pilar(v).label}
                </option>
              ))}
            </Select>
            <p className="mt-1 text-xs text-muted">
              Proteção não está na lista e não pode entrar.
            </p>
            <FieldError messages={state.fieldErrors?.pilar} />
          </div>
        </div>

        <div>
          <Label htmlFor="titulo">Título *</Label>
          <Input id="titulo" name="titulo" required />
          <FieldError messages={state.fieldErrors?.titulo} />
        </div>

        <div>
          <Label htmlFor="texto">Texto *</Label>
          <Textarea
            id="texto"
            name="texto"
            required
            placeholder="Sem promessa de resultado, cura ou diagnóstico."
          />
          <FieldError messages={state.fieldErrors?.texto} />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="cidade">Cidade</Label>
            <Input
              id="cidade"
              name="cidade"
              defaultValue="Canaã dos Carajás"
            />
          </div>
          <div>
            <Label htmlFor="bairro">Bairro</Label>
            <Input id="bairro" name="bairro" placeholder="Todos, se em branco" />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="inicioEm">Começa em</Label>
            <Input id="inicioEm" name="inicioEm" type="date" />
          </div>
          <div>
            <Label htmlFor="fimEm">Termina em</Label>
            <Input id="fimEm" name="fimEm" type="date" />
          </div>
        </div>

        <div>
          <Label htmlFor="url">Link</Label>
          <Input id="url" name="url" type="url" placeholder="https://…" />
          <FieldError messages={state.fieldErrors?.url} />
        </div>

        <SubmitButton pendingText="Enviando…">Enviar para aprovação</SubmitButton>
      </form>
    </Card>
  );
}
