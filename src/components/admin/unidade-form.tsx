"use client";

import { useActionState, useEffect, useRef, useState } from "react";

import { salvarUnidadeAction } from "@/server/actions/admin";
import type { ActionState } from "@/server/actions/auth";
import { TIPOS_UNIDADE, SERVICOS_UNIDADE, tipoUnidadeLabel } from "@core/unidades";
import { Input, Label, Select, Textarea } from "@/components/ui/input";
import { SubmitButton } from "@/components/ui/submit-button";
import { FieldError, FormAlert } from "@/components/ui/field-error";
import { Card, CardTitle, CardDescription } from "@/components/ui/card";
import { Mapa, type PontoMapa } from "@/components/ui/map";

const inicial: ActionState = {};

export interface UnidadeExistente {
  id: string;
  nome: string;
  tipo: string;
  latitude: number | null;
  longitude: number | null;
}

export function UnidadeForm({
  outrasUnidades = [],
}: {
  /** As demais unidades já cadastradas, para dar contexto no mapa ao adicionar uma nova. */
  outrasUnidades?: UnidadeExistente[];
}) {
  const [state, formAction] = useActionState(salvarUnidadeAction, inicial);
  const formRef = useRef<HTMLFormElement>(null);
  const [local, setLocal] = useState<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    if (state.success) {
      formRef.current?.reset();
      setLocal(null);
    }
  }, [state.success]);

  const pontosContexto: PontoMapa[] = outrasUnidades
    .filter((u): u is UnidadeExistente & { latitude: number; longitude: number } =>
      u.latitude != null && u.longitude != null,
    )
    .map((u) => ({ id: u.id, lat: u.latitude, lng: u.longitude, titulo: u.nome, detalhe: tipoUnidadeLabel(u.tipo) }));

  return (
    <Card>
      <CardTitle>Nova unidade</CardTitle>
      <CardDescription>
        Marque só os serviços que a unidade realmente faz. A lista de exames por
        idade usa essas marcações para dizer onde cada exame é feito — marcar o
        que não existe manda alguém para a porta errada.
      </CardDescription>

      <form ref={formRef} action={formAction} className="mt-5 space-y-4">
        <FormAlert message={state.error} />

        <div className="grid gap-4 sm:grid-cols-[1fr_180px]">
          <div>
            <Label htmlFor="nome">Nome *</Label>
            <Input
              id="nome"
              name="nome"
              placeholder="Ex.: UBS Novo Horizonte"
              required
            />
            <FieldError messages={state.fieldErrors?.nome} />
          </div>
          <div>
            <Label htmlFor="tipo">Tipo *</Label>
            <Select id="tipo" name="tipo" defaultValue="ubs">
              {TIPOS_UNIDADE.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </Select>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="endereco">Endereço</Label>
            <Input id="endereco" name="endereco" placeholder="Rua, número" />
          </div>
          <div>
            <Label htmlFor="bairro">Bairro</Label>
            <Input id="bairro" name="bairro" placeholder="Ex.: Novo Horizonte" />
          </div>
        </div>

        <div>
          <Label>Localização no mapa</Label>
          <p className="mb-2 text-xs text-muted">
            Clique no ponto do mapa onde fica a unidade. Os outros marcadores
            são as unidades já cadastradas, só para referência.
          </p>
          <Mapa
            pontos={pontosContexto}
            selecionavel
            valorSelecionado={local}
            onSelecionar={setLocal}
            altura={260}
          />
          <input type="hidden" name="latitude" value={local?.lat ?? ""} />
          <input type="hidden" name="longitude" value={local?.lng ?? ""} />
          <p className="mt-1.5 text-xs text-muted">
            {local
              ? `${local.lat.toFixed(5)}, ${local.lng.toFixed(5)} — arraste o marcador para ajustar.`
              : "Ainda sem localização marcada. A unidade é salva mesmo assim, sem aparecer no mapa."}
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="telefone">Telefone</Label>
            <Input id="telefone" name="telefone" placeholder="(94) 3356-0000" />
            <FieldError messages={state.fieldErrors?.telefone} />
          </div>
          <div>
            <Label htmlFor="horario">Horário</Label>
            <Input
              id="horario"
              name="horario"
              placeholder="seg a sex, 7h às 17h"
            />
          </div>
        </div>

        <fieldset>
          <legend className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-muted">
            Serviços oferecidos *
          </legend>
          <div className="grid gap-2 sm:grid-cols-2">
            {SERVICOS_UNIDADE.map((s) => (
              <label
                key={s.value}
                className="flex cursor-pointer items-center gap-2.5 rounded-xl border border-line px-3 py-2 text-sm text-ink hover:border-plum-300"
              >
                <input
                  type="checkbox"
                  name="servicos"
                  value={s.value}
                  className="h-4 w-4 accent-[var(--color-plum-700)]"
                />
                {s.label}
              </label>
            ))}
          </div>
          <FieldError messages={state.fieldErrors?.servicos} />
        </fieldset>

        <div>
          <Label htmlFor="observacao">Observação</Label>
          <Textarea
            id="observacao"
            name="observacao"
            placeholder="Ex.: preventivo só com agendamento, às terças."
          />
        </div>

        <SubmitButton pendingText="Salvando…">Cadastrar unidade</SubmitButton>
      </form>
    </Card>
  );
}
