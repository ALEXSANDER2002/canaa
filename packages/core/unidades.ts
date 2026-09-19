// Unidades de atendimento do município — UBS, hospital, policlínica.
//
// Conteúdo público: igual para todo mundo, sem dono, lido sem autenticação.
// Mesma natureza de `CityAction`, e pela mesma razão não tem `userId`.

export const TIPOS_UNIDADE = [
  { value: "ubs", label: "UBS", descricao: "Unidade Básica de Saúde" },
  { value: "hospital", label: "Hospital", descricao: "Pronto atendimento e internação" },
  { value: "policlinica", label: "Policlínica", descricao: "Consultas e exames especializados" },
  { value: "caps", label: "CAPS", descricao: "Saúde mental" },
  { value: "creas", label: "CREAS", descricao: "Assistência social especializada" },
  { value: "laboratorio", label: "Laboratório", descricao: "Coleta e exames" },
] as const;

export type TipoUnidade = (typeof TIPOS_UNIDADE)[number]["value"];

export function tipoUnidadeLabel(value: string): string {
  return TIPOS_UNIDADE.find((t) => t.value === value)?.label ?? value;
}

/**
 * Serviços que uma unidade pode oferecer.
 *
 * A lista é fechada de propósito. Se cada unidade descrevesse os próprios
 * serviços em texto livre, "preventivo", "Papanicolau" e "citológico" virariam
 * três coisas diferentes e a busca por exame pararia de funcionar.
 */
export const SERVICOS_UNIDADE = [
  { value: "preventivo", label: "Preventivo (Papanicolau)" },
  { value: "mamografia", label: "Mamografia" },
  { value: "prenatal", label: "Pré-natal" },
  { value: "planejamento", label: "Planejamento familiar" },
  { value: "teste_rapido", label: "Teste rápido (ISTs)" },
  { value: "vacinacao", label: "Vacinação" },
  { value: "ginecologia", label: "Consulta ginecológica" },
  { value: "psicologia", label: "Atendimento psicológico" },
  { value: "emergencia", label: "Emergência 24h" },
] as const;

export type ServicoUnidade = (typeof SERVICOS_UNIDADE)[number]["value"];

export function servicoLabel(value: string): string {
  return SERVICOS_UNIDADE.find((s) => s.value === value)?.label ?? value;
}

export interface Unidade {
  id: string;
  nome: string;
  tipo: string;
  endereco: string | null;
  bairro: string | null;
  telefone: string | null;
  /** "seg a sex, 7h às 17h" — texto livre, porque a realidade não cabe em grade. */
  horario: string | null;
  /** Lista separada por vírgula, com valores de `SERVICOS_UNIDADE`. */
  servicos: string;
  observacao: string | null;
  latitude: number | null;
  longitude: number | null;
  ativa: boolean;
}

export function servicosDa(unidade: Pick<Unidade, "servicos">): ServicoUnidade[] {
  return unidade.servicos
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean) as ServicoUnidade[];
}

export function oferece(
  unidade: Pick<Unidade, "servicos">,
  servico: ServicoUnidade,
): boolean {
  return servicosDa(unidade).includes(servico);
}

/** Unidades que fazem determinado exame, na ordem em que devem aparecer. */
export function unidadesQueOferecem<T extends Pick<Unidade, "servicos" | "nome">>(
  unidades: T[],
  servico: ServicoUnidade,
): T[] {
  return unidades
    .filter((u) => oferece(u, servico))
    .sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR"));
}
