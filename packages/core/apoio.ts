// Rede de apoio: ações da Prefeitura e enfrentamento à violência.
//
// TypeScript puro, sem React nem Prisma — consumido pelo painel web e pelo app.
//
// Regra que vale para o arquivo inteiro: NADA aqui é inventado. Telefone,
// endereço e horário de serviço local vivem no banco (`SupportService`), onde
// a equipe preenche o que verificou. Aqui ficam só os canais NACIONAIS, que
// valem em qualquer município do país, e conteúdo da Lei Maria da Penha.
//
// Um telefone errado numa tela de violência é pior do que tela vazia.

/* ══════════════ ações da Prefeitura ══════════════ */

export const CITY_CATEGORIES = [
  { value: "mulher", label: "Saúde da mulher" },
  { value: "saude", label: "Saúde" },
  { value: "vacinacao", label: "Vacinação" },
  { value: "assistencia", label: "Assistência social" },
  { value: "outro", label: "Outro" },
] as const;

export type CityCategory = (typeof CITY_CATEGORIES)[number]["value"];

export function cityCategoryLabel(value: string): string {
  return CITY_CATEGORIES.find((c) => c.value === value)?.label ?? "Outro";
}

export interface CityAction {
  id: string;
  title: string;
  summary: string;
  category: string;
  location: string | null;
  /**
   * `Date` no servidor (vem do Prisma) e `string` no app (veio por JSON).
   * Aceitar os dois aqui evita uma camada de conversão em cada ponta — quem
   * lê já normaliza com `new Date(...)`.
   */
  startsAt: string | Date | null;
  endsAt: string | Date | null;
  contact: string | null;
  url: string | null;
  pinned: boolean;
}

/**
 * Situação de uma ação em relação a hoje.
 *
 * `acontecendo` cobre o caso de uma ação que começou e ainda não terminou, e
 * também o de uma ação contínua (sem data) — um serviço que existe todo dia
 * não deve aparecer como "encerrada".
 */
export type SituacaoAcao = "hoje" | "acontecendo" | "emBreve" | "encerrada";

export function situacaoDaAcao(
  acao: Pick<CityAction, "startsAt" | "endsAt">,
  agora: Date = new Date(),
): SituacaoAcao {
  const dia = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const hoje = dia(agora);

  const inicio = acao.startsAt ? dia(new Date(acao.startsAt)) : null;
  const fim = acao.endsAt ? dia(new Date(acao.endsAt)) : null;

  if (!inicio && !fim) return "acontecendo";
  if (fim && fim < hoje) return "encerrada";
  if (inicio && inicio > hoje) return "emBreve";
  if (inicio && inicio.getTime() === hoje.getTime()) return "hoje";
  return "acontecendo";
}

export const SITUACAO_LABEL: Record<SituacaoAcao, string> = {
  hoje: "É hoje",
  acontecendo: "Acontecendo",
  emBreve: "Em breve",
  encerrada: "Encerrada",
};

/* ══════════════ canais nacionais ══════════════ */

export interface Canal {
  numero: string;
  nome: string;
  descricao: string;
  /** Chamada imediata de risco de vida — recebe destaque na interface. */
  urgente?: boolean;
}

/**
 * Só números de alcance nacional, gratuitos e sem depender de crédito.
 *
 * O 180 vem primeiro de propósito: é o canal que orienta e encaminha sem
 * exigir que ela já saiba o que quer fazer. O 190 é para perigo agora.
 */
export const CANAIS_NACIONAIS: Canal[] = [
  {
    numero: "180",
    nome: "Central de Atendimento à Mulher",
    descricao:
      "Gratuito, 24 horas, todos os dias. Orienta, acolhe e encaminha. Você pode ligar sem se identificar — inclusive para tirar dúvida, sem denunciar nada.",
  },
  {
    numero: "190",
    nome: "Polícia Militar",
    descricao: "Perigo agora. Se você ou alguém está em risco neste momento.",
    urgente: true,
  },
  {
    numero: "192",
    nome: "SAMU",
    descricao: "Emergência de saúde — ferimento, desmaio, dor forte.",
    urgente: true,
  },
  {
    numero: "100",
    nome: "Disque Direitos Humanos",
    descricao:
      "Violência contra criança, adolescente, idoso e outros grupos. Gratuito e 24 horas.",
  },
];

/* ══════════════ formas de violência ══════════════ */

export interface FormaViolencia {
  chave: string;
  nome: string;
  texto: string;
  exemplos: string[];
}

