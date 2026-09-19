import type { Metadata } from "next";

import { requireUser } from "@/lib/session";
import { getSelfExams } from "@/server/queries";
import { logSelfExamAction } from "@/server/actions/health";
import { formatDate } from "@/lib/utils";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/input";
import { Icon } from "@/components/ui/icon";

export const metadata: Metadata = { title: "Autoexame das mamas" };

const STEPS = [
  "Em frente ao espelho, observe as mamas com os braços relaxados. Note formato, cor e pele.",
  "Levante os braços e observe novamente, procurando alterações no contorno.",
  "Com a ponta dos dedos, apalpe cada mama em movimentos circulares, de fora para dentro.",
  "Verifique as axilas, onde ficam os gânglios linfáticos.",
  "Aperte suavemente o mamilo e observe se há alguma secreção.",
];

export default async function AutoexamePage() {
  const user = await requireUser();
  const exams = await getSelfExams(user.id);
  const last = exams[0] ?? null;

  return (
    <div>
      <PageHeader
        title="Autoexame das mamas"
        description="Um cuidado simples e mensal. O ideal é fazer alguns dias após a menstruação."
      />

      <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
        <Card>
          <CardTitle>Passo a passo</CardTitle>
          <ol className="mt-4 space-y-4">
            {STEPS.map((s, i) => (
              <li key={i} className="flex gap-3">
                <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-plum-100 font-display text-sm font-semibold text-plum-700">
                  {i + 1}
                </span>
                <p className="text-sm leading-relaxed text-ink/80">{s}</p>
              </li>
            ))}
          </ol>
          <p className="mt-5 border-l-2 border-clay-300 pl-3 text-xs text-muted">
            O autoexame não substitui a mamografia nem a consulta. Ao notar
            caroços, dor persistente ou secreção, procure um profissional.
          </p>
        </Card>

        <div className="space-y-6">
          <Card className="text-center">
            <CardTitle>Registrar este mês</CardTitle>
            {last ? (
              <p className="mt-2 text-sm text-muted">
                Último registro em{" "}
                <strong className="text-ink">{formatDate(last.date)}</strong>
              </p>
            ) : (
              <p className="mt-2 text-sm text-muted">
                Você ainda não registrou nenhum autoexame.
              </p>
            )}
            <form action={logSelfExamAction} className="mt-4 space-y-3 text-left">
              <Textarea
                name="note"
                placeholder="Notou algo? (opcional)"
                className="min-h-16"
              />
              <Button className="w-full gap-2">
                <Icon name="check" className="h-4 w-4" strokeWidth={2.5} />
                Registrei o autoexame
              </Button>
            </form>
          </Card>

          {exams.length > 0 && (
            <Card>
              <CardTitle>Histórico</CardTitle>
              <ul className="mt-3 space-y-2 text-sm">
                {exams.map((e) => (
                  <li key={e.id} className="flex justify-between gap-2">
                    <span className="text-ink">{formatDate(e.date)}</span>
                    {e.note && (
                      <span className="text-right text-muted">{e.note}</span>
                    )}
                  </li>
                ))}
              </ul>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
