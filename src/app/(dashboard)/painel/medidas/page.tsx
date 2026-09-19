import type { Metadata } from "next";

import { requireUser } from "@/lib/session";
import { getMetrics } from "@/server/queries";
import { deleteMetricAction } from "@/server/actions/health";
import { formatDate } from "@/lib/utils";
import { METRIC_TYPES } from "@/lib/constants";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardTitle } from "@/components/ui/card";
import { DeleteButton } from "@/components/ui/delete-button";
import { MetricForm } from "@/components/features/metric-form";
import { EmptyState } from "@/components/ui/illustrations";

export const metadata: Metadata = { title: "Medidas de saúde" };

function metricInfo(type: string) {
  return METRIC_TYPES.find((m) => m.value === type);
}

function formatValue(type: string, value: number, value2: number | null) {
  const info = metricInfo(type);
  if (type === "pressao" && value2 != null) return `${value}/${value2} ${info?.unit}`;
  return `${value} ${info?.unit ?? ""}`;
}

export default async function MedidasPage() {
  const user = await requireUser();
  const metrics = await getMetrics(user.id);

  return (
    <div>
      <PageHeader
        title="Medidas de saúde"
        description="Peso, pressão, glicemia e temperatura basal ao longo do tempo."
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_1.1fr]">
        <MetricForm />

        <Card>
          <CardTitle>Registros</CardTitle>
          {metrics.length === 0 ? (
            <EmptyState>
              Nenhuma medida ainda. Comece registrando um valor.
            </EmptyState>
          ) : (
            <ul className="mt-4 divide-y divide-line">
              {metrics.map((m) => (
                <li
                  key={m.id}
                  className="flex items-center justify-between gap-3 py-3"
                >
                  <div>
                    <p className="font-medium text-ink">
                      {metricInfo(m.type)?.label}:{" "}
                      <span className="text-plum-700">
                        {formatValue(m.type, m.value, m.value2)}
                      </span>
                    </p>
                    <p className="text-xs text-muted">
                      {formatDate(m.date)}
                      {m.note && ` · ${m.note}`}
                    </p>
                  </div>
                  <DeleteButton action={deleteMetricAction} id={m.id} />
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </div>
  );
}
