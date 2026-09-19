import type { Metadata } from "next";

import { requireUser } from "@/lib/session";
import { getPillLogs } from "@/server/queries";
import { togglePillTodayAction } from "@/server/actions/health";
import { startOfDay, currentStreak, addDays, cn } from "@/lib/utils";
import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";

export const metadata: Metadata = { title: "Anticoncepcional" };

const WEEKDAY = ["dom", "seg", "ter", "qua", "qui", "sex", "sáb"];

export default async function PilulaPage() {
  const user = await requireUser();
  const logs = await getPillLogs(user.id, 90);

  const takenKeys = new Set(
    logs.filter((l) => l.taken).map((l) => startOfDay(l.date).getTime()),
  );
  const today = startOfDay();
  const takenToday = takenKeys.has(today.getTime());
  const streak = currentStreak(
    logs.filter((l) => l.taken).map((l) => l.date),
  );

  // Últimos 7 dias (mais antigo → hoje).
  const last7 = Array.from({ length: 7 }, (_, i) => addDays(today, i - 6));

  // Adesão dos últimos 30 dias.
  const last30 = Array.from({ length: 30 }, (_, i) => addDays(today, -i));
  const adherence = Math.round(
    (last30.filter((d) => takenKeys.has(d.getTime())).length / 30) * 100,
  );

  return (
    <div>
      <PageHeader
        title="Anticoncepcional"
        description="Marque quando tomar e acompanhe sua constância."
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="flex flex-col items-center text-center">
          <p className="text-sm text-muted">Hoje</p>
          <p className="mt-1 font-display text-xl text-ink">
            {takenToday ? "Tomado ✓" : "Ainda não tomou"}
          </p>
          <form action={togglePillTodayAction} className="mt-5">
            <Button
              variant={takenToday ? "outline" : "primary"}
              size="lg"
              className="gap-2"
            >
              <Icon name="check" className="h-5 w-5" strokeWidth={2.5} />
              {takenToday ? "Desfazer" : "Tomei hoje"}
            </Button>
          </form>

          <div className="mt-8 flex items-end justify-center gap-2">
            {last7.map((d) => {
              const on = takenKeys.has(d.getTime());
              return (
                <div key={d.getTime()} className="flex flex-col items-center gap-1">
                  <span
                    className={cn(
                      "grid h-8 w-8 place-items-center rounded-full text-xs",
                      on
                        ? "bg-plum-700 text-white"
                        : "border border-line text-muted",
                    )}
                  >
                    {on ? "✓" : ""}
                  </span>
                  <span className="text-xs text-muted">
                    {WEEKDAY[d.getDay()]}
                  </span>
                </div>
              );
            })}
          </div>
        </Card>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
          <Card>
            <p className="text-sm text-muted">Sequência atual</p>
            <p className="num mt-1 font-display text-3xl text-plum-700">
              {streak} <span className="text-base">dia(s)</span>
            </p>
          </Card>
          <Card>
            <p className="text-sm text-muted">Adesão (30 dias)</p>
            <p className="num mt-1 font-display text-3xl text-ink">{adherence}%</p>
          </Card>
        </div>
      </div>

      <p className="mt-6 border-l-2 border-clay-300 pl-3 text-xs text-muted">
        Ferramenta de apoio à rotina. Siga sempre a orientação do seu método
        contraceptivo com um profissional de saúde.
      </p>
    </div>
  );
}
