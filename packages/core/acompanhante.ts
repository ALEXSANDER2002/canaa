// Modo acompanhante — o parceiro acompanha e recebe dicas.
//
// Um app de saúde feminina que também é usado por um parceiro precisa assumir
// uma coisa desconfortável: **o parceiro pode ser o problema.** Daí as três
// regras que governam este arquivo e tudo que depende dele:
//
// 1. O convite parte sempre dela. Não existe "pedir acesso".
// 2. O escopo é escolhido item a item. Nada é liberado por padrão.
// 3. Nada do pilar Proteção é escopo possível — nem o cofre, nem a rede de
//    confiança, nem o fato de ela ter aberto aquelas telas. E revogar o
//    vínculo não avisa ele.

export const ESCOPOS_ACOMPANHANTE = [
  {
    value: "fase",
    label: "Fase do ciclo",
    descricao: "Em que fase você está hoje — sem datas de sangramento.",
    padrao: true,
  },
  {
    value: "previsao",
    label: "Previsão da próxima menstruação",
    descricao: "A data estimada, marcada como estimativa.",
    padrao: false,
  },
  {
    value: "humor",
    label: "Como você se sente",
    descricao: "O humor que você registrou hoje, sem a anotação escrita.",
    padrao: false,
  },
  {
    value: "gestacao",
    label: "Semana da gestação",
    descricao: "A semana atual e os marcos do período.",
    padrao: false,
  },
] as const;

export type EscopoAcompanhante = (typeof ESCOPOS_ACOMPANHANTE)[number]["value"];

export function escopoLabel(value: string): string {
  return ESCOPOS_ACOMPANHANTE.find((e) => e.value === value)?.label ?? value;
}

export const ESCOPOS_PADRAO: EscopoAcompanhante[] = ESCOPOS_ACOMPANHANTE.filter(
  (e) => e.padrao,
).map((e) => e.value);

/**
 * O que **nunca** é escopo, escrito como lista para poder ser mostrado na
 * tela de convite. Ela precisa ver o que ele não vai ver, e não só o que vai.
 */
export const FORA_DE_ESCOPO = [
  "Seu diário e suas anotações",
  "O que você escreve na comunidade",
  "Suas conversas com a assistente",
  "Tudo que está no pilar Proteção",
  "Seus exames, medidas e lembretes",
] as const;

export type StatusVinculo = "pendente" | "ativo" | "revogado";

export const STATUS_VINCULO_LABEL: Record<StatusVinculo, string> = {
  pendente: "Convite enviado, aguardando",
  ativo: "Acompanhando",
  revogado: "Encerrado",
};

export function escoposDe(lista: string): EscopoAcompanhante[] {
  return lista
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean) as EscopoAcompanhante[];
}

export function temEscopo(lista: string, escopo: EscopoAcompanhante): boolean {
  return escoposDe(lista).includes(escopo);
}

/**
 * Código do convite.
 *
 * Seis caracteres, sem vogais e sem os pares que se confundem lidos em voz
 * alta (0/O, 1/I, 5/S). Ela vai ditar isso para ele — não vai copiar e colar.
 */
const ALFABETO = "BCDFGHJKLMNPQRTVWXYZ2346789";

export function gerarCodigoConvite(
  aleatorio: () => number = Math.random,
): string {
  let codigo = "";
  for (let i = 0; i < 6; i++) {
    codigo += ALFABETO[Math.floor(aleatorio() * ALFABETO.length)];
  }
  return codigo;
}

export const AVISO_CONVITE =
  "Você escolhe o que ele vê e pode encerrar quando quiser. Ele não é avisado quando você encerra, e não consegue ver nada do pilar Proteção em nenhuma hipótese.";

/* ══════════════ dicas para quem acompanha ══════════════ */

/**
 * A dica fala com ELE sobre como ajudar — nunca sobre o corpo dela.
 *
 * "Ela está na fase lútea, a progesterona sobe" é informação sobre o corpo de
 * outra pessoa entregue a quem não pediu por ela. "Ela pode estar com menos
 * energia hoje; assuma alguma tarefa da casa sem perguntar" é a mesma
 * informação virada para a única coisa que ele pode fazer com ela.
 */
export const DICAS_POR_FASE: Record<string, string[]> = {
  menstrual: [
    "Assuma uma tarefa da casa hoje sem perguntar de quem é a vez.",
    "Cólica não é frescura e não passa com 'relaxa'. Ofereça bolsa quente e silêncio.",
    "Se ela quiser ficar quieta, não é com você.",
  ],
  folicular: [
    "A disposição costuma voltar agora. É um bom momento para propor aquele programa que vocês adiaram.",
    "Ela tende a topar mais coisas nesta fase — mas topar não é obrigação.",
  ],
  ovulatoria: [
    "Se vocês estão tentando engravidar, é esta a janela. Se não estão, é a semana de mais atenção com o método.",
    "Pergunte como ela quer ser acompanhada. A resposta muda de mês para mês.",
  ],
  lutea: [
    "Pode aparecer irritação, inchaço e sono ruim. Nada disso é sobre você — não leve para o pessoal.",
    "Evite decisões grandes e conversas difíceis se der para esperar uma semana.",
    "Perguntar 'você está de TPM?' no meio de uma discussão transforma o que ela sente em sintoma. Não pergunte.",
  ],
};

export function dicaDoDia(
  fase: string,
  diaDoAno: number,
): string | null {
  const dicas = DICAS_POR_FASE[fase];
  if (!dicas || dicas.length === 0) return null;
  return dicas[diaDoAno % dicas.length];
}
