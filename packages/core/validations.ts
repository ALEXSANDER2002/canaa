// Schemas Zod compartilhados entre a web (Server Actions) e o app (API REST).
// Manter uma fonte única garante que o app não consiga enviar nada que a web
// recusaria — a validação é literalmente o mesmo código nos dois lados.

import { z } from "zod";
import { FLOW_OPTIONS, MOOD_OPTIONS, REMINDER_TYPES } from "./constants";

const flowValues = FLOW_OPTIONS.map((o) => o.value) as [string, ...string[]];
const moodValues = MOOD_OPTIONS.map((o) => o.value) as [string, ...string[]];
const reminderTypes = REMINDER_TYPES.map((o) => o.value) as [
  string,
  ...string[],
];

// --- Autenticação ---------------------------------------------------------

export const registerSchema = z
  .object({
    name: z.string().trim().min(2, "Informe seu nome completo."),
    email: z.string().trim().toLowerCase().email("E-mail inválido."),
    password: z
      .string()
      .min(8, "A senha deve ter pelo menos 8 caracteres."),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "As senhas não conferem.",
    path: ["confirmPassword"],
  });

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email("E-mail inválido."),
  password: z.string().min(1, "Informe sua senha."),
});

// --- Ciclo menstrual ------------------------------------------------------

export const cycleSchema = z.object({
  startDate: z.coerce.date({ message: "Data de início inválida." }),
  endDate: z.coerce.date().optional().nullable(),
  flow: z.enum(flowValues).optional().nullable(),
  symptoms: z.string().max(500).optional().nullable(),
  notes: z.string().max(1000).optional().nullable(),
});

// --- Gestação -------------------------------------------------------------

export const pregnancySchema = z.object({
  lastPeriodDate: z.coerce.date({ message: "Informe a data da última menstruação." }),
  notes: z.string().max(1000).optional().nullable(),
});

// --- Bem-estar emocional --------------------------------------------------

export const moodSchema = z.object({
  date: z.coerce.date().optional(),
  mood: z.enum(moodValues, { message: "Selecione como você se sente." }),
  intensity: z.coerce.number().int().min(1).max(5).default(3),
  note: z.string().max(1000).optional().nullable(),
});

// --- Lembretes ------------------------------------------------------------

export const reminderSchema = z.object({
  title: z.string().trim().min(2, "Informe um título."),
  type: z.enum(reminderTypes, { message: "Selecione o tipo." }),
  dueDate: z.coerce.date({ message: "Informe a data." }),
  notes: z.string().max(1000).optional().nullable(),
});

const goalValues = ["acompanhar", "engravidar", "evitar"] as [
  string,
  ...string[],
];

export const goalSchema = z.object({
  goal: z.enum(goalValues, { message: "Selecione um objetivo." }),
  birthDate: z.coerce.date().optional().nullable(),
});

export const dailyLogSchema = z.object({
  date: z.coerce.date().optional(),
  energy: z.coerce.number().int().min(1).max(5).optional().nullable(),
  sleepHours: z.coerce.number().min(0).max(24).optional().nullable(),
  pain: z.coerce.number().int().min(1).max(5).optional().nullable(),
  symptoms: z.string().max(500).optional().nullable(),
  note: z.string().max(1000).optional().nullable(),
});

export const pinSchema = z.object({
  pin: z
    .string()
    .regex(/^\d{4,6}$/, "O PIN deve ter de 4 a 6 dígitos."),
});

const metricTypes = ["peso", "pressao", "glicemia", "tbc"] as [
  string,
  ...string[],
];

export const healthMetricSchema = z.object({
  type: z.enum(metricTypes, { message: "Selecione o tipo." }),
  value: z.coerce.number({ message: "Informe um valor." }).positive("Valor inválido."),
  value2: z.coerce.number().positive().optional().nullable(),
  date: z.coerce.date().optional(),
  note: z.string().max(500).optional().nullable(),
});

