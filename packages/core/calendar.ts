// Classificação de dias do calendário — o que pinta cada quadradinho.
// TypeScript puro: usado pelo app e disponível para a web.

import { addDays, daysBetween, startOfDay, type CyclePrediction } from "./cycle";

export type DayKind =
  | "menstruacao" // sangramento registrado
  | "prevista" // menstruação prevista, ainda não confirmada
  | "fertil" // janela fértil
  | "ovulacao" // dia estimado da ovulação
  | null;

export interface DayCell {
  date: Date;
  /** Fora do mês exibido — renderizado apagado. */
  outside: boolean;
  today: boolean;
  kind: DayKind;
  /** Dia do ciclo (1-based), quando dá para calcular. */
  cycleDay: number | null;
}

export interface CycleRange {
  startDate: Date;
  endDate?: Date | null;
  /** Duração usada quando o ciclo não tem fim registrado. */
  periodLength?: number;
}

/**
 * Monta a grade de um mês (semanas começando no domingo, como o calendário
 * brasileiro), classificando cada dia.
 *
 * A ordem de precedência importa: sangramento **registrado** sempre vence
 * previsão. O que ela viveu tem prioridade sobre o que o algoritmo achou.
 */
export function buildMonth(
  month: Date,
  cycles: CycleRange[],
  prediction: CyclePrediction | null,
  reference: Date = new Date(),
): DayCell[] {
  const first = new Date(month.getFullYear(), month.getMonth(), 1);
  const gridStart = addDays(first, -first.getDay());
  const today = startOfDay(reference);

  const cells: DayCell[] = [];
  for (let i = 0; i < 42; i++) {
    const date = addDays(gridStart, i);
    cells.push({
      date,
      outside: date.getMonth() !== month.getMonth(),
      today: daysBetween(today, date) === 0,
      kind: classifyDay(date, cycles, prediction),
      cycleDay: cycleDayFor(date, cycles),
    });
  }

  // Sexta linha só aparece se o mês realmente chega lá.
  const lastNeeded = cells.findLastIndex((c) => !c.outside);
  const weeks = Math.ceil((lastNeeded + 1) / 7);
  return cells.slice(0, weeks * 7);
}

function classifyDay(
  date: Date,
  cycles: CycleRange[],
  prediction: CyclePrediction | null,
): DayKind {
  const d = startOfDay(date);

  // 1. Sangramento registrado — o dado real, tem precedência.
  for (const c of cycles) {
    const start = startOfDay(c.startDate);
    const end = c.endDate
      ? startOfDay(c.endDate)
      : addDays(start, (c.periodLength ?? 5) - 1);
    if (d >= start && d <= end) return "menstruacao";
  }

  if (!prediction) return null;

  // 2. Ovulação estimada.
  if (daysBetween(startOfDay(prediction.ovulationDate), d) === 0) {
    return "ovulacao";
  }

  // 3. Janela fértil.
  if (
    d >= startOfDay(prediction.fertileWindowStart) &&
    d <= startOfDay(prediction.fertileWindowEnd)
  ) {
    return "fertil";
  }

  // 4. Menstruação prevista.
  const nextStart = startOfDay(prediction.nextPeriodDate);
  const nextEnd = addDays(nextStart, prediction.periodLength - 1);
  if (d >= nextStart && d <= nextEnd) return "prevista";

  return null;
}

/** Em que dia do ciclo esta data cai, contando do último início até ela. */
function cycleDayFor(date: Date, cycles: CycleRange[]): number | null {
  const d = startOfDay(date);
  let best: number | null = null;

  for (const c of cycles) {
    const start = startOfDay(c.startDate);
    if (d < start) continue;
    const diff = daysBetween(start, d) + 1;
    if (diff > 45) continue; // ciclo velho demais para ser este
    if (best === null || diff < best) best = diff;
  }

  return best;
}

export type ChanceGravidez = "baixa" | "alta" | "muito-alta";

