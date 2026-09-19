// Matemática de ciclo, gestação e datas — compartilhada entre a web e o app.
// TypeScript puro, sem React/Next/DOM: o Expo importa isto sem adaptação.

import {
  DEFAULT_CYCLE_LENGTH,
  DEFAULT_PERIOD_LENGTH,
  PREGNANCY_DURATION_DAYS,
} from "./constants";

const MS_PER_DAY = 1000 * 60 * 60 * 24;

/** Diferença em dias inteiros entre duas datas (b - a). */
export function daysBetween(a: Date, b: Date): number {
  const start = Date.UTC(a.getFullYear(), a.getMonth(), a.getDate());
  const end = Date.UTC(b.getFullYear(), b.getMonth(), b.getDate());
  return Math.round((end - start) / MS_PER_DAY);
}

/** Adiciona `days` dias a uma data, retornando uma nova instância. */
export function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

/** Formata uma data no padrão brasileiro (dd/mm/aaaa). */
export function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(d);
}

/** Formata uma data por extenso (ex.: "27 de julho de 2026"). */
export function formatDateLong(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(d);
}

/** Converte um valor `Date | string` para o formato de <input type="date">. */
export function toDateInputValue(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toISOString().slice(0, 10);
}

export interface CyclePrediction {
  cycleLength: number;
  periodLength: number;
  nextPeriodDate: Date;
  fertileWindowStart: Date;
  fertileWindowEnd: Date;
  ovulationDate: Date;
  currentCycleDay: number;
}

/**
 * Calcula previsões de ciclo a partir das datas de início dos ciclos
 * registrados. Usa a média dos intervalos quando há histórico; caso
 * contrário, cai para a duração padrão de 28 dias.
 *
 * As datas devem estar ordenadas do mais recente para o mais antigo.
 */
export function predictCycle(
  cycleStartDates: Date[],
  reference: Date = new Date(),
): CyclePrediction | null {
  if (cycleStartDates.length === 0) return null;

  const sorted = [...cycleStartDates].sort(
    (a, b) => b.getTime() - a.getTime(),
  );
  const lastStart = sorted[0];

  // Média dos intervalos entre inícios consecutivos.
  let cycleLength = DEFAULT_CYCLE_LENGTH;
  if (sorted.length >= 2) {
    const gaps: number[] = [];
    for (let i = 0; i < sorted.length - 1; i++) {
      gaps.push(daysBetween(sorted[i + 1], sorted[i]));
    }
    const avg = gaps.reduce((sum, g) => sum + g, 0) / gaps.length;
    // Ignora intervalos absurdos (dados incompletos).
    if (avg >= 21 && avg <= 45) cycleLength = Math.round(avg);
  }

  const nextPeriodDate = addDays(lastStart, cycleLength);
  const ovulationDate = addDays(nextPeriodDate, -14);
  const fertileWindowStart = addDays(ovulationDate, -5);
  const fertileWindowEnd = addDays(ovulationDate, 1);
  const currentCycleDay = daysBetween(lastStart, reference) + 1;

  return {
    cycleLength,
    periodLength: DEFAULT_PERIOD_LENGTH,
    nextPeriodDate,
    fertileWindowStart,
    fertileWindowEnd,
    ovulationDate,
    currentCycleDay,
  };
}

export interface PregnancyProgress {
  weeks: number;
  days: number;
  totalDays: number;
  dueDate: Date;
  daysRemaining: number;
  trimester: 1 | 2 | 3;
  progressPercent: number;
}

/**
 * Calcula o progresso da gestação a partir da DUM (data da última
 * menstruação). Retorna semanas/dias, trimestre, DPP e percentual.
 */
export function pregnancyProgress(
  lastPeriodDate: Date,
  reference: Date = new Date(),
): PregnancyProgress {
  const totalDays = Math.max(0, daysBetween(lastPeriodDate, reference));
  const weeks = Math.floor(totalDays / 7);
  const days = totalDays % 7;
  const dueDate = addDays(lastPeriodDate, PREGNANCY_DURATION_DAYS);
  const daysRemaining = Math.max(0, daysBetween(reference, dueDate));

  const trimester: 1 | 2 | 3 = weeks < 13 ? 1 : weeks < 27 ? 2 : 3;
  const progressPercent = Math.min(
    100,
    Math.round((totalDays / PREGNANCY_DURATION_DAYS) * 100),
  );

  return {
    weeks,
    days,
    totalDays,
    dueDate,
    daysRemaining,
    trimester,
    progressPercent,
  };
}

