import type { Metadata } from "next";

import { requireUser } from "@/lib/session";
import { getCycles } from "@/server/queries";
import { deleteCycleAction } from "@/server/actions/cycle";
import {
  predictCycle,
  cyclePhase,
  cycleStats,
  formatDate,
  daysBetween,
} from "@/lib/utils";
import { FLOW_OPTIONS } from "@/lib/constants";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DeleteButton } from "@/components/ui/delete-button";
import { CycleForm } from "@/components/features/cycle-form";
import { CycleCalendar } from "@/components/features/cycle-calendar";
import { EmptyState } from "@/components/ui/illustrations";

export const metadata: Metadata = { title: "Ciclo menstrual" };

function flowLabel(value: string | null) {
  return FLOW_OPTIONS.find((o) => o.value === value)?.label ?? "—";
}

export default async function CicloPage() {
  const user = await requireUser();
  const cycles = await getCycles(user.id);
  const prediction = predictCycle(cycles.map((c) => c.startDate));
  const stats = cycleStats(cycles.map((c) => c.startDate));
  const phase = prediction
    ? cyclePhase(
        prediction.currentCycleDay,
        prediction.cycleLength,
        prediction.periodLength,
      )
    : null;

  // Serializa datas para o calendário (Client Component).
  const calendarPeriods = cycles.map((c) => ({
    start: c.startDate.toISOString(),
    end: c.endDate ? c.endDate.toISOString() : null,
  }));
  const calendarPrediction = prediction
    ? {
        nextPeriodDate: prediction.nextPeriodDate.toISOString(),
        fertileWindowStart: prediction.fertileWindowStart.toISOString(),
        fertileWindowEnd: prediction.fertileWindowEnd.toISOString(),
        ovulationDate: prediction.ovulationDate.toISOString(),
        periodLength: prediction.periodLength,
      }
    : null;

  return (
    <div>
      <PageHeader
        title="Ciclo menstrual"
        description="Acompanhe seu ciclo, sintomas e previsões."
      />

      {phase && prediction && (
        <Card className="mb-6 flex items-center gap-4">
          <span
            className="grid h-12 w-12 shrink-0 place-items-center rounded-full text-white"
            style={{ backgroundColor: phase.color }}
          >
            <span className="font-display text-lg font-semibold">
              {prediction.currentCycleDay}
            </span>
          </span>
          <div>
            <p className="text-xs uppercase tracking-wide text-muted">
              Fase atual · dia {prediction.currentCycleDay} do ciclo
            </p>
            <p className="font-display text-xl text-ink">{phase.label}</p>
            <p className="mt-0.5 text-sm text-muted">{phase.description}</p>
          </div>
        </Card>
      )}

      {prediction && (
        <div className="mb-6 grid gap-4 sm:grid-cols-3">
          <Card className="bg-plum-50">
            <p className="text-sm text-muted">Dia atual do ciclo</p>
            <p className="num mt-1 text-2xl font-bold text-plum-700">
              {prediction.currentCycleDay}
            </p>
          </Card>
          <Card className="bg-clay-50">
            <p className="text-sm text-muted">Próxima menstruação</p>
            <p className="mt-1 text-2xl font-bold text-clay-700">
              {formatDate(prediction.nextPeriodDate)}
            </p>
          </Card>
          <Card className="bg-sage-50">
            <p className="text-sm text-muted">Janela fértil</p>
            <p className="mt-1 text-lg font-semibold text-sage-600">
              {formatDate(prediction.fertileWindowStart)} –{" "}
              {formatDate(prediction.fertileWindowEnd)}
            </p>
          </Card>
        </div>
      )}

      {stats.averageLength && (
        <Card className="mb-6">
          <CardTitle>Seus números</CardTitle>
          <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div>
              <p className="num font-display text-2xl text-plum-700">
                {stats.averageLength}
                <span className="text-base"> dias</span>
              </p>
              <p className="text-xs text-muted">Ciclo médio</p>
            </div>
            <div>
              <p className="num font-display text-2xl text-ink">
                {stats.shortest}–{stats.longest}
              </p>
              <p className="text-xs text-muted">Mais curto / longo</p>
            </div>
            <div>
              <p className="num font-display text-2xl text-ink">
                {stats.cyclesTracked}
              </p>
              <p className="text-xs text-muted">Ciclos registrados</p>
            </div>
            <div>
              <Badge tone={stats.regularity === "regular" ? "sage" : "clay"}>
                {stats.regularity === "regular"
                  ? "Regular"
                  : stats.regularity === "irregular"
                    ? "Irregular"
                    : "Poucos dados"}
              </Badge>
              <p className="mt-1 text-xs text-muted">
                Variação de {stats.variation} dias
              </p>
            </div>
          </div>
        </Card>
      )}

      <div className="mb-6">
        <CycleCalendar
          periods={calendarPeriods}
          prediction={calendarPrediction}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
        <CycleForm />

        <Card>
          <CardTitle>Histórico</CardTitle>
          {cycles.length === 0 ? (
            <EmptyState>
              Nenhum ciclo registrado ainda. Comece adicionando o primeiro.
            </EmptyState>
          ) : (
            <ul className="mt-4 divide-y divide-plum-100">
              {cycles.map((c) => {
                const duration = c.endDate
                  ? daysBetween(c.startDate, c.endDate) + 1
                  : null;
                return (
                  <li
                    key={c.id}
                    className="flex items-start justify-between gap-3 py-3"
                  >
                    <div>
                      <p className="font-medium text-ink">
                        {formatDate(c.startDate)}
                        {c.endDate && ` – ${formatDate(c.endDate)}`}
                      </p>
                      <div className="mt-1 flex flex-wrap items-center gap-2 text-xs">
                        {c.flow && (
                          <Badge tone="plum">Fluxo: {flowLabel(c.flow)}</Badge>
                        )}
                        {duration && (
                          <Badge tone="neutral">{duration} dias</Badge>
                        )}
                        {c.symptoms && (
                          <span className="text-muted">{c.symptoms}</span>
                        )}
                      </div>
                    </div>
                    <DeleteButton action={deleteCycleAction} id={c.id} />
                  </li>
                );
              })}
            </ul>
          )}
        </Card>
      </div>
    </div>
  );
}
