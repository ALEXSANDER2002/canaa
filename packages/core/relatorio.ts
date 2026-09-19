// Relatório de saúde — o resumo que ela leva para a consulta na UBS.
//
// TypeScript puro: nenhum acesso a banco, nenhuma data "agora" implícita. Só
// transforma registros crus em seções prontas para desenhar. Web e app chamam
// a MESMA função, então o papel impresso no painel e a tela do celular nunca
// divergem — e divergir aqui seria grave: é o documento que a pessoa mostra
// para alguém decidir a conduta dela.

import {
  predictCycle,
  cycleStats,
  pregnancyProgress,
  formatDate,
  formatDateLong,
} from "./cycle";
import { MOOD_OPTIONS, METRIC_TYPES, GOAL_OPTIONS } from "./constants";

export interface DadosRelatorio {
  conta: { name: string; birthDate: Date | null; goal: string | null };
  ciclos: { startDate: Date }[];
  humores: { mood: string; date: Date }[];
  diarios: { date: Date; pain: number | null; energy: number | null }[];
  medidas: { type: string; value: number; value2: number | null; date: Date }[];
  gestacao: { lastPeriodDate: Date } | null;
  /** "Agora" entra por parâmetro para o relatório ser testável e determinístico. */
  agora?: Date;
}

export interface LinhaRelatorio {
  rotulo: string;
  valor: string;
  /** Merece destaque na consulta — irregularidade, atraso, dor recorrente. */
  atencao?: boolean;
}

export interface SecaoRelatorio {
  titulo: string;
  linhas: LinhaRelatorio[];
}

export interface Relatorio {
  geradoEm: string;
  nome: string;
  secoes: SecaoRelatorio[];
  /**
   * Pontos que valem ser ditos em voz alta na consulta.
   *
   * Existe porque o problema real não é a médica não ter os dados — é a
   * consulta durar sete minutos e a pessoa esquecer o que queria falar.
   */
  levarParaConsulta: string[];
  aviso: string;
}

const AVISO =
  "Relatório gerado a partir dos registros da própria usuária. As previsões são estimativas e não substituem avaliação profissional.";

