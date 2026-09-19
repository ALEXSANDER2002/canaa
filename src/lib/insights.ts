import type { IconName } from "@/components/ui/icon";
import type { CyclePrediction, CycleStats, CyclePhaseInfo } from "@/lib/utils";
import { formatDate, daysBetween } from "@/lib/utils";
import { MOOD_OPTIONS } from "@/lib/constants";

export interface Insight {
  icon: IconName;
  text: string;
}

interface InsightInput {
  prediction: CyclePrediction | null;
  stats: CycleStats;
  phase: CyclePhaseInfo | null;
  dailyLogs: { symptoms: string | null; sleepHours: number | null }[];
  moods: { mood: string }[];
}

/** Gera insights simples e explicáveis a partir dos registros da usuária. */
export function generateInsights({
  prediction,
  stats,
  phase,
  dailyLogs,
  moods,
}: InsightInput): Insight[] {
  const out: Insight[] = [];
  const today = new Date();

  // Uma previsão vencida não deve aparecer como próximo evento nem sustentar
  // uma fase atual: é preciso primeiro registrar o início do novo ciclo.
  const predictionCurrent =
    prediction !== null && daysBetween(today, prediction.nextPeriodDate) >= 0;

  if (predictionCurrent && prediction) {
    const toFertile = daysBetween(today, prediction.fertileWindowStart);
    if (toFertile >= 0 && toFertile <= 3) {
      out.push({
        icon: "cycle",
        text: `Sua janela fértil começa em ${formatDate(prediction.fertileWindowStart)} — daqui a ${toFertile === 0 ? "menos de um dia" : `${toFertile} dia(s)`}.`,
      });
    } else {
      out.push({
        icon: "cycle",
        text: `Próxima menstruação prevista para ${formatDate(prediction.nextPeriodDate)}.`,
      });
    }
  }

  if (predictionCurrent && phase?.key === "lutea") {
    out.push({
      icon: "wellbeing",
      text: "Você está na fase lútea — sintomas de TPM podem aparecer nos próximos dias.",
    });
  }

  if (stats.averageLength) {
    out.push({
      icon: "guide",
      text:
        stats.regularity === "regular"
          ? `Seu ciclo tem sido regular, com média de ${stats.averageLength} dias.`
          : `Seu ciclo variou ${stats.variation} dias entre o mais curto e o mais longo. Se isso te preocupa, vale conversar com um profissional.`,
    });
  }

  // Sintoma mais frequente nos check-ins.
  const symptomCount = new Map<string, number>();
  for (const l of dailyLogs) {
    for (const s of (l.symptoms ?? "").split(",").filter(Boolean)) {
      symptomCount.set(s, (symptomCount.get(s) ?? 0) + 1);
    }
  }
  const topSymptom = [...symptomCount.entries()].sort((a, b) => b[1] - a[1])[0];
  if (topSymptom && topSymptom[1] >= 2) {
    out.push({
      icon: "diary",
      text: `"${topSymptom[0]}" foi o sintoma mais registrado ultimamente (${topSymptom[1]}×).`,
    });
  }

  // Média de sono.
  const sleeps = dailyLogs
    .map((l) => l.sleepHours)
    .filter((h): h is number => h != null);
  if (sleeps.length >= 3) {
    const avg = sleeps.reduce((s, h) => s + h, 0) / sleeps.length;
    out.push({
      icon: "wellbeing",
      text: `Sua média de sono nos últimos registros foi de ${avg.toFixed(1)} h por noite.`,
    });
  }

  // Humor predominante.
  const moodCount = new Map<string, number>();
  for (const m of moods) moodCount.set(m.mood, (moodCount.get(m.mood) ?? 0) + 1);
  const topMood = [...moodCount.entries()].sort((a, b) => b[1] - a[1])[0];
  if (topMood && moods.length >= 3) {
    const label = MOOD_OPTIONS.find((o) => o.value === topMood[0])?.label;
    if (label) {
      out.push({
        icon: "wellbeing",
        text: `Seu humor predominante tem sido "${label}".`,
      });
    }
  }

  return out.slice(0, 5);
}
