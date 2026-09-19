"use client";

import { useActionState } from "react";

import { addReminderAction } from "@/server/actions/reminders";
import type { ActionState } from "@/server/actions/auth";
import { SubmitButton } from "@/components/ui/submit-button";

const inicial: ActionState = {};

/**
 * Fecha o ciclo da tela de exames: o exame vira um lembrete com um toque.
 *
 * A data padrão é daqui a 30 dias — prazo para conseguir marcar, e não "hoje",
 * que criaria um lembrete já vencido no momento em que ela clica.
 */
export function CriarLembreteExame({ titulo }: { titulo: string }) {
  const [state, formAction] = useActionState(addReminderAction, inicial);

  const daqui30 = new Date();
  daqui30.setDate(daqui30.getDate() + 30);
  const data = daqui30.toISOString().slice(0, 10);

  if (state.success) {
    return (
      <p className="text-sm font-semibold text-sage-600">
        Lembrete criado para {daqui30.toLocaleDateString("pt-BR")}.
      </p>
    );
  }

  return (
    <form action={formAction}>
      <input type="hidden" name="title" value={titulo} />
      <input type="hidden" name="type" value="exame" />
      <input type="hidden" name="dueDate" value={data} />
      <input
        type="hidden"
        name="notes"
        value="Criado a partir da tela de exames por idade."
      />
      <SubmitButton size="sm" variant="outline" pendingText="Criando…">
        Lembrar em 30 dias
      </SubmitButton>
    </form>
  );
}
