"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { Logo } from "./logo";
import {
  NAV_POR_PILAR,
  NAV_CONTA,
  MOBILE_NAV,
  pilarDaRota,
  type NavItem,
} from "./nav-items";
import { pilar } from "@core/pilares";
import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/utils";

function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(href + "/");
}

function SidebarLink({
  item,
  active,
  cor,
}: {
  item: NavItem;
  active: boolean;
  cor: string;
}) {
  return (
    <Link
      href={item.href}
      aria-current={active ? "page" : undefined}
      className={cn(
        // O item ativo se distingue por peso, contraste e um trilho lateral —
        // não por um banho de cor. Mantém o acento escasso.
        "relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors",
        active
          ? "bg-mist font-semibold text-ink"
          : "text-muted hover:bg-mist/70 hover:text-ink",
      )}
    >
      {active && (
        <span
          aria-hidden
          className="absolute inset-y-1.5 left-0 w-[3px] rounded-full"
          style={{ background: cor }}
        />
      )}
      <Icon
        name={item.icon}
        className="h-5 w-5"
        style={active ? { color: cor } : undefined}
      />
      {item.label}
    </Link>
  );
}

export function Sidebar() {
  const pathname = usePathname();
  const atual = pilarDaRota(pathname);

  // Fora de um pilar (o hub, ou uma tela de conta) a barra não inventa um:
  // mostra só o caminho de volta e os itens de conta.
  const dados = atual ? pilar(atual) : null;
  const itens = atual ? NAV_POR_PILAR[atual] : [];
  const cor = dados?.corTexto ?? "var(--color-plum-700)";

  return (
    <aside className="hidden w-64 shrink-0 flex-col border-r border-line/70 bg-white p-5 lg:flex">
      <Link href="/painel" className="mb-6 px-2">
        <Logo />
      </Link>

      {dados ? (
        <>
          <Link
            href="/painel"
            className="mb-4 flex items-center gap-2 px-1 text-xs font-semibold text-muted hover:text-ink"
          >
            <Icon name="arrow" className="h-4 w-4 rotate-180" />
            Início
          </Link>

          <div
            className="mb-4 rounded-xl px-3 py-2.5"
            style={{ background: dados.corSuave }}
          >
            <p
              className="font-display text-sm font-bold"
              style={{ color: dados.corTexto }}
            >
              {dados.label}
            </p>
            <p className="mt-0.5 text-xs leading-snug text-muted">
              {dados.resumo}
            </p>
          </div>
        </>
      ) : (
        <>
          <Link
            href="/painel"
            aria-current={pathname === "/painel" ? "page" : undefined}
            className="mb-6 flex items-center gap-3 rounded-xl bg-plum-50 px-3 py-3 text-sm font-bold text-plum-700"
          >
            <Icon name="home" className="h-5 w-5" />
            Meu painel
          </Link>
          <p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[0.16em] text-muted">
            Explorar
          </p>
          <nav aria-label="Áreas principais" className="mb-5 flex flex-col gap-1">
            {MOBILE_NAV.filter((item) => item.href !== "/painel").map((item) => (
              <SidebarLink key={item.href} item={item} active={false} cor="var(--color-plum-700)" />
            ))}
          </nav>
        </>
      )}

      <nav className="flex flex-col gap-0.5 overflow-y-auto">
        {itens.map((item) => (
          <SidebarLink
            key={item.href}
            item={item}
            active={isActive(pathname, item.href)}
            cor={cor}
          />
        ))}
      </nav>

      <div className="mt-auto flex flex-col gap-0.5 border-t border-line pt-3">
        {NAV_CONTA.map((item) => (
          <SidebarLink
            key={item.href}
            item={item}
            active={isActive(pathname, item.href)}
            cor="var(--color-plum-700)"
          />
        ))}
      </div>
    </aside>
  );
}

/** Navegação inferior para telas pequenas — um item por pilar. */
export function MobileNav() {
  const pathname = usePathname();
  const atual = pilarDaRota(pathname);

  return (
    <nav className="fixed inset-x-0 bottom-0 z-20 flex justify-around border-t border-line bg-white/95 px-1 pb-[max(0.6rem,env(safe-area-inset-bottom))] pt-2 shadow-[0_-12px_32px_-25px_rgba(38,35,34,0.4)] backdrop-blur lg:hidden">
      {MOBILE_NAV.map((item) => {
        const doPilar = item.href === "/painel" ? !atual : pilarDaRota(item.href) === atual;
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={doPilar ? "page" : undefined}
            className={cn(
              "flex min-w-0 flex-1 flex-col items-center gap-1 rounded-xl px-1 py-1 text-[10px] sm:text-xs",
              doPilar ? "bg-plum-50 font-semibold text-plum-700" : "text-muted",
            )}
          >
            <Icon name={item.icon} className="h-5 w-5" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

/**
 * No desktop os recursos do pilar ficam na lateral. Sem esta faixa, no
 * celular a pessoa chegava ao pilar pela barra inferior, mas não conseguia
 * alcançar as demais telas que vivem dentro dele.
 */
export function MobileSectionNav() {
  const pathname = usePathname();
  const atual = pilarDaRota(pathname);

  if (!atual) return null;

  const dados = pilar(atual);
  const itens = NAV_POR_PILAR[atual];

  return (
    <nav
      aria-label={`Recursos de ${dados.label}`}
      className="border-b border-line bg-surface lg:hidden"
    >
      <div className="no-scrollbar flex gap-2 overflow-x-auto px-4 py-2.5">
        {itens.map((item) => {
          const active = isActive(pathname, item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors",
                active
                  ? "border-transparent text-white"
                  : "border-line bg-paper text-muted hover:border-plum-200 hover:text-ink",
              )}
              style={active ? { background: dados.cor } : undefined}
            >
              <Icon name={item.icon} className="h-3.5 w-3.5" />
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
