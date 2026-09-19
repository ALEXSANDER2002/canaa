"use client";

import { useState } from "react";
import { Card, CardTitle } from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/utils";

interface Props {
  periods: { start: string; end: string | null }[];
  prediction: {
    nextPeriodDate: string;
    fertileWindowStart: string;
    fertileWindowEnd: string;
    ovulationDate: string;
    periodLength: number;
  } | null;
}

const WEEKDAYS = ["D", "S", "T", "Q", "Q", "S", "S"];
const MONTHS = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];

function dayKey(d: Date) {
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}

/** Expande um intervalo [start, end] em chaves de dia (inclusive). */
function expandRange(start: Date, end: Date): string[] {
  const out: string[] = [];
  const d = new Date(start.getFullYear(), start.getMonth(), start.getDate());
  const last = new Date(end.getFullYear(), end.getMonth(), end.getDate());
  while (d <= last) {
    out.push(dayKey(d));
    d.setDate(d.getDate() + 1);
  }
  return out;
}

/** Calendário do ciclo — destaca menstruação, previsão, janela fértil e ovulação. */
export function CycleCalendar({ periods, prediction }: Props) {
  const today = new Date();
  const [view, setView] = useState({ y: today.getFullYear(), m: today.getMonth() });

  const periodLen = prediction?.periodLength ?? 5;

  // Conjuntos de classificação por dia.
  const periodSet = new Set<string>();
  for (const p of periods) {
    const s = new Date(p.start);
    let e: Date;
    if (p.end) {
      e = new Date(p.end);
    } else {
      e = new Date(s);
      e.setDate(e.getDate() + periodLen - 1);
    }
    for (const k of expandRange(s, e)) periodSet.add(k);
  }

  const predictedSet = new Set<string>();
  const fertileSet = new Set<string>();
  let ovulationKey = "";
  if (prediction) {
    const np = new Date(prediction.nextPeriodDate);
    const npEnd = new Date(np);
    npEnd.setDate(npEnd.getDate() + periodLen - 1);
    for (const k of expandRange(np, npEnd)) predictedSet.add(k);
    for (const k of expandRange(
      new Date(prediction.fertileWindowStart),
      new Date(prediction.fertileWindowEnd),
    ))
      fertileSet.add(k);
    ovulationKey = dayKey(new Date(prediction.ovulationDate));
  }
  const todayKey = dayKey(today);

  const firstWeekday = new Date(view.y, view.m, 1).getDay();
  const daysInMonth = new Date(view.y, view.m + 1, 0).getDate();
  const cells: (number | null)[] = [];
  for (let i = 0; i < firstWeekday; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const goPrev = () =>
    setView((v) => (v.m === 0 ? { y: v.y - 1, m: 11 } : { y: v.y, m: v.m - 1 }));
  const goNext = () =>
    setView((v) => (v.m === 11 ? { y: v.y + 1, m: 0 } : { y: v.y, m: v.m + 1 }));

  return (
    <Card>
      <div className="mb-4 flex items-center justify-between">
        <CardTitle>Calendário do ciclo</CardTitle>
        <div className="flex items-center gap-1">
          <button
            onClick={goPrev}
            aria-label="Mês anterior"
            className="grid h-8 w-8 place-items-center rounded-xl text-muted transition-colors hover:bg-plum-50 hover:text-plum-700"
          >
            <Icon name="arrow" className="h-4 w-4 rotate-180" />
          </button>
          <span className="min-w-32 text-center text-sm font-medium text-ink">
            {MONTHS[view.m]} {view.y}
          </span>
          <button
            onClick={goNext}
            aria-label="Próximo mês"
            className="grid h-8 w-8 place-items-center rounded-xl text-muted transition-colors hover:bg-plum-50 hover:text-plum-700"
          >
            <Icon name="arrow" className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center">
        {WEEKDAYS.map((w, i) => (
          <div key={i} className="pb-1 text-xs font-medium text-muted">
            {w}
          </div>
        ))}
        {cells.map((d, i) => {
          if (d === null) return <div key={`e${i}`} />;
          const k = `${view.y}-${view.m}-${d}`;
          const isPeriod = periodSet.has(k);
          const isPredicted = !isPeriod && predictedSet.has(k);
          const isFertile = !isPeriod && !isPredicted && fertileSet.has(k);
          const isOvulation = ovulationKey === k;
          const isToday = todayKey === k;

          return (
            <div
              key={k}
              className={cn(
                "relative flex h-10 items-center justify-center rounded-[var(--radius-chip)] text-sm",
                isPeriod && "bg-plum-700 font-medium text-white",
                isPredicted &&
                  "border border-dashed border-plum-300 text-plum-700",
                isFertile && "bg-sage-100 text-sage-600",
                !isPeriod &&
                  !isPredicted &&
                  !isFertile &&
                  "text-ink",
                isOvulation && "ring-2 ring-clay-400 ring-offset-1",
                isToday && "font-semibold outline outline-1 outline-offset-1 outline-ink/40",
              )}
            >
              {d}
            </div>
          );
        })}
      </div>

      <div className="mt-5 flex flex-wrap gap-x-4 gap-y-2 border-t border-line pt-4 text-xs text-muted">
        <Legend className="bg-plum-700" label="Menstruação" />
        <Legend className="border border-dashed border-plum-300" label="Previsão" />
        <Legend className="bg-sage-100" label="Janela fértil" />
        <Legend className="ring-2 ring-clay-400" label="Ovulação" rounded />
        <Legend className="outline outline-1 outline-ink/40" label="Hoje" />
      </div>
    </Card>
  );
}

function Legend({
  className,
  label,
  rounded,
}: {
  className: string;
  label: string;
  rounded?: boolean;
}) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span
        className={cn(
          "inline-block h-3.5 w-3.5",
          rounded ? "rounded-full" : "rounded",
          className,
        )}
      />
      {label}
    </span>
  );
}