export function montarRelatorio(dados: DadosRelatorio): Relatorio {
  const agora = dados.agora ?? new Date();
  const inicios = dados.ciclos.map((c) => c.startDate);

  const previsao = predictCycle(inicios);
  const stats = cycleStats(inicios);
  const gestacao = dados.gestacao
    ? pregnancyProgress(dados.gestacao.lastPeriodDate)
    : null;

  const secoes: SecaoRelatorio[] = [];
  const levar: string[] = [];

  /* ---- dados gerais ---- */
  const objetivo =
    GOAL_OPTIONS.find((g) => g.value === dados.conta.goal)?.label ??
    "Acompanhar o ciclo";

  const geral: LinhaRelatorio[] = [
    { rotulo: "Nome", valor: dados.conta.name || "—" },
    { rotulo: "Objetivo", valor: objetivo },
  ];
  if (dados.conta.birthDate) {
    geral.push({
      rotulo: "Nascimento",
      valor: `${formatDate(dados.conta.birthDate)} (${idadeEm(dados.conta.birthDate, agora)} anos)`,
    });
  }
  secoes.push({ titulo: "Dados gerais", linhas: geral });

  /* ---- ciclo ---- */
  const ciclo: LinhaRelatorio[] = [
    { rotulo: "Ciclos registrados", valor: String(stats.cyclesTracked) },
  ];

  if (stats.averageLength) {
    ciclo.push(
      { rotulo: "Duração média", valor: `${stats.averageLength} dias` },
      {
        rotulo: "Mais curto / mais longo",
        valor: `${stats.shortest} / ${stats.longest} dias`,
      },
      {
        rotulo: "Regularidade",
        valor: stats.regularity === "regular" ? "Regular" : "Irregular",
        atencao: stats.regularity === "irregular",
      },
    );

    if (stats.regularity === "irregular") {
      levar.push(
        `Meu ciclo varia ${stats.variation} dias entre o mais curto e o mais longo.`,
      );
    }
  }

  if (previsao) {
    const faltam = diasEntre(agora, previsao.nextPeriodDate);
    ciclo.push({
      rotulo: "Próxima menstruação (prevista)",
      valor: formatDate(previsao.nextPeriodDate),
      atencao: faltam < 0,
    });

    // Atraso é a informação que mais muda a conduta numa consulta — precisa
    // aparecer em destaque, não escondido numa data que a pessoa tem que
    // comparar de cabeça com o dia de hoje.
    if (faltam < 0) {
      ciclo.push({
        rotulo: "Atraso",
        valor: `${Math.abs(faltam)} dias além do previsto`,
        atencao: true,
      });
      levar.push(`Estou com ${Math.abs(faltam)} dias de atraso.`);
    }
  }

  if (inicios.length > 0) {
    const ultima = [...inicios].sort((a, b) => b.getTime() - a.getTime())[0];
    ciclo.push({
      rotulo: "Última menstruação registrada",
      valor: formatDate(ultima),
    });
  }

  secoes.push({ titulo: "Ciclo menstrual", linhas: ciclo });

  /* ---- gestação ---- */
  if (gestacao) {
    secoes.push({
      titulo: "Gestação",
      linhas: [
        {
          rotulo: "Idade gestacional",
          valor: `${gestacao.weeks} semanas e ${gestacao.days} dias`,
        },
        {
          rotulo: "Data provável do parto",
          valor: formatDateLong(gestacao.dueDate),
        },
      ],
    });
  }

  /* ---- medidas ---- */
  const ultimaPorTipo = METRIC_TYPES.map((t) => {
    const doTipo = dados.medidas
      .filter((m) => m.type === t.value)
      .sort((a, b) => b.date.getTime() - a.date.getTime());
    return { tipo: t, ultima: doTipo[0] };
  }).filter((x) => x.ultima);

  if (ultimaPorTipo.length > 0) {
    secoes.push({
      titulo: "Últimas medidas",
      linhas: ultimaPorTipo.map(({ tipo, ultima }) => ({
        rotulo: tipo.label,
        valor: `${ultima!.value}${
          tipo.value === "pressao" && ultima!.value2 ? `/${ultima!.value2}` : ""
        } ${tipo.unit} · ${formatDate(ultima!.date)}`,
      })),
    });
  }

  /* ---- bem-estar ---- */
  const contagem = new Map<string, number>();
  for (const m of dados.humores) {
    contagem.set(m.mood, (contagem.get(m.mood) ?? 0) + 1);
  }
  const maisComum = [...contagem.entries()].sort((a, b) => b[1] - a[1])[0];
  const humorLabel = maisComum
    ? MOOD_OPTIONS.find((o) => o.value === maisComum[0])?.label
    : null;

  const comDor = dados.diarios.filter((d) => d.pain !== null);
  const dorForte = comDor.filter((d) => (d.pain ?? 0) >= 4);
  const mediaDor = comDor.length
    ? comDor.reduce((s, d) => s + (d.pain ?? 0), 0) / comDor.length
    : null;

  const bem: LinhaRelatorio[] = [
    { rotulo: "Registros de humor", valor: String(dados.humores.length) },
  ];
  if (humorLabel) bem.push({ rotulo: "Humor predominante", valor: humorLabel });
  bem.push({ rotulo: "Check-ins no diário", valor: String(dados.diarios.length) });

  if (mediaDor !== null) {
    bem.push({
      rotulo: "Cólica média (1 a 5)",
      valor: mediaDor.toFixed(1),
      atencao: mediaDor >= 3.5,
    });
  }
  if (dorForte.length > 0) {
    bem.push({
      rotulo: "Dias de dor forte (4 ou 5)",
      valor: `${dorForte.length} nos últimos 30 dias`,
      atencao: dorForte.length >= 3,
    });
    if (dorForte.length >= 3) {
      levar.push(
        `Tive ${dorForte.length} dias de cólica forte no último mês.`,
      );
    }
  }

  secoes.push({ titulo: "Bem-estar (últimos 30 dias)", linhas: bem });

  return {
    geradoEm: formatDate(agora),
    nome: dados.conta.name,
    secoes,
    levarParaConsulta: levar,
    aviso: AVISO,
  };
}

/**
 * Versão em texto puro, para compartilhar por mensagem.
 *
 * No celular, "imprimir" quase nunca é o gesto — o gesto é mandar no WhatsApp
 * ou salvar. Texto simples abre em qualquer aparelho, não depende de app de
 * PDF e continua legível se for colado dentro de outra mensagem.
 */
export function relatorioEmTexto(r: Relatorio): string {
  const linhas: string[] = [
    `CANAÃ DELAS — Relatório de saúde`,
    `${r.nome} · ${r.geradoEm}`,
    "",
  ];

  for (const secao of r.secoes) {
    linhas.push(secao.titulo.toUpperCase());
    for (const l of secao.linhas) {
      linhas.push(`  ${l.rotulo}: ${l.valor}${l.atencao ? "  (!)" : ""}`);
    }
    linhas.push("");
  }

  if (r.levarParaConsulta.length > 0) {
    linhas.push("O QUE EU QUERO FALAR NA CONSULTA");
    for (const p of r.levarParaConsulta) linhas.push(`  - ${p}`);
    linhas.push("");
  }

  linhas.push(r.aviso);
  return linhas.join("\n");
}

function idadeEm(nascimento: Date, agora: Date): number {
  let anos = agora.getFullYear() - nascimento.getFullYear();
  const m = agora.getMonth() - nascimento.getMonth();
  if (m < 0 || (m === 0 && agora.getDate() < nascimento.getDate())) anos--;
  return anos;
}

function diasEntre(de: Date, ate: Date): number {
  const dia = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
  return Math.round((dia(ate).getTime() - dia(de).getTime()) / 86_400_000);
}
