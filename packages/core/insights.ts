// Insight do dia e rastreador de sintomas.
//
// Nenhum dos dois diagnostica. O rastreador em especial produz um RESUMO
// PARA LEVAR À CONSULTA, nunca um resultado — a diferença não é jurídica, é
// de segurança: dizer "você tem endometriose" a partir de um questionário
// seria irresponsável, e dizer "leve isso ao médico" é exatamente o que
// encurta os 7 a 10 anos que hoje se leva até o diagnóstico.

import type { CyclePhaseInfo, CycleStats } from "./cycle";
import type { ChanceGravidez } from "./calendar";

// --- Insight do dia --------------------------------------------------------

export interface Insight {
  titulo: string;
  texto: string;
}

/**
 * Uma frase por dia, escolhida pela fase e pelo que já foi registrado.
 *
 * É o equivalente aos "daily insights" do Flo, que lá são pagos. Aqui é de
 * graça e sai do dado que já existe — nenhuma chamada de rede, nenhum modelo.
 */
export function insightDoDia(
  phase: CyclePhaseInfo | null,
  stats: CycleStats,
  chance: ChanceGravidez,
  diaDoCiclo: number | null,
): Insight | null {
  if (!phase) return null;

  if (stats.regularity === "irregular" && (stats.variation ?? 0) > 7) {
    return {
      titulo: "Seus ciclos variam bastante",
      texto: `Entre o mais curto e o mais longo há ${stats.variation} dias de diferença. Isso não é motivo para pânico, mas é o tipo de padrão que a equipe da UBS gosta de saber. O relatório do app já mostra isso pronto.`,
    };
  }

  if (chance === "muito-alta") {
    return {
      titulo: "Seus dias mais férteis são agora",
      texto:
        "A chance de engravidar é maior nos dois dias antes da ovulação e no dia dela. Se você não quer engravidar agora, é o período de mais atenção.",
    };
  }

  switch (phase.key) {
    case "menstrual":
      return {
        titulo: "Descanso não é preguiça",
        texto:
          "Nos primeiros dias o corpo está gastando energia para renovar o endométrio. Cólica leve é comum — mas dor que impede de trabalhar ou estudar não é para ser normalizada.",
      };
    case "folicular":
      return {
        titulo: "A energia tende a subir agora",
        texto:
          "Depois da menstruação o estrogênio sobe e muitas mulheres se sentem mais dispostas. É uma boa janela para marcar aquele exame que você vem adiando.",
      };
    case "ovulatoria":
      return {
        titulo: "Sinais que o corpo dá",
        texto:
          "Perto da ovulação o corrimento costuma ficar transparente e elástico, parecido com clara de ovo. Registrar isso ajuda a previsão a ficar mais certeira.",
      };
    case "lutea":
      return {
        titulo: "Se vier TPM, você não está imaginando",
        texto:
          diaDoCiclo && diaDoCiclo > 0
            ? "Inchaço, seios sensíveis e oscilação de humor nos dias antes da menstruação têm explicação hormonal. Registrar ajuda a enxergar o padrão do seu corpo."
            : "Inchaço e oscilação de humor antes da menstruação têm explicação hormonal.",
      };
  }
}

// --- Rastreador de sintomas ------------------------------------------------

export interface Pergunta {
  id: string;
  texto: string;
  /** Peso do "sim" na pontuação. */
  peso: number;
}

export interface Rastreador {
  slug: string;
  condicao: string;
  intro: string;
  perguntas: Pergunta[];
  /** A partir de quantos pontos vale levar à consulta. */
  corte: number;
}

/**
 * Rastreadores educativos.
 *
 * As perguntas seguem os sinais que a literatura clínica associa a cada
 * condição, mas a pontuação NÃO é um escore validado — serve só para decidir
 * se o app sugere ou não levar o assunto à consulta.
 */
