// Comunidade — apelidos e categorias.
//
// Regra central: o nome real da usuária NUNCA aparece na comunidade. Dado
// menstrual, de gestação e de sintoma é dos mais sensíveis que existem, e
// numa cidade de 77 mil habitantes as pessoas se reconhecem. O apelido é
// derivado do id, então é estável — dá para reconhecer a mesma pessoa entre
// posts sem nunca saber quem é.

export const COMMUNITY_CATEGORIES = [
  { value: "ciclo", label: "Ciclo e menstruação" },
  { value: "gestacao", label: "Gestação e pós-parto" },
  { value: "saude", label: "Saúde e exames" },
  { value: "desabafo", label: "Desabafo" },
  { value: "outro", label: "Outro" },
] as const;

export type CommunityCategory = (typeof COMMUNITY_CATEGORIES)[number]["value"];

export function categoryLabel(value: string): string {
  return (
    COMMUNITY_CATEGORIES.find((c) => c.value === value)?.label ?? "Outro"
  );
}

/** Flores e plantas do cerrado e da Amazônia — nada de nome de pessoa. */
const NOMES = [
  "Vitória-régia",
  "Ipê",
  "Açaí",
  "Jasmim",
  "Buriti",
  "Copaíba",
  "Andiroba",
  "Pequi",
  "Cumaru",
  "Sucupira",
  "Jatobá",
  "Mangaba",
  "Cajá",
  "Pitanga",
  "Bacuri",
  "Murici",
  "Taperebá",
  "Camu-camu",
  "Guaraná",
  "Cupuaçu",
  "Jenipapo",
  "Tucumã",
  "Patauá",
  "Bacaba",
] as const;

const ADJETIVOS = [
  "serena",
  "atenta",
  "firme",
  "leve",
  "clara",
  "quieta",
  "viva",
  "livre",
  "doce",
  "forte",
  "calma",
  "sábia",
] as const;

/** Hash estável e simples — não precisa ser criptográfico, só determinístico. */
function hash(texto: string): number {
  let h = 2166136261;
  for (let i = 0; i < texto.length; i++) {
    h ^= texto.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
}

/**
 * Apelido público e estável a partir do id da usuária.
 *
 * O mesmo id sempre gera o mesmo apelido, então as respostas de uma pessoa
 * são reconhecíveis ao longo do tempo — o que constrói confiança — sem que
 * ninguém consiga ligar o apelido a um nome.
 */
export function apelidoDe(userId: string): string {
  const h = hash(userId);
  const nome = NOMES[h % NOMES.length];
  const adj = ADJETIVOS[Math.floor(h / NOMES.length) % ADJETIVOS.length];
  return `${nome} ${adj}`;
}

/** Iniciais para o avatar do apelido. */
export function iniciaisApelido(apelido: string): string {
  return apelido
    .split(/[\s-]+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
}

/**
 * Aviso obrigatório da comunidade.
 *
 * Fica no topo do feed e junto do campo de resposta. Não é burocracia: a
 * literatura sobre apps de saúde mostra que a troca entre usuárias é um dos
 * motivos de uso, e é também onde a desinformação circula. Dizer isso em voz
 * alta, toda vez, é o mínimo.
 */
export const AVISO_COMUNIDADE =
  "Aqui são experiências de outras mulheres, não orientação médica. " +
  "Nada do que você ler substitui uma consulta — em caso de dor forte, " +
  "sangramento fora do normal ou dúvida sobre gravidez, procure a UBS.";

/** Limites de tamanho, iguais nos dois lados. */
export const LIMITES = {
  postMin: 10,
  postMax: 1200,
  replyMin: 2,
  replyMax: 800,
} as const;

/* ══════════════ selo botânico ══════════════ */

/**
 * O desenho que acompanha cada apelido.
 *
 * A comunidade já nomeia cada mulher por uma planta da região — "Buriti
 * serena", "Cupuaçu firme". A ideia existia só como texto, e o avatar era
 * duas iniciais num círculo cinza, que é o avatar de qualquer produto do
 * mundo. O selo transforma o apelido em marca: mesmas pétalas, mesmo giro,
 * mesma cor, sempre, derivados do MESMO hash que escolheu o nome.
 *
 * Duas consequências que importam mais do que a estética:
 *
 * 1. Ela se reconhece de longe, rolando o feed, sem precisar ler o apelido.
 * 2. Continua irreversível. O selo vem do hash, e o hash não volta ao id.
 */

/**
 * Tons de mata — foscos e escuros de propósito.
 *
 * Não reutilizam as cores de papel: coral é ação, índigo é Proteção, âmbar é
 * Comunidade, lilás é Assistente. Se o selo pegasse emprestada uma dessas, um
 * avatar passaria a parecer um botão ou uma categoria. Estes vivem à parte, na
 * mesma faixa de luminosidade entre si, para o feed inteiro ler como um
 * jardim e não como confete.
 */
const TONS_JARDIM = [
  "#6c7b4a", // folha
  "#8a6a3c", // buriti
  "#7a4a5e", // pitanga
  "#4f6b6a", // copaíba
  "#86603f", // cumaru
  "#5f5a7d", // jenipapo
  "#94614a", // taperebá
  "#667048", // sucupira
] as const;

export interface SeloBotanico {
  /** 5 a 8 pétalas. */
  petalas: number;
  /** Giro inicial, em graus — evita que todos os selos apontem para cima. */
  giro: number;
  /** 0,5 a 0,9 — pétala estreita como folha, ou larga como flor. */
  largura: number;
  cor: string;
}

/** Mesmo id → mesmo selo, sempre. Deriva do mesmo hash do apelido. */
export function seloDe(userId: string): SeloBotanico {
  const h = hash(userId);
  return {
    petalas: 5 + ((h >> 3) % 4),
    giro: (h >> 7) % 72,
    largura: 0.5 + (((h >> 11) % 5) * 0.1),
    cor: TONS_JARDIM[(h >> 17) % TONS_JARDIM.length],
  };
}
