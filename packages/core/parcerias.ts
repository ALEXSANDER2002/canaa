// Parcerias e publicidade.
//
// É a única fonte de receita desenhada do produto, e também o que corrói a
// confiança mais rápido num app que trata de violência. As três linhas abaixo
// não são recomendação de estilo: são a política, e o código que publica um
// anúncio precisa passar por `podePublicar()`.

import { aceitaParceria, type PilarValue } from "./pilares";

export const TIPOS_PARCEIRO = [
  { value: "farmacia", label: "Farmácia" },
  { value: "laboratorio", label: "Laboratório" },
  { value: "clinica", label: "Clínica" },
  { value: "ong", label: "ONG / coletivo" },
  { value: "outro", label: "Outro" },
] as const;

export type TipoParceiro = (typeof TIPOS_PARCEIRO)[number]["value"];

export const STATUS_CAMPANHA = [
  { value: "rascunho", label: "Rascunho" },
  { value: "enviada", label: "Aguardando aprovação" },
  { value: "aprovada", label: "Aprovada" },
  { value: "recusada", label: "Recusada" },
  { value: "pausada", label: "Pausada" },
] as const;

export type StatusCampanha = (typeof STATUS_CAMPANHA)[number]["value"];

export function statusCampanhaLabel(value: string): string {
  return STATUS_CAMPANHA.find((s) => s.value === value)?.label ?? value;
}

/**
 * O rótulo é obrigatório e não é configurável.
 *
 * Anúncio que não se identifica como anúncio, numa tela de saúde, é o começo
 * de alguém tomar decisão clínica achando que é orientação do app.
 */
export const ROTULO_PARCERIA = "Parceria";

export const PARCERIA_LINHAS = [
  "Nenhum anúncio no pilar Proteção — nem um, nem discreto.",
  "Nenhuma segmentação por dado de saúde. Mostrar teste de gravidez para quem atrasou é revelar o atraso a quem pagou pelo espaço.",
  "Nenhuma peça que prometa resultado clínico, cura ou diagnóstico.",
] as const;

export interface CampanhaBase {
  pilar: string;
  status: string;
  inicioEm: Date | string | null;
  fimEm: Date | string | null;
}

/**
 * Uma peça só vai ao ar quando **todas** as condições valem. Escrito como
 * lista de recusas, e não como uma expressão booleana longa, para que o
 * motivo da recusa possa ser mostrado a quem enviou.
 */
export function motivoParaNaoPublicar(
  campanha: CampanhaBase,
  agora: Date = new Date(),
): string | null {
  if (!aceitaParceria(campanha.pilar as PilarValue)) {
    return `O pilar escolhido não aceita publicidade. ${PARCERIA_LINHAS[0]}`;
  }
  if (campanha.status !== "aprovada") {
    return "A peça ainda não foi aprovada pela equipe.";
  }
  if (campanha.inicioEm && new Date(campanha.inicioEm) > agora) {
    return "A veiculação ainda não começou.";
  }
  if (campanha.fimEm && new Date(campanha.fimEm) < agora) {
    return "O período de veiculação terminou.";
  }
  return null;
}

export function podePublicar(
  campanha: CampanhaBase,
  agora: Date = new Date(),
): boolean {
  return motivoParaNaoPublicar(campanha, agora) === null;
}

/**
 * Segmentação permitida: bairro e cidade, e mais nada.
 *
 * Não existe campo de segmentação por ciclo, por humor, por idade gestacional
 * nem por sintoma — e a ausência é proposital. Um campo desses no schema vira
 * uma opção no painel, e uma opção no painel acaba sendo usada.
 */
export interface Segmentacao {
  cidade: string | null;
  bairro: string | null;
}