/**
 * Probabilidade de engravidar hoje, a partir da janela fértil estimada.
 *
 * Deliberadamente em três faixas, e não em porcentagem: os percentuais dia a
 * dia da literatura divergem entre si, e exibir "27%" daria uma precisão que
 * o dado não tem. O que é sólido: a janela é de ~6 dias e o pico está nos
 * dois dias antes da ovulação (Wilcox et al., NEJM 1995).
 */
export function chanceDeEngravidar(
  date: Date,
  prediction: CyclePrediction | null,
): ChanceGravidez {
  if (!prediction) return "baixa";

  const d = startOfDay(date);
  const ovulacao = startOfDay(prediction.ovulationDate);
  const inicio = startOfDay(prediction.fertileWindowStart);
  const fim = startOfDay(prediction.fertileWindowEnd);

  if (d < inicio || d > fim) return "baixa";

  // Os dois dias que antecedem a ovulação, e a própria — o pico.
  const distancia = daysBetween(d, ovulacao);
  if (distancia >= 0 && distancia <= 2) return "muito-alta";

  return "alta";
}

export const CHANCE_LABEL: Record<ChanceGravidez, string> = {
  baixa: "Pouca probabilidade de engravidar",
  alta: "Chance de engravidar",
  "muito-alta": "Alta probabilidade de engravidar",
};

export const WEEKDAY_LABELS = ["D", "S", "T", "Q", "Q", "S", "S"] as const;

/** Sete dias a partir de hoje — a tira do topo da tela inicial. */
export function buildWeekStrip(
  reference: Date = new Date(),
  cycles: CycleRange[] = [],
  prediction: CyclePrediction | null = null,
): DayCell[] {
  const hoje = startOfDay(reference);
  return Array.from({ length: 7 }, (_, i) => {
    const date = addDays(hoje, i);
    return {
      date,
      outside: false,
      today: i === 0,
      kind: classifyDay(date, cycles, prediction),
      cycleDay: cycleDayFor(date, cycles),
    };
  });
}

const MONTHS = [
  "janeiro",
  "fevereiro",
  "março",
  "abril",
  "maio",
  "junho",
  "julho",
  "agosto",
  "setembro",
  "outubro",
  "novembro",
  "dezembro",
] as const;

/** "Agosto de 2026" — só a inicial do mês em maiúscula, nunca o "de". */
export function monthLabel(date: Date): string {
  const nome = MONTHS[date.getMonth()];
  return `${nome[0].toUpperCase()}${nome.slice(1)} de ${date.getFullYear()}`;
}

/* ══════════════ a cor do ciclo ══════════════ */

/**
 * Estado de fundo derivado da fase e da chance de engravidar.
 *
 * A regra vem do Flo e é a coisa mais distintiva do produto: **a cor do fundo
 * É o dado.** Rosa forte quando está menstruada, verde-água quando a chance de
 * engravidar é alta, rosa suave no resto. A pessoa lê a tela pela cor antes de
 * ler qualquer palavra.
 */
export type EstadoCiclo = "menstrual" | "baixa" | "fertil";

export function estadoDoCiclo(
  faseKey: string | null | undefined,
  chance: ChanceGravidez,
): EstadoCiclo {
  if (faseKey === "menstrual") return "menstrual";
  return chance === "baixa" ? "baixa" : "fertil";
}

/**
 * Três paradas, não duas.
 *
 * O Flo concentra a cor forte no topo e decai rápido; numa rampa linear o meio
 * da tela fica lavado. Mora no núcleo porque o app e a web desenham o mesmo
 * degradê — em lugares separados eles divergem na primeira vez que alguém
 * ajusta um tom.
 */
export const GRADIENTES_CICLO: Record<EstadoCiclo, readonly [string, string, string]> = {
  menstrual: ["#ffc2d0", "#ffdfe6", "#fff4f6"],
  baixa: ["#f9d5e4", "#fce7ef", "#fdf5f8"],
  fertil: ["#a4d4ce", "#c9e6e2", "#e8f4f2"],
};

/** Cor de destaque que combina com cada degradê, já aprovada em contraste. */
export const ACENTO_CICLO: Record<EstadoCiclo, string> = {
  menstrual: "#e01f4d",
  baixa: "#e01f4d",
  fertil: "#00807a",
};
