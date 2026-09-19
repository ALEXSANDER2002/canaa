// Valores enumerados usados em toda a aplicação — web e mobile.
// Como o SQLite não tem enums nativos, centralizamos as opções aqui e
// validamos com Zod. Cada opção tem um rótulo em português para a UI.
//
// Este arquivo é TypeScript puro: não importa React, Next nem nada do DOM.
// É por isso que o app Expo consegue usá-lo sem nenhuma adaptação.

export const FLOW_OPTIONS = [
  { value: "leve", label: "Leve" },
  { value: "medio", label: "Médio" },
  { value: "intenso", label: "Intenso" },
] as const;

// Cada humor tem uma cor (usada em swatches/pontos), evitando emojis.
export const MOOD_OPTIONS = [
  // Cores alinhadas à paleta do tema (sálvia → lilás → coral → neutro).
  { value: "otimo", label: "Ótimo", color: "#566b45" },
  { value: "bem", label: "Bem", color: "#6b7f57" },
  { value: "neutro", label: "Neutro", color: "#b9b2ac" },
  { value: "ansiosa", label: "Ansiosa", color: "#7d4dac" },
  { value: "triste", label: "Triste", color: "#a82b3d" },
  { value: "cansada", label: "Cansada", color: "#726b67" },
] as const;

export const REMINDER_TYPES = [
  { value: "exame", label: "Exame preventivo" },
  { value: "consulta", label: "Consulta" },
  { value: "medicacao", label: "Medicação" },
  { value: "outro", label: "Outro" },
] as const;

export const GOAL_OPTIONS = [
  {
    value: "acompanhar",
    label: "Acompanhar meu ciclo",
    description: "Entender meu corpo e receber previsões.",
  },
  {
    value: "engravidar",
    label: "Tentar engravidar",
    description: "Identificar a janela fértil a cada ciclo.",
  },
  {
    value: "evitar",
    label: "Evitar a gravidez",
    description: "Acompanhar os dias com mais atenção.",
  },
] as const;

export type GoalValue = (typeof GOAL_OPTIONS)[number]["value"];

export const METRIC_TYPES = [
  { value: "peso", label: "Peso", unit: "kg", dual: false },
  { value: "pressao", label: "Pressão arterial", unit: "mmHg", dual: true },
  { value: "glicemia", label: "Glicemia", unit: "mg/dL", dual: false },
  { value: "tbc", label: "Temperatura basal", unit: "°C", dual: false },
] as const;

export type MetricType = (typeof METRIC_TYPES)[number]["value"];

/**
 * Sintomas agrupados.
 *
 * Lista curta demais faz a pessoa não achar o que sente e desistir de
 * registrar; lista longa demais vira rolagem infinita. Agrupar resolve os
 * dois: ela vai direto ao grupo e escolhe.
 */
export const SYMPTOM_GROUPS = [
  {
    label: "Dor",
    items: [
      "Cólica",
      "Dor de cabeça",
      "Enxaqueca",
      "Dor lombar",
      "Dor nas pernas",
      "Dor ao evacuar",
      "Dor na relação",
    ],
  },
  {
    label: "Corpo",
    items: [
      "Inchaço",
      "Sensibilidade nos seios",
      "Acne",
      "Náusea",
      "Prisão de ventre",
      "Diarreia",
      "Tontura",
      "Calor repentino",
    ],
  },
  {
    label: "Humor e energia",
    items: [
      "Alteração de humor",
      "Cansaço",
      "Ansiedade",
      "Irritação",
      "Choro fácil",
      "Dificuldade de concentrar",
      "Insônia",
    ],
  },
  {
    label: "Corrimento",
    items: ["Seco", "Pegajoso", "Cremoso", "Clara de ovo", "Com odor", "Com coceira"],
  },
  {
    label: "Outros",
    items: ["Desejos alimentares", "Falta de apetite", "Libido alta", "Libido baixa"],
  },
] as const;

/** Lista plana, para validação e compatibilidade. */
export const COMMON_SYMPTOMS = SYMPTOM_GROUPS.flatMap((g) => g.items);

// Duração média usada nas previsões de ciclo quando ainda não há histórico.
export const DEFAULT_CYCLE_LENGTH = 28;
export const DEFAULT_PERIOD_LENGTH = 5;

// Duração média de uma gestação em dias (280 = 40 semanas a partir da DUM).
export const PREGNANCY_DURATION_DAYS = 280;

export type FlowValue = (typeof FLOW_OPTIONS)[number]["value"];
export type MoodValue = (typeof MOOD_OPTIONS)[number]["value"];
export type ReminderType = (typeof REMINDER_TYPES)[number]["value"];
