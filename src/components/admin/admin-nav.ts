import type { IconName } from "@/components/ui/icon";
import type { Permissao } from "@core/papeis";

export interface AdminSection {
  href: string;
  label: string;
  icon: IconName;
  /** Permissão mínima para o item aparecer. */
  exige: Permissao;
  descricao: string;
}

/**
 * Seções do painel administrativo.
 *
 * A lista é filtrada por permissão antes de chegar na tela: quem não pode
 * moderar não vê "Moderação" apagada — não vê. Item desabilitado só ensina o
 * que existe do outro lado da parede.
 */
export const ADMIN_SECTIONS: AdminSection[] = [
  {
    href: "/admin/servicos",
    label: "Rede de apoio",
    icon: "shield",
    exige: "servicos:escrever",
    descricao:
      "Delegacia, CREAS, casa-abrigo. Cada contato com data de verificação.",
  },
  {
    href: "/admin/unidades",
    label: "Unidades de saúde",
    icon: "home",
    exige: "unidades:escrever",
    descricao: "UBS, hospital e policlínica, com os serviços que cada uma faz.",
  },
  {
    href: "/admin/acoes",
    label: "Campanhas da cidade",
    icon: "calendar",
    exige: "acoes:escrever",
    descricao: "Mutirão, vacinação e ações sociais publicadas no app.",
  },
  {
    href: "/admin/moderacao",
    label: "Moderação",
    icon: "check",
    exige: "moderacao:ler",
    descricao: "Fila de relatos denunciados, aguardando decisão humana.",
  },
  {
    href: "/admin/parcerias",
    label: "Parcerias",
    icon: "spark",
    exige: "parcerias:enviar",
    descricao: "Peças de parceiros — enviadas, aprovadas e no ar.",
  },
  {
    href: "/admin/indicadores",
    label: "Indicadores",
    icon: "book",
    exige: "indicadores:ler",
    descricao: "Números agregados do município, com corte mínimo de 20.",
  },
  {
    href: "/admin/papeis",
    label: "Papéis",
    icon: "settings",
    exige: "papeis:atribuir",
    descricao: "Quem administra o quê, e em nome de qual instituição.",
  },
  {
    href: "/admin/auditoria",
    label: "Auditoria",
    icon: "diary",
    exige: "auditoria:ler",
    descricao: "Toda escrita administrativa, na ordem em que aconteceu.",
  },
];
