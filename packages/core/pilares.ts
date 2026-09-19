// Os quatro pilares do produto — fonte única para web e app.
//
// A navegação inteira (hub, barra de abas, barra lateral, cor de acento)
// deriva desta lista. Adicionar um pilar aqui é adicioná-lo nas duas pontas;
// não existe uma segunda lista em lugar nenhum.
//
// TypeScript puro: sem React, sem Next, sem DOM.

export const PILARES = [
  {
    value: "protecao",
    /**
     * "Proteção", nunca "Violência".
     *
     * É a mesma razão pela qual a aba antiga se chamava "Cidade": quem olha o
     * celular dela de relance não pode ler, na tela inicial, uma palavra que a
     * denuncie. O conteúdo lá dentro é explícito — o rótulo de fora não é.
     */
    label: "Proteção",
    resumo: "Rede de apoio, seus direitos e ajuda a um toque.",
    /**
     * Índigo, e não vermelho, por dois motivos concretos: vermelho já
     * significa sangramento neste app e é o acento da marca; e tela vermelha
     * lida de relance parece emergência, que é exatamente o que esta tela não
     * pode parecer. 7,6:1 no branco.
     */
    cor: "#3c4a7d",
    corTexto: "#333f6d",
    corSuave: "#eef0f7",
    rota: "/protecao",
  },
  {
    value: "saude",
    label: "Saúde da Mulher",
    resumo: "Ciclo, exames, gestação e onde ser atendida.",
    /** O coral da marca mora aqui — é o pilar de origem do produto. */
    cor: "#ff5773",
    corTexto: "#c81a45",
    corSuave: "#fff0f3",
    rota: "/saude",
  },
  {
    value: "comunidade",
    label: "Comunidade",
    resumo: "Relatos anônimos e o que acontece na cidade.",
    cor: "#b4652e",
    corTexto: "#96511f",
    corSuave: "#f8efe7",
    rota: "/comunidade",
  },
  {
    value: "ia",
    label: "Assistente",
    resumo: "Tirar dúvida, desabafar, receber o conselho do dia.",
    cor: "#8b2fa8",
    corTexto: "#7d2a97",
    corSuave: "#f2e6f8",
    rota: "/ia",
  },
] as const;

export type PilarValue = (typeof PILARES)[number]["value"];
export type Pilar = (typeof PILARES)[number];

export function pilar(value: PilarValue): Pilar {
  const encontrado = PILARES.find((p) => p.value === value);
  if (!encontrado) throw new Error(`Pilar desconhecido: ${value}`);
  return encontrado;
}

/**
 * Pilares que aceitam publicidade.
 *
 * Proteção não está aqui e não pode entrar: anúncio ao lado de um botão de
 * socorro é a forma mais rápida de perder a confiança de quem mais precisa
 * dela. Ver `PARCERIA_LINHAS` em `parcerias.ts`.
 */
export const PILARES_COM_PARCERIA: PilarValue[] = ["saude", "comunidade"];

/**
 * Pilares em que nenhum acesso é registrado — nem no servidor, nem no
 * cliente, nem em métrica de produto.
 */
export const PILARES_SEM_RASTRO: PilarValue[] = ["protecao"];

export function aceitaParceria(p: PilarValue): boolean {
  return PILARES_COM_PARCERIA.includes(p);
}

export function deixaRastro(p: PilarValue): boolean {
  return !PILARES_SEM_RASTRO.includes(p);
}
