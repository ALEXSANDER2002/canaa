"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

/** Item da lista de conversas, destacando a conversa aberta. */
export function ConversationLink({
  id,
  title,
  subtitle,
}: {
  id: string;
  title: string;
  subtitle: string;
}) {
  const pathname = usePathname();
  const active = pathname === `/painel/assistente/${id}`;

  return (
    <Link
      href={`/painel/assistente/${id}`}
      className={cn(
        "block rounded-xl border px-3 py-2.5 transition-colors",
        active
          ? "border-plum-300 bg-plum-50"
          : "border-transparent hover:border-line hover:bg-mist",
      )}
    >
      <span
        className={cn(
          "block truncate text-sm",
          active ? "font-semibold text-plum-700" : "text-ink",
        )}
      >
        {title}
      </span>
      <span className="mt-0.5 block text-xs text-muted">{subtitle}</span>
    </Link>
  );
}
