// Exames e cuidados preventivos por faixa etária (orientativo).
//
// Baseado em recomendações gerais de saúde da mulher — a periodicidade exata
// é definida por um profissional, e a tela diz isso.
//
// Vive no núcleo porque as duas pontas precisam da mesma lista: a web mostra a
// grade completa, o app mostra a faixa dela e liga cada item à unidade que faz
// o exame (`servico`) e a um lembrete (`sugestaoLembrete`).

import type { ServicoUnidade } from "./unidades";

export interface ItemExame {
  title: string;
  detail: string;
  /**
   * Serviço correspondente numa unidade de atendimento. Nulo quando o cuidado
   * não depende de unidade nenhuma — autoexame, por exemplo.
   */
  servico: ServicoUnidade | null;
  /** Texto pronto para virar um `Reminder`, quando fizer sentido lembrar. */
  sugestaoLembrete: string | null;
}

export interface ScreeningGroup {
  age: string;
  /** Idade mínima da faixa — usada para escolher a faixa dela. */
  minima: number;
  items: ItemExame[];
}

export const SCREENINGS: ScreeningGroup[] = [
  {
    age: "A partir dos 15",
    minima: 15,
    items: [
      {
        title: "Vacina HPV",
        detail: "Proteção contra o papilomavírus.",
        servico: "vacinacao",
        sugestaoLembrete: "Tomar a vacina HPV",
      },
      {
        title: "Consulta ginecológica",
        detail: "Orientação e acompanhamento.",
        servico: "ginecologia",
        sugestaoLembrete: "Marcar consulta ginecológica",
      },
    ],
  },
  {
    age: "25 a 39 anos",
    minima: 25,
    items: [
      {
        title: "Preventivo (Papanicolau)",
        detail: "Periodicidade orientada pelo profissional.",
        servico: "preventivo",
        sugestaoLembrete: "Fazer o preventivo",
      },
      {
        title: "Autoexame das mamas",
        detail: "Mensal, alguns dias após a menstruação.",
        servico: null,
        sugestaoLembrete: "Autoexame das mamas",
      },
      {
        title: "Aferição de pressão",
        detail: "Ao menos uma vez por ano.",
        servico: "ginecologia",
        sugestaoLembrete: "Medir a pressão na UBS",
      },
    ],
  },
  {
    age: "40 a 49 anos",
    minima: 40,
    items: [
      {
        title: "Mamografia",
        detail: "Conforme avaliação de risco e orientação médica.",
        servico: "mamografia",
        sugestaoLembrete: "Marcar mamografia",
      },
      {
        title: "Preventivo",
        detail: "Manter em dia.",
        servico: "preventivo",
        sugestaoLembrete: "Fazer o preventivo",
      },
      {
        title: "Glicemia e colesterol",
        detail: "Exames de rotina.",
        servico: "teste_rapido",
        sugestaoLembrete: "Exames de rotina (glicemia e colesterol)",
      },
    ],
  },
  {
    age: "50 anos ou mais",
    minima: 50,
    items: [
      {
        title: "Mamografia",
        detail: "Rastreamento periódico do câncer de mama.",
        servico: "mamografia",
        sugestaoLembrete: "Marcar mamografia",
      },
      {
        title: "Densitometria óssea",
        detail: "Avaliação da saúde dos ossos.",
        servico: null,
        sugestaoLembrete: "Marcar densitometria óssea",
      },
      {
        title: "Saúde do climatério",
        detail: "Acompanhamento de sintomas da menopausa.",
        servico: "ginecologia",
        sugestaoLembrete: "Consulta sobre climatério",
      },
    ],
  },
];

/**
 * A faixa dela.
 *
 * Devolve a faixa de maior `minima` que a idade alcança — e nada quando a
 * data de nascimento não foi informada. Não chuta faixa: mostrar exame de 50
 * anos para quem tem 20 desgasta a tela toda.
 */
export function faixaPara(
  birthDate: Date | string | null | undefined,
  agora: Date = new Date(),
): ScreeningGroup | null {
  if (!birthDate) return null;
  const nascimento = new Date(birthDate);
  if (Number.isNaN(nascimento.getTime())) return null;

  let idade = agora.getFullYear() - nascimento.getFullYear();
  const virouAniversario =
    agora.getMonth() > nascimento.getMonth() ||
    (agora.getMonth() === nascimento.getMonth() &&
      agora.getDate() >= nascimento.getDate());
  if (!virouAniversario) idade -= 1;

  const candidatas = SCREENINGS.filter((g) => idade >= g.minima);
  return candidatas.length ? candidatas[candidatas.length - 1] : null;
}