// --- Comunidade -----------------------------------------------------------

const communityCategories = [
  "ciclo",
  "gestacao",
  "saude",
  "desabafo",
  "outro",
] as [string, ...string[]];

export const communityPostSchema = z.object({
  category: z.enum(communityCategories, { message: "Escolha um assunto." }),
  body: z
    .string()
    .trim()
    .min(10, "Escreva um pouco mais para as pessoas entenderem.")
    .max(1200, "Texto muito longo."),
});

export const communityReplySchema = z.object({
  body: z
    .string()
    .trim()
    .min(2, "Escreva sua resposta.")
    .max(800, "Resposta muito longa."),
});

export type CommunityPostInput = z.infer<typeof communityPostSchema>;
export type CommunityReplyInput = z.infer<typeof communityReplySchema>;

export type GoalInput = z.infer<typeof goalSchema>;
export type DailyLogInput = z.infer<typeof dailyLogSchema>;
export type HealthMetricInput = z.infer<typeof healthMetricSchema>;

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type CycleInput = z.infer<typeof cycleSchema>;
export type PregnancyInput = z.infer<typeof pregnancySchema>;
export type MoodInput = z.infer<typeof moodSchema>;
export type ReminderInput = z.infer<typeof reminderSchema>;

// --- Proteção -------------------------------------------------------------

/**
 * Telefone brasileiro em formato livre.
 *
 * Aceita com e sem máscara e com ou sem DDD escrito entre parênteses, porque
 * quem cadastra contato de emergência está com pressa. A normalização (só
 * dígitos) fica a cargo de quem envia o SMS, não da validação.
 */
const telefone = z
  .string()
  .trim()
  .min(8, "Telefone muito curto.")
  .max(20, "Telefone muito longo.")
  .regex(/^[\d\s()+-]+$/, "Use apenas números, espaços e ( ) + -.");

export const trustedContactSchema = z.object({
  name: z.string().trim().min(2, "Informe o nome da pessoa."),
  phone: telefone,
  relation: z.string().trim().max(40).optional().nullable(),
});

const supportKinds = ["violencia", "saude", "assistencia", "juridico"] as [
  string,
  ...string[],
];

export const supportServiceSchema = z.object({
  name: z.string().trim().min(3, "Informe o nome do serviço."),
  kind: z.enum(supportKinds, { message: "Escolha o tipo de serviço." }),
  address: z.string().trim().max(200).optional().nullable(),
  phone: telefone.optional().nullable(),
  hours: z.string().trim().max(120).optional().nullable(),
  notes: z.string().trim().max(500).optional().nullable(),
  ordem: z.coerce.number().int().min(0).max(999).default(0),
  /**
   * Obrigatório, e é um nome de pessoa — não um cargo e não "equipe".
   * Um telefone errado numa tela de violência precisa ter dono.
   */
  verifiedBy: z
    .string()
    .trim()
    .min(3, "Escreva o nome de quem ligou e confirmou o número."),
});

// --- Unidades de atendimento ---------------------------------------------

const tiposUnidade = [
  "ubs",
  "hospital",
  "policlinica",
  "caps",
  "creas",
  "laboratorio",
] as [string, ...string[]];

export const healthUnitSchema = z.object({
  nome: z.string().trim().min(3, "Informe o nome da unidade."),
  tipo: z.enum(tiposUnidade, { message: "Escolha o tipo." }),
  endereco: z.string().trim().max(200).optional().nullable(),
  bairro: z.string().trim().max(80).optional().nullable(),
  telefone: telefone.optional().nullable(),
  horario: z.string().trim().max(120).optional().nullable(),
  servicos: z
    .string()
    .trim()
    .min(1, "Marque pelo menos um serviço."),
  observacao: z.string().trim().max(500).optional().nullable(),
  latitude: z.coerce.number().min(-90).max(90).optional().nullable(),
  longitude: z.coerce.number().min(-180).max(180).optional().nullable(),
});

