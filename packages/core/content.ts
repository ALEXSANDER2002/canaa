// Conteúdo educativo — compartilhado entre a web (Biblioteca) e o app
// (Conteúdo do dia). Texto geral e introdutório; não substitui orientação
// profissional.

import type { CyclePhaseInfo } from "./cycle";
import type { ChanceGravidez } from "./calendar";

/** Chave da ilustração de capa. Cada plataforma desenha do seu jeito. */
export type CoverKey =
  | "ciclo"
  | "fertilidade"
  | "preventivo"
  | "gestacao"
  | "quiz";

export interface Article {
  kind: "artigo";
  slug: string;
  category: string;
  title: string;
  excerpt: string;
  readMinutes: number;
  cover: CoverKey;
  body: { heading?: string; text: string }[];
}

export interface QuizOption {
  text: string;
  correct: boolean;
}

export interface Quiz {
  kind: "quiz";
  slug: string;
  category: string;
  title: string;
  cover: CoverKey;
  question: string;
  options: QuizOption[];
  /** Explicação mostrada depois de responder, certo ou errado. */
  explanation: string;
}

export type ContentItem = Article | Quiz;

// --- Artigos ---------------------------------------------------------------

export const ARTICLES: Article[] = [
  {
    kind: "artigo",
    slug: "entendendo-seu-ciclo",
    category: "Ciclo",
    title: "Entendendo as fases do seu ciclo",
    excerpt:
      "Menstrual, folicular, ovulatória e lútea: o que acontece no corpo em cada fase.",
    readMinutes: 4,
    cover: "ciclo",
    body: [
      {
        text: "O ciclo menstrual costuma durar entre 21 e 35 dias e se divide em quatro fases principais. Conhecê-las ajuda a entender variações de energia, humor e sintomas ao longo do mês.",
      },
      {
        heading: "Fase menstrual",
        text: "Começa no primeiro dia da menstruação. O corpo elimina o endométrio. É comum sentir mais cansaço — priorize o descanso.",
      },
      {
        heading: "Fase folicular",
        text: "Após a menstruação, os níveis de estrogênio sobem e a energia tende a aumentar enquanto o corpo se prepara para ovular.",
      },
      {
        heading: "Ovulação",
        text: "O óvulo é liberado, geralmente por volta do meio do ciclo. É o período mais fértil.",
      },
      {
        heading: "Fase lútea",
        text: "Vai da ovulação até a próxima menstruação. Podem surgir sintomas de TPM, como inchaço e mudanças de humor.",
      },
    ],
  },
  {
    kind: "artigo",
    slug: "sinais-de-fertilidade",
    category: "Fertilidade",
    title: "Como reconhecer os sinais de fertilidade",
    excerpt:
      "Muco cervical, temperatura basal e a janela fértil: aprenda a ler seu corpo.",
    readMinutes: 3,
    cover: "fertilidade",
    body: [
      {
        text: "A janela fértil é o intervalo de dias em que a gravidez é mais provável. Alguns sinais do corpo ajudam a identificá-la.",
      },
      {
        heading: "Muco cervical",
        text: "Perto da ovulação, o muco costuma ficar transparente e elástico, parecido com clara de ovo.",
      },
      {
        heading: "Temperatura basal",
        text: "A temperatura do corpo em repouso sobe levemente após a ovulação. Medir todos os dias ajuda a identificar o padrão.",
      },
    ],
  },
  {
    kind: "artigo",
    slug: "preventivo-papanicolau",
    category: "Prevenção",
    title: "Por que fazer o preventivo (Papanicolau)",
    excerpt:
      "Um exame simples que ajuda a detectar precocemente alterações no colo do útero.",
    readMinutes: 3,
    cover: "preventivo",
    body: [
      {
        text: "O exame preventivo, ou Papanicolau, ajuda a identificar precocemente alterações que podem levar ao câncer de colo do útero. É oferecido gratuitamente pelo SUS.",
      },
      {
        heading: "Com que frequência?",
        text: "Em geral, recomenda-se para mulheres de 25 a 64 anos que já iniciaram a vida sexual, com a periodicidade orientada pelo profissional de saúde.",
      },
    ],
  },
  {
    kind: "artigo",
    slug: "bem-estar-na-gravidez",
    category: "Gestação",
    title: "Cuidados de bem-estar na gravidez",
    excerpt: "Pequenos hábitos que fazem diferença ao longo dos três trimestres.",
    readMinutes: 4,
    cover: "gestacao",
    body: [
      {
        text: "A gravidez traz muitas mudanças. Alguns cuidados simples ajudam a viver esse período com mais tranquilidade.",
      },
      {
        heading: "Pré-natal em dia",
        text: "O acompanhamento pré-natal é essencial para a saúde da mãe e do bebê. Não pule as consultas.",
      },
      {
        heading: "Movimento e descanso",
        text: "Atividades leves, liberadas pelo profissional, ajudam na disposição. Respeite os sinais de cansaço do corpo.",
      },
    ],
  },
];

// --- Quizzes ---------------------------------------------------------------

/**
 * Perguntas curtas, uma por vez. O objetivo não é testar — é desfazer mito.
 * Por isso a explicação aparece tendo acertado ou errado.
 */