export interface CyclePhaseInfo {
  key: "menstrual" | "folicular" | "ovulatoria" | "lutea";
  label: string;
  description: string;
  color: string;
}

/**
 * Determina a fase do ciclo a partir do dia atual, duração do ciclo e da
 * menstruação. Conteúdo educativo — não substitui orientação médica.
 */
export function cyclePhase(
  currentDay: number,
  cycleLength: number,
  periodLength: number,
): CyclePhaseInfo {
  const ovulation = Math.max(periodLength + 2, cycleLength - 14);

  if (currentDay <= periodLength) {
    return {
      key: "menstrual",
      label: "Menstruação",
      description:
        "Seu corpo renova o endométrio. Priorize descanso e autocuidado.",
      color: "#d1354a", // plum-700
    };
  }
  if (currentDay < ovulation - 1) {
    return {
      key: "folicular",
      label: "Fase folicular",
      description:
        "A energia tende a subir enquanto o corpo se prepara para ovular.",
      color: "#566b45", // sage-600
    };
  }
  if (currentDay <= ovulation + 1) {
    return {
      key: "ovulatoria",
      label: "Ovulação",
      description: "Período mais fértil do ciclo — maior chance de concepção.",
      color: "#7d4dac", // clay-600
    };
  }
  return {
    key: "lutea",
    label: "Fase lútea",
    description:
      "Fase pré-menstrual; sintomas de TPM podem aparecer nos próximos dias.",
    color: "#a82b3d", // plum-800
  };
}

export interface CycleStats {
  cyclesTracked: number;
  averageLength: number | null;
  shortest: number | null;
  longest: number | null;
  variation: number | null; // amplitude (maior - menor)
  regularity: "regular" | "irregular" | "insuficiente";
}

/**
 * Estatísticas a partir das datas de início dos ciclos (mais recente primeiro
 * ou não — ordena internamente). Considera "regular" quando a variação ≤ 4 dias.
 */
export function cycleStats(cycleStartDates: Date[]): CycleStats {
  const sorted = [...cycleStartDates].sort((a, b) => a.getTime() - b.getTime());
  const gaps: number[] = [];
  for (let i = 0; i < sorted.length - 1; i++) {
    const g = daysBetween(sorted[i], sorted[i + 1]);
    if (g >= 15 && g <= 60) gaps.push(g); // ignora outliers
  }

  if (gaps.length === 0) {
    return {
      cyclesTracked: cycleStartDates.length,
      averageLength: null,
      shortest: null,
      longest: null,
      variation: null,
      regularity: "insuficiente",
    };
  }

  const shortest = Math.min(...gaps);
  const longest = Math.max(...gaps);
  const average = Math.round(gaps.reduce((s, g) => s + g, 0) / gaps.length);
  const variation = longest - shortest;

  return {
    cyclesTracked: cycleStartDates.length,
    averageLength: average,
    shortest,
    longest,
    variation,
    regularity:
      gaps.length < 2 ? "insuficiente" : variation <= 4 ? "regular" : "irregular",
  };
}

/** Retorna uma nova data no início do dia (00:00). */
export function startOfDay(date: Date = new Date()): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

/**
 * Maior sequência de dias consecutivos terminando hoje ou ontem.
 * Recebe uma lista de datas (qualquer ordem).
 */
export function currentStreak(dates: Date[]): number {
  if (dates.length === 0) return 0;
  const keys = new Set(dates.map((d) => startOfDay(d).getTime()));
  const dayMs = 86400000;
  const today = startOfDay().getTime();

  // A sequência pode terminar hoje ou ontem (ainda não registrou hoje).
  let cursor: number;
  if (keys.has(today)) cursor = today;
  else if (keys.has(today - dayMs)) cursor = today - dayMs;
  else return 0;

  let streak = 0;
  while (keys.has(cursor)) {
    streak++;
    cursor -= dayMs;
  }
  return streak;
}

/** Capitaliza a primeira letra de uma string. */
export function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

/** Retorna as iniciais de um nome (até 2 letras) para avatares. */
export function initials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}
