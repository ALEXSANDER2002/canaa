// Papéis administrativos e o que cada um pode fazer.
//
// Regra que governa o arquivo: permissão é concedida por lista explícita,
// nunca por hierarquia implícita. "Equipe pode tudo" é escrito como uma lista
// com tudo dentro — assim, quando alguém adicionar uma permissão nova, ela
// não cai no colo de todo mundo por herança sem ninguém decidir.

export const PAPEIS = [
  {
    value: "usuaria",
    label: "Usuária",
    descricao: "Quem usa o app. Não enxerga a área administrativa.",
  },
  {
    value: "moderadora",
    label: "Moderadora",
    descricao:
      "Voluntária treinada. Revisa denúncias da comunidade — vê o apelido, nunca o nome.",
  },
  {
    value: "rede_apoio",
    label: "Rede de apoio",
    descricao:
      "CREAS, Centro de Referência da Mulher. Cadastra e reverifica os contatos de violência.",
  },
  {
    value: "prefeitura",
    label: "Prefeitura",
    descricao:
      "Secretaria de Saúde / SEMAS. Publica campanhas e mantém as unidades de atendimento.",
  },
  {
    value: "parceiro",
    label: "Parceiro",
    descricao:
      "Farmácia, laboratório, clínica. Envia a própria peça — não publica sozinho.",
  },
  {
    value: "equipe",
    label: "Equipe Elas IA",
    descricao: "Administração completa, incluindo promover e revogar papéis.",
  },
] as const;

export type Papel = (typeof PAPEIS)[number]["value"];

export function papelLabel(value: string): string {
  return PAPEIS.find((p) => p.value === value)?.label ?? value;
}

/**
 * Permissões. O nome é `recurso:acao` para que a lista continue legível
 * quando dobrar de tamanho.
 */
export const PERMISSOES = [
  "servicos:ler",
  "servicos:escrever",
  "unidades:ler",
  "unidades:escrever",
  "acoes:ler",
  "acoes:escrever",
  "moderacao:ler",
  "moderacao:decidir",
  "parcerias:enviar",
  "parcerias:aprovar",
  "indicadores:ler",
  "papeis:atribuir",
  "auditoria:ler",
] as const;

export type Permissao = (typeof PERMISSOES)[number];

const CONCESSOES: Record<Papel, readonly Permissao[]> = {
  usuaria: [],

  moderadora: ["moderacao:ler", "moderacao:decidir"],

  rede_apoio: ["servicos:ler", "servicos:escrever"],

  prefeitura: [
    "unidades:ler",
    "unidades:escrever",
    "acoes:ler",
    "acoes:escrever",
    "indicadores:ler",
  ],

  parceiro: ["parcerias:enviar"],

  // Escrita explícita, não `PERMISSOES` inteiro: permissão nova precisa ser
  // concedida por alguém, mesmo para a equipe.
  equipe: [
    "servicos:ler",
    "servicos:escrever",
    "unidades:ler",
    "unidades:escrever",
    "acoes:ler",
    "acoes:escrever",
    "moderacao:ler",
    "moderacao:decidir",
    "parcerias:enviar",
    "parcerias:aprovar",
    "indicadores:ler",
    "papeis:atribuir",
    "auditoria:ler",
  ],
};

export function pode(papel: string, permissao: Permissao): boolean {
  const concedidas = CONCESSOES[papel as Papel];
  return concedidas ? concedidas.includes(permissao) : false;
}

export function permissoesDe(papel: string): readonly Permissao[] {
  return CONCESSOES[papel as Papel] ?? [];
}

/** Tem alguma coisa para fazer em /admin? */
export function ehAdministrativo(papel: string): boolean {
  return permissoesDe(papel).length > 0;
}

/**
 * Corte mínimo de qualquer número mostrado fora da equipe.
 *
 * Canaã dos Carajás tem cerca de 77 mil habitantes. "3 mulheres do bairro X
 * abriram a tela de proteção esta semana" não é estatística — é um endereço.
 * Abaixo deste corte, o painel mostra "—".
 */
export const CORTE_AGREGADO = 20;

export function agregado(n: number): number | null {
  return n >= CORTE_AGREGADO ? n : null;
}