export const QUIZZES: Quiz[] = [
  {
    kind: "quiz",
    slug: "quiz-janela-fertil",
    category: "Fertilidade",
    title: "Quantos dias por mês dá para engravidar?",
    cover: "quiz",
    question:
      "Em um ciclo, quantos dias existe chance real de a gravidez acontecer?",
    options: [
      { text: "O mês inteiro", correct: false },
      { text: "Cerca de 6 dias", correct: true },
      { text: "Só no dia da ovulação", correct: false },
    ],
    explanation:
      "São cerca de seis dias: os cinco antes da ovulação e o dia dela. O espermatozoide sobrevive até 5 dias no corpo, mas o óvulo dura só de 12 a 24 horas — por isso a janela abre antes, e não depois.",
  },
  {
    kind: "quiz",
    slug: "quiz-preventivo",
    category: "Prevenção",
    title: "O preventivo é pago?",
    cover: "quiz",
    question: "O exame preventivo (Papanicolau) custa quanto no SUS?",
    options: [
      { text: "É gratuito", correct: true },
      { text: "Paga uma taxa pequena", correct: false },
      { text: "Só é gratuito com encaminhamento", correct: false },
    ],
    explanation:
      "É gratuito e feito na UBS, sem precisar de encaminhamento. A recomendação geral é para mulheres de 25 a 64 anos que já iniciaram a vida sexual.",
  },
  {
    kind: "quiz",
    slug: "quiz-colica",
    category: "Ciclo",
    title: "Cólica muito forte é normal?",
    cover: "quiz",
    question: "Dor que impede de trabalhar ou estudar todo mês é esperada?",
    options: [
      { text: "Sim, faz parte", correct: false },
      { text: "Não — vale investigar", correct: true },
    ],
    explanation:
      "Cólica leve é comum; dor que atrapalha a vida não é para ser normalizada. Pode ser sinal de endometriose, que atinge cerca de 1 em cada 10 mulheres e leva de 7 a 10 anos até o diagnóstico — justamente porque a dor é tratada como normal.",
  },
  {
    kind: "quiz",
    slug: "quiz-ciclo-irregular",
    category: "Ciclo",
    title: "Ciclo que varia muito importa?",
    cover: "quiz",
    question: "Variação de quantos dias entre ciclos já merece atenção?",
    options: [
      { text: "Mais de 4 dias", correct: true },
      { text: "Mais de 15 dias", correct: false },
      { text: "Variação nunca importa", correct: false },
    ],
    explanation:
      "Acima de 4 dias de diferença entre o ciclo mais curto e o mais longo já é considerado irregular. Não é motivo para pânico, mas é o tipo de padrão que vale mostrar na consulta — e o app calcula isso para você.",
  },
];

export const ALL_CONTENT: ContentItem[] = [...ARTICLES, ...QUIZZES];

export function getContent(slug: string): ContentItem | undefined {
  return ALL_CONTENT.find((c) => c.slug === slug);
}

export function getArticle(slug: string): Article | undefined {
  return ARTICLES.find((a) => a.slug === slug);
}

/**
 * Conteúdo do dia, escolhido pelo momento do ciclo.
 *
 * Não é aleatório: na janela fértil ela vê fertilidade, na fase menstrual vê
 * cólica. É o que faz o app parecer que sabe onde ela está — e é o motivo nº 2
 * pelo qual mulheres usam esses apps: entender as reações do próprio corpo
 * (Epstein et al., CHI 2017).
 */
export function conteudoDoDia(
  phase: CyclePhaseInfo | null,
  chance: ChanceGravidez,
  limite = 4,
): ContentItem[] {
  const porSlug = (s: string) => ALL_CONTENT.find((c) => c.slug === s)!;
  const escolhidos: ContentItem[] = [];

  if (chance !== "baixa" || phase?.key === "ovulatoria") {
    escolhidos.push(porSlug("quiz-janela-fertil"), porSlug("sinais-de-fertilidade"));
  }

  if (phase?.key === "menstrual") {
    escolhidos.push(porSlug("quiz-colica"), porSlug("entendendo-seu-ciclo"));
  }

  if (phase?.key === "lutea") {
    escolhidos.push(porSlug("entendendo-seu-ciclo"), porSlug("quiz-colica"));
  }

  if (phase?.key === "folicular") {
    escolhidos.push(porSlug("quiz-ciclo-irregular"), porSlug("entendendo-seu-ciclo"));
  }

  // Prevenção entra sempre — é o desfecho que o app quer mover.
  escolhidos.push(porSlug("quiz-preventivo"), porSlug("preventivo-papanicolau"));

  // Remove repetidos preservando a ordem de relevância.
  const vistos = new Set<string>();
  return escolhidos
    .filter((c) => (vistos.has(c.slug) ? false : (vistos.add(c.slug), true)))
    .slice(0, limite);
}

/* ══════════════ perguntas sugeridas ══════════════ */

/**
 * O que oferecer a quem abre a assistente sem saber o que perguntar.
 *
 * Mora no núcleo porque duas telas precisam da mesma lista: a assistente as
 * mostra como atalhos, e o hub mostra uma delas como isca. Duplicar daria, em
 * pouco tempo, uma pergunta no hub que a assistente não reconhece.
 *
 * São perguntas que alguém faria em voz alta — não títulos de artigo. "Por que
 * a cólica piora em alguns meses?" é o que ela pensa; "Dismenorreia secundária"
 * é o que o artigo se chama.
 */
export const PERGUNTAS_SUGERIDAS: string[] = [
  "Por que a cólica piora em alguns meses?",
  "Meus dias férteis são quais?",
  "O que eu levo na consulta da UBS?",
  "Atraso de quantos dias já é motivo de preocupação?",
  "Posso fazer o preventivo menstruada?",
];

/** Uma por dia, estável ao longo do dia. */
export function perguntaDoDia(diaDoAno: number): string {
  return PERGUNTAS_SUGERIDAS[diaDoAno % PERGUNTAS_SUGERIDAS.length];
}
