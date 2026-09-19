import type { Metadata } from "next";

import { requireUser } from "@/lib/session";
import {
  getDailyLogs,
  getPillLogs,
  getSelfExams,
  getCycles,
  getMoods,
  getMetrics,
} from "@/server/queries";
import { currentStreak, cn } from "@/lib/utils";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardTitle } from "@/components/ui/card";
import { Icon, type IconName } from "@/components/ui/icon";

export const metadata: Metadata = { title: "Metas & conquistas" };

export default async function MetasPage() {
  const user = await requireUser();
  const [dailyLogs, pillLogs, selfExams, cycles, moods, metrics] =
    await Promise.all([
      getDailyLogs(user.id, 365),
      getPillLogs(user.id, 365),
      getSelfExams(user.id, 365),
      getCycles(user.id),
      getMoods(user.id, 365),
      getMetrics(user.id, undefined, 365),
    ]);

  const checkinStreak = currentStreak(dailyLogs.map((l) => l.date));
  const pillStreak = currentStreak(
    pillLogs.filter((p) => p.taken).map((p) => p.date),
  );

  const badges: {
    icon: IconName;
    title: string;
    earned: boolean;
    hint: string;
  }[] = [
    {
      icon: "diary",
      title: "Primeiro passo",
      earned: dailyLogs.length >= 1,
      hint: "Faça seu primeiro check-in",
    },
    {
      icon: "spark",
      title: "Constante",
      earned: checkinStreak >= 7,
      hint: "7 dias seguidos de check-in",
    },
    {
      icon: "cycle",
      title: "Conhece seu ciclo",
      earned: cycles.length >= 3,
      hint: "Registre 3 ciclos",
    },
    {
      icon: "wellbeing",
      title: "De olho no humor",
      earned: moods.length >= 10,
      hint: "10 registros de humor",
    },
    {
      icon: "shield",
      title: "Autocuidado",
      earned: selfExams.length >= 1,
      hint: "Faça um autoexame",
    },
    {
      icon: "guide",
      title: "Bem medida",
      earned: metrics.length >= 5,
      hint: "5 medidas de saúde",
    },
  ];

  const earnedCount = badges.filter((b) => b.earned).length;

  return (
    <div>
      <PageHeader
        title="Metas & conquistas"
        description="Pequenos hábitos, grandes cuidados. Continue registrando!"
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <p className="text-sm text-muted">Sequência de check-in</p>
          <p className="num mt-1 font-display text-3xl text-plum-700">
            {checkinStreak} <span className="text-base">dia(s)</span>
          </p>
        </Card>
        <Card>
          <p className="text-sm text-muted">Sequência de pílula</p>
          <p className="num mt-1 font-display text-3xl text-ink">
            {pillStreak} <span className="text-base">dia(s)</span>
          </p>
        </Card>
        <Card>
          <p className="text-sm text-muted">Conquistas</p>
          <p className="num mt-1 font-display text-3xl text-ink">
            {earnedCount}
            <span className="text-base text-muted">/{badges.length}</span>
          </p>
        </Card>
      </div>

      <CardTitle className="mb-4 mt-8">Selos</CardTitle>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {badges.map((b) => (
          <Card
            key={b.title}
            className={cn(
              "flex items-center gap-3",
              !b.earned && "opacity-55",
            )}
          >
            <span
              className={cn(
                "grid h-12 w-12 shrink-0 place-items-center rounded-full",
                b.earned
                  ? "bg-plum-700 text-white"
                  : "bg-plum-50 text-plum-300",
              )}
            >
              <Icon name={b.earned ? "check" : b.icon} className="h-6 w-6" />
            </span>
            <div>
              <p className="font-medium text-ink">{b.title}</p>
              <p className="text-xs text-muted">
                {b.earned ? "Conquistado ✓" : b.hint}
              </p>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