export const RASTREADORES: Rastreador[] = [
  {
    slug: "endometriose",
    condicao: "Endometriose",
    intro:
      "A endometriose atinge cerca de 1 em cada 10 mulheres e leva, em média, de 7 a 10 anos até ser diagnosticada — muito porque a dor é tratada como normal. Estas perguntas não dão diagnóstico: servem para você chegar na consulta sabendo o que contar.",
    corte: 3,
    perguntas: [
      { id: "e1", texto: "Sua cólica já impediu você de trabalhar, estudar ou sair?", peso: 2 },
      { id: "e2", texto: "A dor continua mesmo tomando analgésico comum?", peso: 2 },
      { id: "e3", texto: "Sente dor durante ou depois da relação sexual?", peso: 2 },
      { id: "e4", texto: "Sente dor ao evacuar ou urinar durante a menstruação?", peso: 2 },
      { id: "e5", texto: "Seu sangramento é muito intenso ou dura mais de 7 dias?", peso: 1 },
      { id: "e6", texto: "Alguém da sua família tem endometriose?", peso: 1 },
      { id: "e7", texto: "Já tentou engravidar por mais de um ano sem conseguir?", peso: 1 },
    ],
  },
  {
    slug: "sop",
    condicao: "Síndrome dos ovários policísticos",
    intro:
      "A SOP também atinge cerca de 1 em cada 10 mulheres em idade reprodutiva e é uma das causas mais comuns de ciclo irregular. Estas perguntas não dão diagnóstico — organizam o que vale contar na consulta.",
    corte: 3,
    perguntas: [
      { id: "s1", texto: "Seus ciclos costumam passar de 35 dias ou falham?", peso: 2 },
      { id: "s2", texto: "Notou aumento de pelos no rosto, peito ou abdômen?", peso: 2 },
      { id: "s3", texto: "Tem acne persistente que não melhora?", peso: 1 },
      { id: "s4", texto: "Ganhou peso sem mudar alimentação, sobretudo na barriga?", peso: 1 },
      { id: "s5", texto: "Tem manchas escuras na nuca, axilas ou virilha?", peso: 2 },
      { id: "s6", texto: "Está com queda de cabelo no alto da cabeça?", peso: 1 },
      { id: "s7", texto: "Alguém da família tem SOP ou diabetes tipo 2?", peso: 1 },
    ],
  },
];

export function getRastreador(slug: string): Rastreador | undefined {
  return RASTREADORES.find((r) => r.slug === slug);
}

export interface ResultadoRastreio {
  pontos: number;
  maximo: number;
  valeLevar: boolean;
  titulo: string;
  texto: string;
  /** Texto pronto para ela mostrar na UBS. */
  resumoParaConsulta: string;
}

/**
 * Fecha o rastreio.
 *
 * Repare no que NÃO existe aqui: nenhuma probabilidade, nenhum "provável",
 * nenhum nome de doença afirmado. Só duas saídas — vale levar à consulta ou
 * siga registrando.
 */
export function avaliarRastreio(
  rastreador: Rastreador,
  respostas: Record<string, boolean>,
): ResultadoRastreio {
  const marcadas = rastreador.perguntas.filter((p) => respostas[p.id]);
  const pontos = marcadas.reduce((s, p) => s + p.peso, 0);
  const maximo = rastreador.perguntas.reduce((s, p) => s + p.peso, 0);
  const valeLevar = pontos >= rastreador.corte;

  const lista = marcadas.map((p) => `• ${p.texto}`).join("\n");

  return {
    pontos,
    maximo,
    valeLevar,
    titulo: valeLevar
      ? "Vale conversar com um profissional"
      : "Siga registrando",
    texto: valeLevar
      ? `Você marcou sinais que costumam ser investigados quando se fala em ${rastreador.condicao.toLowerCase()}. Isso não quer dizer que você tem — quer dizer que vale levar à consulta. Leve o resumo abaixo para a UBS.`
      : `Você marcou poucos sinais. Isso não descarta nada, e nada aqui substitui uma consulta. Continue registrando: o padrão do seu ciclo ao longo dos meses vale mais do que qualquer questionário.`,
    resumoParaConsulta: marcadas.length
      ? `O que eu venho sentindo:\n${lista}`
      : "Não marquei nenhum dos sinais listados.",
  };
}
