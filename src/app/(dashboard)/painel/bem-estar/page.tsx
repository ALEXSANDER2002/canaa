import type { Metadata } from "next";

import { requireUser } from "@/lib/session";
import { getMoods } from "@/server/queries";
import { deleteMoodAction } from "@/server/actions/mood";
import { formatDate } from "@/lib/utils";
import { MOOD_OPTIONS } from "@/lib/constants";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardTitle } from "@/components/ui/card";
import { DeleteButton } from "@/components/ui/delete-button";
import { MoodForm } from "@/components/features/mood-form";
import { EmptyState } from "@/components/ui/illustrations";

export const metadata: Metadata = { title: "Bem-estar emocional" };

function moodInfo(value: string) {
  return MOOD_OPTIONS.find((m) => m.value === value);
}

export default async function BemEstarPage() {
  const user = await requireUser();
  const moods = await getMoods(user.id, 30);

  // Resumo simples: contagem por humor nos últimos registros.
  const counts = new Map<string, number>();
  for (const m of moods) counts.set(m.mood, (counts.get(m.mood) ?? 0) + 1);
  const topMoods = [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 3);

  return (
    <div>
      <PageHeader
        title="Bem-estar emocional"
        description="Registre seu humor e acompanhe seus padrões."
      />

      <div className="grid gap-6 lg:grid-cols-[1.1fr_1fr]">
        <MoodForm />

        <div className="space-y-6">
          {topMoods.length > 0 && (
            <Card className="bg-clay-50">
              <CardTitle className="text-clay-700">
                Seus últimos {moods.length} registros
              </CardTitle>
              <div className="mt-3 flex flex-wrap gap-3">
                {topMoods.map(([mood, count]) => {
                  const info = moodInfo(mood);
                  return (
                    <div
                      key={mood}
                      className="flex items-center gap-2 rounded-full border border-line bg-surface px-3 py-1.5 text-sm"
                    >
                      <span
                        className="h-2.5 w-2.5 rounded-full"
                        style={{ backgroundColor: info?.color }}
                      />
                      <span className="text-ink">{info?.label}</span>
                      <span className="text-muted">×{count}</span>
                    </div>
                  );
                })}
              </div>
            </Card>
          )}

          <Card>
            <CardTitle>Histórico</CardTitle>
            {moods.length === 0 ? (
              <EmptyState>
                Nenhum registro ainda. Comece registrando como se sente hoje.
              </EmptyState>
            ) : (
              <ul className="mt-4 divide-y divide-plum-100">
                {moods.map((m) => {
                  const info = moodInfo(m.mood);
                  return (
                    <li
                      key={m.id}
                      className="flex items-center justify-between gap-3 py-3"
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className="h-4 w-4 shrink-0 rounded-full"
                          style={{ backgroundColor: info?.color }}
                        />
                        <div>
                          <p className="font-medium text-ink">
                            {info?.label}{" "}
                            <span className="text-xs text-muted">
                              · intensidade {m.intensity}/5
                            </span>
                          </p>
                          <p className="text-xs text-muted">
                            {formatDate(m.date)}
                            {m.note && ` — ${m.note}`}
                          </p>
                        </div>
                      </div>
                      <DeleteButton action={deleteMoodAction} id={m.id} />
                    </li>
                  );
                })}
              </ul>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
