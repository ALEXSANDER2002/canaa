// Mascote — o que ele diz e quando diz.
//
// Núcleo compartilhado (web e app): TypeScript puro, sem React, Next, Prisma
// ou DOM. Aqui mora a REGRA — que mensagens existem, quem ganha a vez e quanto
// tempo até uma poder se repetir. Quem desenha o mascote é cada ponta.
//
// Duas decisões que não são estéticas:
//
// 1. Nenhuma mensagem pertence ao pilar Proteção, e o tipo impede:
//    `PilarMascote` exclui "protecao". Um balão que aparece sozinho, com
//    movimento, no canto da tela é o oposto do que aquele pilar precisa — chama
//    a atenção de quem olha de relance e ainda diz em voz alta o assunto.
//
// 2. Nada daqui vai para servidor. O que já foi mostrado fica só no aparelho,
//    e o que se guarda é um hash do id da mensagem, nunca o id: um id como
//    "gestacao:semana:20" dentro do navegador seria um rastro.

import type { PilarValue } from "./pilares";

export type PilarMascote = Exclude<PilarValue, "protecao">;

export type EmocaoMascote = "feliz" | "atenta" | "comemorando";

export interface MascoteAcao {
  rotulo: string;
  href: string;
}

export interface MascoteMensagem {
  /** Estável entre visitas — é o que impede a mesma mensagem de voltar cedo. */
  id: string;
  pilar: PilarMascote;
  /** Etiqueta pequena acima do texto: "Da cidade", "Dica de saúde"… */
  rotulo: string;
  titulo?: string;
  /** Curto de propósito: cabe num balão de celular e é lido de relance. */
  texto: string;
  cta?: MascoteAcao;
  /** Maior aparece primeiro. */
  prioridade: number;
  /** Depois de mostrada, quantas horas até poder aparecer de novo. */
  repetirEmHoras: number;
  /** Se definido, só aparece nessas rotas (por prefixo) e ganha bônus. */
  rotas?: string[];
  /** Não aparece nessas rotas — não se avisa do que ela já está olhando. */
  evitarEm?: string[];
  emocao?: EmocaoMascote;
}

/* ══════════════ política de aparição ══════════════ */

/**
 * No máximo três por dia, com intervalo entre elas.
 *
 * O mascote é um convite, não uma notificação. Mais que isso vira o balão que
 * a pessoa aprende a fechar sem ler — e depois a desligar.
 */
export const MASCOTE_LIMITE_POR_DIA = 3;
export const MASCOTE_INTERVALO_MIN = 4;

/* ══════════════ utilidades puras ══════════════ */

/** Hash curto (FNV-1a) — é ele que vai para o armazenamento, não o id. */
export function chaveDaMensagem(id: string): string {
  let h = 2166136261;
  for (let i = 0; i < id.length; i++) {
    h ^= id.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0).toString(36);
}

/** Corta em fim de palavra e põe reticências. */
export function textoCurto(texto: string, max: number): string {
  const limpo = texto.replace(/\s+/g, " ").trim();
  if (limpo.length <= max) return limpo;

  const corte = limpo.slice(0, max - 1);
  const espaco = corte.lastIndexOf(" ");
  const base = espaco > max * 0.6 ? corte.slice(0, espaco) : corte;
  return `${base.replace(/[\s,.;:—-]+$/, "")}…`;
}

/** `/painel/ciclo` combina com `/painel/ciclo` e `/painel/ciclo/qualquer`. */
export function rotaCombina(rota: string, prefixos: readonly string[]): boolean {
  return prefixos.some((p) => rota === p || rota.startsWith(`${p}/`));
}

/* ══════════════ escolha da mensagem ══════════════ */

export interface ContextoEscolha {
  /** Rota atual, ex.: "/painel/ciclo". */
  rota: string;
  /** chaveDaMensagem(id) → instante em que foi mostrada. */
  vistas: Record<string, number>;
  agora?: number;
  /** Ids a pular — usado por "Outra dica", para não repetir a que está na tela. */
  ignorarIds?: string[];
}

