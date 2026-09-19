import type { IconName } from "@/components/ui/icon";
import { PILARES, type PilarValue } from "@core/pilares";

export type NavItem = { href: string; label: string; icon: IconName };
export type NavGroup = { title: string; items: NavItem[] };

/**
 * A navegação é por PILAR, não uma lista única.
 *
 * Antes daqui havia 20 itens em quatro grupos, todos visíveis ao mesmo tempo —
 * a barra lateral virou um índice do banco de dados. Agora a barra mostra só o
 * pilar em que a pessoa está; os 20 itens continuam existindo e param de
 * aparecer de uma vez.
 *
 * As rotas continuam onde sempre estiveram. Reagrupar é uma mudança de
 * navegação, não de endereço: link salvo, histórico e favorito seguem valendo.
 */
export const NAV_POR_PILAR: Record<PilarValue, NavItem[]> = {
  protecao: [
    { href: "/painel/apoio", label: "Rede de apoio", icon: "shield" },
    { href: "/painel/confianca", label: "Rede de confiança", icon: "home" },
    { href: "/painel/direitos", label: "Seus direitos", icon: "book" },
  ],

  saude: [
    { href: "/painel/ciclo", label: "Ciclo", icon: "cycle" },
    { href: "/painel/diario", label: "Diário", icon: "diary" },
    { href: "/painel/bem-estar", label: "Bem-estar", icon: "wellbeing" },
    { href: "/painel/lembretes", label: "Lembretes", icon: "reminder" },
    { href: "/painel/exames", label: "Exames por idade", icon: "check" },
    { href: "/painel/unidades", label: "Onde ser atendida", icon: "home" },
    { href: "/painel/gestacao", label: "Gestação", icon: "pregnancy" },
    { href: "/painel/pilula", label: "Anticoncepcional", icon: "calendar" },
    { href: "/painel/autoexame", label: "Autoexame", icon: "wellbeing" },
    { href: "/painel/medidas", label: "Medidas", icon: "guide" },
    { href: "/painel/acompanhante", label: "Quem me acompanha", icon: "home" },
    { href: "/painel/relatorio", label: "Relatório", icon: "book" },
    { href: "/painel/metas", label: "Metas & conquistas", icon: "spark" },
  ],

  comunidade: [
    { href: "/painel/comunidade", label: "Relatos", icon: "diary" },
    { href: "/painel/cidade", label: "Na cidade", icon: "calendar" },
    { href: "/painel/servicos", label: "Serviços públicos", icon: "shield" },
    { href: "/painel/biblioteca", label: "Biblioteca", icon: "book" },
  ],

  ia: [
    { href: "/painel/assistente", label: "Conversar", icon: "guide" },
    { href: "/painel/assistente/memoria", label: "O que ela sabe", icon: "book" },
  ],
};

/** Itens que não pertencem a pilar nenhum — ficam no rodapé da barra. */
export const NAV_CONTA: NavItem[] = [
  { href: "/painel/configuracoes", label: "Configurações", icon: "settings" },
];

/**
 * Em que pilar está esta rota.
 *
 * Casamento pelo prefixo mais longo: `/painel/assistente/memoria` precisa
 * ganhar de `/painel/assistente`, e `/painel` sozinho não é pilar nenhum — é o
 * hub.
 */
export function pilarDaRota(pathname: string): PilarValue | null {
  let melhor: { pilar: PilarValue; tamanho: number } | null = null;

  for (const p of PILARES) {
    for (const item of NAV_POR_PILAR[p.value]) {
      if (
        (pathname === item.href || pathname.startsWith(item.href + "/")) &&
        (!melhor || item.href.length > melhor.tamanho)
      ) {
        melhor = { pilar: p.value, tamanho: item.href.length };
      }
    }
  }

  return melhor?.pilar ?? null;
}

/** Navegação inferior (telas pequenas): os quatro pilares e o início. */
export const MOBILE_NAV: NavItem[] = [
  { href: "/painel", label: "Início", icon: "home" },
  { href: "/painel/ciclo", label: "Saúde", icon: "cycle" },
  { href: "/painel/comunidade", label: "Comunidade", icon: "diary" },
  { href: "/painel/assistente", label: "Assistente", icon: "guide" },
  { href: "/painel/apoio", label: "Proteção", icon: "shield" },
];