/**
 * As cinco formas do art. 7º da Lei Maria da Penha (Lei 11.340/2006).
 *
 * Estão aqui porque reconhecer é o passo que vem antes de procurar ajuda: é
 * muito comum a pessoa achar que "só conta" se tiver marca no corpo. Os
 * exemplos são deliberadamente concretos — categoria jurídica abstrata não
 * ajuda ninguém a se reconhecer.
 */
export const FORMAS_VIOLENCIA: FormaViolencia[] = [
  {
    chave: "fisica",
    nome: "Física",
    texto: "Qualquer conduta que ofenda a integridade ou a saúde do corpo.",
    exemplos: ["Empurrão, tapa, chute", "Puxar cabelo", "Impedir de sair ou trancar em cômodo"],
  },
  {
    chave: "psicologica",
    nome: "Psicológica",
    texto:
      "Conduta que causa dano emocional, diminui a autoestima ou tenta controlar suas decisões.",
    exemplos: [
      "Humilhação, xingamento, chantagem",
      "Ciúme que controla com quem você fala",
      "Ameaçar tirar os filhos",
      "Vigiar celular e mensagens",
    ],
  },
  {
    chave: "sexual",
    nome: "Sexual",
    texto:
      "Constranger a presenciar, manter ou participar de relação sexual não desejada.",
    exemplos: [
      "Forçar relação, mesmo dentro do casamento",
      "Impedir o uso de método contraceptivo",
      "Forçar gravidez ou aborto",
    ],
  },
  {
    chave: "patrimonial",
    nome: "Patrimonial",
    texto: "Reter, subtrair ou destruir seus bens, documentos ou dinheiro.",
    exemplos: [
      "Esconder documento ou cartão",
      "Controlar todo o dinheiro da casa",
      "Quebrar suas coisas de propósito",
    ],
  },
  {
    chave: "moral",
    nome: "Moral",
    texto: "Calúnia, difamação ou injúria.",
    exemplos: [
      "Espalhar mentira sobre você",
      "Expor sua intimidade para outras pessoas",
    ],
  },
];

/* ══════════════ medida protetiva ══════════════ */

export const MEDIDA_PROTETIVA = {
  titulo: "Medida protetiva",
  resumo:
    "É uma ordem do juiz para o agressor se afastar. Pode determinar que ele não chegue perto de você, do seu trabalho ou da escola das crianças.",
  passos: [
    "Procure qualquer delegacia. Não precisa ser delegacia da mulher.",
    "Peça a medida protetiva de urgência. Você pode pedir mesmo sem registrar boletim de ocorrência.",
    "Não precisa de advogado e não tem custo.",
    "O pedido vai para um juiz, que tem até 48 horas para decidir.",
    "Se ele descumprir a medida, ligue 190 na hora. Descumprir é crime.",
  ],
} as const;

/* ══════════════ plano de segurança ══════════════ */

/**
 * Não diz "saia de casa".
 *
 * A decisão de sair é dela, e o momento da saída é estatisticamente o de maior
 * risco — orientar de fora, sem conhecer o caso, pode empurrar alguém para o
 * pior momento possível. O que cabe aqui é o que aumenta a segurança dela
 * independente do que ela decidir.
 */
export const PLANO_SEGURANCA: string[] = [
  "Combine uma palavra ou um sinal com uma vizinha ou parente. Quando você disser ou mandar aquilo, ela chama a polícia.",
  "Deixe cópia dos documentos e uma chave na casa de alguém de confiança.",
  "Salve os números de emergência com outro nome na agenda do celular.",
  "Guarde prints de mensagens e fotos de lesão em algum lugar que ele não acesse — e-mail seu, ou com uma pessoa de confiança.",
  "Pense na saída mais rápida da sua casa e evite discutir na cozinha e no banheiro, onde há mais objetos que machucam.",
  "Se tiver filhos, ensine a eles como ligar 190 e para onde correr.",
];

/* ══════════════ avisos ══════════════ */

export const AVISO_PROTECAO =
  "Esta tela é informativa e não substitui atendimento. Em perigo agora, ligue 190.";

/**
 * Texto sobre rastro. Só pode existir enquanto for VERDADE — o app não registra
 * abertura de tela em lugar nenhum. Se algum dia entrar telemetria de
 * navegação, esta tela precisa ficar de fora, ou esta frase sai daqui.
 */
export const AVISO_RASTRO =
  "O app não guarda que você abriu esta tela, e ela não aparece no seu histórico.";