/**
 * A mensagem que ganha a vez agora, ou nada.
 *
 * Filtra as que ainda não podem repetir, as que não fazem sentido nesta rota
 * e as restritas a outra rota; das que sobram, vence a de maior prioridade
 * (com bônus para a que é específica desta tela).
 */
export function escolherMensagem(
  mensagens: readonly MascoteMensagem[],
  ctx: ContextoEscolha,
): MascoteMensagem | null {
  const agora = ctx.agora ?? Date.now();
  let melhor: MascoteMensagem | null = null;
  let melhorPontos = -Infinity;

  for (const m of mensagens) {
    if (ctx.ignorarIds?.includes(m.id)) continue;
    if (m.evitarEm && rotaCombina(ctx.rota, m.evitarEm)) continue;
    if (m.rotas && !rotaCombina(ctx.rota, m.rotas)) continue;

    const visto = ctx.vistas[chaveDaMensagem(m.id)];
    if (visto !== undefined && agora - visto < m.repetirEmHoras * 3_600_000) {
      continue;
    }

    const pontos = m.prioridade + (m.rotas ? 30 : 0);
    if (pontos > melhorPontos) {
      melhor = m;
      melhorPontos = pontos;
    }
  }

  return melhor;
}

/* ══════════════ assuntos que não sobem para o balão ══════════════ */

/**
 * O balão aparece sozinho, em qualquer tela, diante de quem estiver olhando.
 * Fertilidade, atraso menstrual, gravidez e contracepção são o dado que mais
 * pesa em mãos erradas — ficam nas telas dela, onde ela decide abrir.
 *
 * É uma rede de segurança para texto que vem de fora deste arquivo (a lista
 * de perguntas sugeridas, por exemplo, é compartilhada com a assistente e
 * pode ganhar itens novos sem que ninguém lembre do mascote).
 */
export const ASSUNTOS_INTIMOS =
  /f[ée]rt(il|eis)|atras|engravid|gravidez|ovula|p[íi]lula|anticoncepcional|contracep|aborto|viol[êe]ncia|agress/i;

/** Só o que pode aparecer no balão. */
export function semAssuntosIntimos(textos: readonly string[]): string[] {
  return textos.filter((t) => !ASSUNTOS_INTIMOS.test(t));
}

/* ══════════════ dicas de saúde ══════════════ */

export interface DicaSaude {
  id: string;
  rotulo?: string;
  titulo?: string;
  texto: string;
  cta?: MascoteAcao;
  rotas?: string[];
}

/**
 * Curadas à mão, e é de propósito.
 *
 * Nada aqui é puxado de feed externo: um app que trata de saúde não pode
 * publicar, sozinho, texto que ninguém da equipe leu. Cada dica é geral,
 * educativa e sem dose, diagnóstico ou promessa — a mesma régua do prompt da
 * assistente e da tela de exames. Ao mudar uma, releia com essa régua.
 */
