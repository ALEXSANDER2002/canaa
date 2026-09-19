import type { Metadata } from "next";

import { requireUser } from "@/lib/session";
import { db } from "@/lib/db";
import {
  getCycles,
  getMoods,
  getDailyLogs,
  getMetrics,
  getPregnancy,
} from "@/server/queries";
import {
  predictCycle,
  cycleStats,
  pregnancyProgress,
  formatDate,
  formatDateLong,
} from "@/lib/utils";
import { MOOD_OPTIONS, METRIC_TYPES } from "@/lib/constants";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardTitle } from "@/components/ui/card";
import { PrintButton } from "@/components/ui/print-button";

export const metadata: Metadata = { title: "Relatório de saúde" };

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 border-b border-line py-2 text-sm">
      <span className="text-muted">{label}</span>
      <span className="text-right font-medium text-ink">{value}</span>
    </div>
  );
}

export default async function RelatorioPage() {
  const sessionUser = await requireUser();
  const [account, cycles, moods, dailyLogs, metrics, pregnancy] =
    await Promise.all([
      db.user.findUnique({
        where: { id: sessionUser.id },
        select: { name: true, birthDate: true, goal: true },
      }),
      getCycles(sessionUser.id),
      getMoods(sessionUser.id, 30),
      getDailyLogs(sessionUser.id, 30),
      getMetrics(sessionUser.id, undefined, 100),
      getPregnancy(sessionUser.id),
    ]);

  const prediction = predictCycle(cycles.map((c) => c.startDate));
  const stats = cycleStats(cycles.map((c) => c.startDate));
  const progress = pregnancy ? pregnancyProgress(pregnancy.lastPeriodDate) : null;

  // Última medida de cada tipo.
  const latestByType = METRIC_TYPES.map((t) => ({
    ...t,
    latest: metrics.find((m) => m.type === t.value),
  })).filter((t) => t.latest);

  // Humor predominante.
  const moodCount = new Map<string, number>();
  for (const m of moods) moodCount.set(m.mood, (moodCount.get(m.mood) ?? 0) + 1);
  const topMood = [...moodCount.entries()].sort((a, b) => b[1] - a[1])[0];
  const topMoodLabel = topMood
    ? MOOD_OPTIONS.find((o) => o.value === topMood[0])?.label
    : null;

  return (
    <div>
      <div className="no-print">
        <PageHeader
          title="Relatório de saúde"
          description="Um resumo para levar à sua consulta."
          action={<PrintButton />}
        />
      </div>

      <div className="mx-auto max-w-2xl space-y-5">
        {/* Cabeçalho do relatório */}
        <div className="hidden items-center justify-between print:flex">
          <span className="font-display text-xl font-semibold">Canaã Delas</span>
          <span className="text-sm text-muted">
            Relatório · {formatDate(new Date())}
          </span>
        </div>

        <Card>
          <CardTitle>Dados gerais</CardTitle>
          <div className="mt-3">
            <Row label="Nome" value={account?.name ?? "—"} />
            <Row
              label="Objetivo"
              value={
                account?.goal === "engravidar"
                  ? "Tentar engravidar"
                  : account?.goal === "evitar"
                    ? "Evitar a gravidez"
                    : "Acompanhar o ciclo"
              }
            />
            {account?.birthDate && (
              <Row
                label="Nascimento"
                value={formatDate(account.birthDate)}
              />
            )}
          </div>
        </Card>

        <Card>
          <CardTitle>Ciclo menstrual</CardTitle>
          <div className="mt-3">
            <Row
              label="Ciclos registrados"
              value={String(stats.cyclesTracked)}
            />
            {stats.averageLength && (
              <>
                <Row
                  label="Duração média"
                  value={`${stats.averageLength} dias`}
                />
                <Row
                  label="Mais curto / mais longo"
                  value={`${stats.shortest} / ${stats.longest} dias`}
                />
                <Row
                  label="Regularidade"
                  value={
                    stats.regularity === "regular" ? "Regular" : "Irregular"
                  }
                />
              </>
            )}
            {prediction && (
              <Row
                label="Próxima menstruação (prev.)"
                value={formatDate(prediction.nextPeriodDate)}
              />
            )}
          </div>
        </Card>

        {progress && (
          <Card>
            <CardTitle>Gestação</CardTitle>
            <div className="mt-3">
              <Row
                label="Idade gestacional"
                value={`${progress.weeks} sem. e ${progress.days} d.`}
              />
              <Row
                label="Data provável do parto"
                value={formatDateLong(progress.dueDate)}
              />
            </div>
          </Card>
        )}

        {latestByType.length > 0 && (
          <Card>
            <CardTitle>Últimas medidas</CardTitle>
            <div className="mt-3">
              {latestByType.map((t) => (
                <Row
                  key={t.value}
                  label={t.label}
                  value={`${t.latest!.value}${
                    t.value === "pressao" && t.latest!.value2
                      ? `/${t.latest!.value2}`
                      : ""
                  } ${t.unit} · ${formatDate(t.latest!.date)}`}
                />
              ))}
            </div>
          </Card>
        )}

        <Card>
          <CardTitle>Bem-estar (últimos 30 dias)</CardTitle>
          <div className="mt-3">
            <Row label="Registros de humor" value={String(moods.length)} />
            {topMoodLabel && (
              <Row label="Humor predominante" value={topMoodLabel} />
            )}
            <Row label="Check-ins no diário" value={String(dailyLogs.length)} />
          </div>
        </Card>

        <p className="border-l-2 border-clay-300 pl-3 text-xs text-muted">
          Relatório gerado automaticamente a partir dos registros da usuária. As
          previsões são estimativas e não substituem avaliação profissional.
        </p>
      </div>
    </div>
  );
}
