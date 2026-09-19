import type { Metadata } from "next";

import { requireUser } from "@/lib/session";
import { getPregnancy } from "@/server/queries";
import { endPregnancyAction } from "@/server/actions/pregnancy";
import { pregnancyProgress, formatDateLong } from "@/lib/utils";
import { milestoneForWeek } from "@/lib/pregnancy-milestones";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PregnancyForm } from "@/components/features/pregnancy-form";

export const metadata: Metadata = { title: "Gestação" };

export default async function GestacaoPage() {
  const user = await requireUser();
  const pregnancy = await getPregnancy(user.id);
  const progress = pregnancy
    ? pregnancyProgress(pregnancy.lastPeriodDate)
    : null;

  return (
    <div>
      <PageHeader
        title="Gestação"
        description="Acompanhe sua gravidez semana a semana."
      />

      {progress ? (
        <div className="space-y-6">
          <Card className="border-plum-700 bg-plum-700 text-white">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-white/80">Você está com</p>
                <p className="text-3xl font-bold">
                  {progress.weeks} semanas e {progress.days} dias
                </p>
              </div>
              <Badge className="bg-white/20 text-white">
                {progress.trimester}º trimestre
              </Badge>
            </div>

            {/* Barra de progresso */}
            <div className="mt-5">
              <div className="h-2.5 w-full overflow-hidden rounded-full bg-white/25">
                <div
                  className="h-full rounded-full bg-white transition-all"
                  style={{ width: `${progress.progressPercent}%` }}
                />
              </div>
              <div className="mt-2 flex justify-between text-xs text-white/80">
                <span>{progress.progressPercent}% concluído</span>
                <span>{progress.daysRemaining} dias restantes</span>
              </div>
            </div>
          </Card>

          <div className="grid gap-4 sm:grid-cols-2">
            <Card>
              <p className="text-sm text-muted">Data provável do parto</p>
              <p className="mt-1 text-xl font-semibold text-ink">
                {formatDateLong(progress.dueDate)}
              </p>
            </Card>
            <Card className="bg-clay-50">
              <CardTitle className="text-clay-700">
                Semana {progress.weeks}
              </CardTitle>
              <p className="mt-1 text-sm text-muted">
                {milestoneForWeek(progress.weeks)}
              </p>
            </Card>
          </div>

          <Card>
            <CardTitle>Atualizar acompanhamento</CardTitle>
            <div className="mt-4">
              <PregnancyForm
                defaultLastPeriod={pregnancy!.lastPeriodDate}
                defaultNotes={pregnancy!.notes}
              />
            </div>
            <form action={endPregnancyAction} className="mt-6 border-t border-plum-100 pt-4">
              <Button variant="ghost" size="sm" className="text-danger-600 hover:bg-danger-50">
                Encerrar acompanhamento
              </Button>
            </form>
          </Card>

          <p className="border-l-2 border-clay-300 pl-3 text-xs text-muted">
            As informações são educativas e não substituem o acompanhamento
            pré-natal com profissionais de saúde.
          </p>
        </div>
      ) : (
        <Card>
          <CardTitle>Iniciar acompanhamento da gestação</CardTitle>
          <p className="mt-1 text-sm text-muted">
            Informe a data da última menstruação para calcularmos as semanas e a
            data provável do parto.
          </p>
          <div className="mt-4">
            <PregnancyForm />
          </div>
        </Card>
      )}
    </div>
  );
}