export const DICAS_SAUDE: DicaSaude[] = [
  {
    id: "dengue",
    titulo: "Contra a dengue",
    texto:
      "Elimine água parada em vasos, pneus e calhas. Com febre e dor no corpo, procure a UBS e não se automedique.",
    cta: { rotulo: "Onde ser atendida", href: "/painel/unidades" },
  },
  {
    id: "preventivo",
    titulo: "Preventivo em dia",
    texto:
      "O Papanicolau ajuda a encontrar alterações no colo do útero cedo. Quem define a periodicidade é o profissional de saúde.",
    cta: { rotulo: "Ver exames", href: "/painel/exames" },
  },
  {
    id: "hpv",
    titulo: "Vacina contra o HPV",
    texto:
      "Ela protege contra vírus ligados ao câncer do colo do útero e é oferecida pelo SUS. Pergunte na UBS se você pode tomar.",
    cta: { rotulo: "Ver exames", href: "/painel/exames" },
  },
  {
    id: "mamas",
    titulo: "Conheça suas mamas",
    texto:
      "Notar o que é normal para você ajuda a perceber mudanças. Achou um nódulo ou alteração? Procure a UBS. O autoexame não substitui a consulta.",
    cta: { rotulo: "Autoexame", href: "/painel/autoexame" },
    rotas: ["/painel/autoexame", "/painel/exames"],
  },
  {
    id: "camisinha",
    titulo: "Proteção contra ISTs",
    texto:
      "A camisinha protege contra gravidez e contra ISTs ao mesmo tempo. O SUS distribui de graça nas unidades de saúde.",
    cta: { rotulo: "Onde ser atendida", href: "/painel/unidades" },
  },
  {
    id: "colica",
    titulo: "Cólica não precisa ser normal",
    texto:
      "Dor que atrapalha o trabalho ou os estudos merece uma conversa na UBS. O relatório do app ajuda a explicar o que você sente.",
    cta: { rotulo: "Gerar relatório", href: "/painel/relatorio" },
  },
  {
    id: "pressao",
    titulo: "Pressão em dia",
    texto:
      "Medir a pressão ao menos uma vez por ano é rápido e pode ser feito na UBS. Você também pode guardar as medidas no app.",
    cta: { rotulo: "Registrar medidas", href: "/painel/medidas" },
  },
  {
    id: "movimento",
    titulo: "Mexa o corpo",
    texto:
      "Atividade física ajuda o humor, o sono e o coração. A OMS recomenda ao menos 150 minutos de atividade moderada por semana para adultos.",
  },
  {
    id: "sono",
    titulo: "Sono importa",
    texto:
      "Dormir bem melhora o humor e a energia do dia seguinte. Manter horários parecidos para deitar e acordar ajuda.",
  },
  {
    id: "agua",
    titulo: "Hidratação",
    texto:
      "Nos dias quentes, beba água ao longo do dia, mesmo sem sentir sede.",
  },
  {
    id: "cabeca",
    rotulo: "Bem-estar",
    titulo: "Cuidar da cabeça também é saúde",
    texto:
      "Tristeza ou ansiedade que duram semanas merecem atenção. A UBS e o CAPS podem ajudar — você não precisa passar por isso sozinha.",
    cta: { rotulo: "Onde ser atendida", href: "/painel/unidades" },
  },
  {
    id: "diario",
    rotulo: "Dica do app",
    titulo: "Diário rápido",
    texto:
      "Registrar sintomas e humor ajuda o app a mostrar padrões do seu corpo — e você leva um resumo pronto para a consulta.",
    cta: { rotulo: "Abrir diário", href: "/painel/diario" },
  },
];

/**
 * As dicas como mensagens, giradas pelo dia do ano.
 *
 * A "dica do dia" muda a cada dia sem sorteio — e sem estado guardado no
 * servidor. A prioridade cai um pouco a cada posição, então a do dia vence as
 * outras quando várias estão elegíveis.
 *
 * Quando a dica leva a uma tela (`cta`), ela não aparece nessa mesma tela.
 */
export function dicasParaHoje(diaDoAno: number): MascoteMensagem[] {
  const n = DICAS_SAUDE.length;

  return DICAS_SAUDE.map((d, i) => {
    const ordem = (i - (diaDoAno % n) + n) % n; // 0 = a dica do dia
    return {
      id: `dica:${d.id}`,
      pilar: "saude" as const,
      rotulo: d.rotulo ?? "Dica de saúde",
      titulo: d.titulo,
      texto: d.texto,
      cta: d.cta,
      prioridade: 58 - ordem * 0.1,
      repetirEmHoras: 24 * 30,
      rotas: d.rotas,
      evitarEm: d.cta ? [d.cta.href] : undefined,
      emocao: "feliz" as const,
    };
  });
}
