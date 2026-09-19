"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/utils";
import type { AdminSection } from "./admin-nav";

export function AdminNav({ secoes }: { secoes: AdminSection[] }) {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-0.5">
      <ItemNav
        href="/admin"
        label="Início"
        icon="home"
        ativo={pathname === "/admin"}
      />
      {secoes.map((s) => (
        <ItemNav
          key={s.href}
          href={s.href}
          label={s.label}
          icon={s.icon}
          ativo={pathname.startsWith(s.href)}
        />
      ))}
    </nav>
  );
}

function ItemNav({
  href,
  label,
  icon,
  ativo,
}: {
  href: string;
  label: string;
  icon: AdminSection["icon"];
  ativo: boolean;
}) {
  return (
    <Link
      href={href}
      aria-current={ativo ? "page" : undefined}
      className={cn(
        "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors",
        ativo
          ? "bg-mist font-semibold text-ink"
          : "text-muted hover:bg-mist/70 hover:text-ink",
      )}
    >
      <Icon
        name={icon}
        className={cn("h-5 w-5", ativo ? "text-plum-700" : "text-muted")}
      />
      {label}
    </Link>
  );
}
