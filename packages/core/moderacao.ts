// Moderação da comunidade.
//
// Hoje três denúncias ocultam um relato automaticamente e ninguém revisa — o
// conteúdo some e fica sumido. O automático continua (é melhor esconder um
// relato legítimo por engano do que deixar desinformação sobre gravidez
// circulando), mas passa a ter a segunda metade: uma fila com decisão humana.

export const MOTIVOS_DENUNCIA = [
  { value: "desinformacao", label: "Informação de saúde perigosa" },
  { value: "identificacao", label: "Identifica alguém pelo nome ou endereço" },
  { value: "ataque", label: "Ataque ou ameaça a outra pessoa" },
  { value: "propaganda", label: "Propaganda ou venda" },
  { value: "outro", label: "Outro" },
] as const;

export type MotivoDenuncia = (typeof MOTIVOS_DENUNCIA)[number]["value"];

export const DECISOES = [
  {
    value: "restaurar",
    label: "Restaurar",
    descricao: "A denúncia não procede. Volta ao feed e o contador zera.",
  },
  {
    value: "remover",
    label: "Remover",
    descricao: "Sai do feed em definitivo. A autora não é notificada.",
  },
  {
    value: "silenciar",
    label: "Silenciar autora",
    descricao:
      "Remove e impede novas publicações por 30 dias. Só para reincidência.",
  },
] as const;

export type Decisao = (typeof DECISOES)[number]["value"];

export function decisaoLabel(value: string): string {
  return DECISOES.find((d) => d.value === value)?.label ?? value;
}

/** Denúncias necessárias para ocultar sozinho. Ver `CommunityPost.reports`. */
export const DENUNCIAS_PARA_OCULTAR = 3;

/** Dias de silenciamento. */
export const DIAS_SILENCIADA = 30;

/**
 * A moderadora vê o apelido, nunca o nome.
 *
 * O apelido já é irreversível (`apelidoDe`), mas a fila de moderação é o lugar
 * onde a tentação de "só conferir quem é" aparece — a consulta do painel não
 * seleciona `user.name` e esta constante existe para que quem for mexer nela
 * esbarre no motivo.
 */
export const MODERACAO_VE_APELIDO = true;

/**
 * Prioridade na fila.
 *
 * Denúncia de identificação sobe na frente: um relato que expõe o endereço de
 * alguém numa cidade pequena é o único tipo aqui cujo dano piora a cada hora
 * que fica no ar.
 */
export function prioridade(motivo: string | null, denuncias: number): number {
  if (motivo === "identificacao") return 1000 + denuncias;
  if (motivo === "ataque") return 500 + denuncias;
  if (motivo === "desinformacao") return 250 + denuncias;
  return denuncias;
}
