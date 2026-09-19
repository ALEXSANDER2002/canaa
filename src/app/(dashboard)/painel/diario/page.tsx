import type { Metadata } from "next";

import { requireUser } from "@/lib/session";
import { getDailyLogs } from "@/server/queries";
import { deleteDailyLogAction } from "@/server/actions/daily";
import { formatDate } from "@/lib/utils";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DeleteButton } from "@/components/ui/delete-button";
import { DailyForm } from "@/components/features/daily-form";
import { EmptyState } from "@/components/ui/illustrations";

export const metadata: Metadata = { title: "Diário" };

export default async function DiarioPage() {
  const user = await requireUser();
  const logs = await getDailyLogs(user.id, 21);

  return (
    <div>
      <PageHeader
        title="Diário"
        description="Um check-in rápido por dia — energia, sono, dor e sintomas."
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_1.1fr]">
        <DailyForm />

        <Card>
          <CardTitle>Últimos registros</CardTitle>
          {logs.length === 0 ? (
            <EmptyState>
              Nenhum check-in ainda. Registre como foi o seu dia.
            </EmptyState>
          ) : (
            <ul className="mt-4 divide-y divide-line">
              {logs.map((l) => (
                <li
                  key={l.id}
                  className="flex items-start justify-between gap-3 py-3"
                >
                  <div>
                    <p className="font-medium text-ink">{formatDate(l.date)}</p>
                    <div className="mt-1 flex flex-wrap items-center gap-2 text-xs">
                      {l.energy != null && (
                        <Badge tone="plum">Energia {l.energy}/5</Badge>
                      )}
                      {l.pain != null && (
                        <Badge tone="clay">Dor {l.pain}/5</Badge>
                      )}
                      {l.sleepHours != null && (
                        <Badge tone="sage">{l.sleepHours} h de sono</Badge>
                      )}
                      {l.symptoms && (
                        <span className="text-muted">{l.symptoms}</span>
                      )}
                    </div>
                    {l.note && (
                      <p className="mt-1 text-sm text-muted">{l.note}</p>
                    )}
                  </div>
                  <DeleteButton action={deleteDailyLogAction} id={l.id} />
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </div>
  );
}