// --- Ações da cidade ------------------------------------------------------

const cityCategories = [
  "saude",
  "mulher",
  "assistencia",
  "vacinacao",
  "outro",
] as [string, ...string[]];

export const cityActionSchema = z.object({
  title: z.string().trim().min(4, "Informe o título."),
  summary: z
    .string()
    .trim()
    .min(10, "Descreva em uma ou duas frases.")
    .max(600, "Resumo muito longo."),
  category: z.enum(cityCategories, { message: "Escolha a categoria." }),
  location: z.string().trim().max(200).optional().nullable(),
  startsAt: z.coerce.date().optional().nullable(),
  endsAt: z.coerce.date().optional().nullable(),
  contact: z.string().trim().max(120).optional().nullable(),
  url: z.string().trim().url("Endereço inválido.").optional().nullable().or(z.literal("")),
  pinned: z.coerce.boolean().default(false),
});

// --- Modo acompanhante ----------------------------------------------------

export const partnerInviteSchema = z.object({
  /** Lista separada por vírgula com valores de ESCOPOS_ACOMPANHANTE. */
  escopos: z.string().trim().min(1, "Escolha pelo menos uma coisa para compartilhar."),
  apelido: z.string().trim().max(40).optional().nullable(),
});

export const partnerAcceptSchema = z.object({
  codigo: z
    .string()
    .trim()
    .toUpperCase()
    .regex(/^[A-Z0-9]{6}$/, "O código tem 6 caracteres."),
});

// --- Parcerias ------------------------------------------------------------

const tiposParceiro = ["farmacia", "laboratorio", "clinica", "ong", "outro"] as [
  string,
  ...string[],
];

export const partnerSchema = z.object({
  nome: z.string().trim().min(2, "Informe o nome."),
  tipo: z.enum(tiposParceiro, { message: "Escolha o tipo." }),
  contato: z.string().trim().max(160).optional().nullable(),
});

export const campaignSchema = z.object({
  titulo: z.string().trim().min(4, "Informe o título da peça."),
  texto: z.string().trim().min(10, "Escreva o texto.").max(400, "Texto muito longo."),
  /**
   * `protecao` é recusado aqui, e não só na hora de publicar: a peça nem chega
   * a existir apontando para o pilar errado.
   */
  pilar: z.enum(["saude", "comunidade"], {
    message: "Publicidade só em Saúde e Comunidade.",
  }),
  url: z.string().trim().url("Endereço inválido.").optional().nullable().or(z.literal("")),
  cidade: z.string().trim().max(80).optional().nullable(),
  bairro: z.string().trim().max(80).optional().nullable(),
  inicioEm: z.coerce.date().optional().nullable(),
  fimEm: z.coerce.date().optional().nullable(),
});

// --- Moderação ------------------------------------------------------------

export const moderationSchema = z.object({
  decisao: z.enum(["restaurar", "remover", "silenciar"], {
    message: "Escolha uma decisão.",
  }),
  nota: z.string().trim().max(400).optional().nullable(),
});

// --- Papéis ---------------------------------------------------------------

export const roleSchema = z.object({
  userId: z.string().min(1),
  role: z.enum(
    ["usuaria", "moderadora", "rede_apoio", "prefeitura", "parceiro", "equipe"],
    { message: "Papel inválido." },
  ),
  organizationId: z.string().optional().nullable(),
});

export type TrustedContactInput = z.infer<typeof trustedContactSchema>;
export type SupportServiceInput = z.infer<typeof supportServiceSchema>;
export type HealthUnitInput = z.infer<typeof healthUnitSchema>;
export type CityActionInput = z.infer<typeof cityActionSchema>;
export type PartnerInviteInput = z.infer<typeof partnerInviteSchema>;
export type CampaignInput = z.infer<typeof campaignSchema>;
export type ModerationInput = z.infer<typeof moderationSchema>;
