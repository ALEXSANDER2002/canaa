import type { Metadata } from "next";
import Link from "next/link";

import { requireUser } from "@/lib/session";
import { db } from "@/lib/db";
import {
  apelidoDe,
  categoryLabel,
  COMMUNITY_CATEGORIES,
} from "@core/community";
import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";
import { Selo } from "@/components/ui/selo";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RelatoForm, RespostaForm } from "@/components/features/relato-form";
import { denunciarAction, apagarRelatoAction } from "@/server/actions/comunidade";

export const metadata: Metadata = { title: "Relatos" };

export default async function ComunidadePage({
  searchParams,
}: {
  searchParams: Promise<{ assunto?: string }>;
}) {
  const user = await requireUser();
  const { assunto } = await searchParams;

  const filtro = COMMUNITY_CATEGORIES.find((c) => c.value === assunto)?.value;

  const posts = await db.communityPost.findMany({
    where: { hidden: false, ...(filtro ? { category: filtro } : {}) },
    orderBy: { createdAt: "desc" },
    take: 40,
    select: {
      id: true,
      userId: true,
      category: true,
      body: true,
      createdAt: true,
      replies: {
        where: { hidden: false },
        orderBy: { createdAt: "asc" },
        select: { id: true, userId: true, body: true, createdAt: true },
      },
    },
  });

  return (
    <>
      <PageHeader
        title="Relatos"
        description="O que outras mulheres do município estão vivendo — sem nome, sem foto."
      />

      <nav className="mb-6 flex flex-wrap gap-2">
        <Filtro href="/painel/comunidade" rotulo="Tudo" ativo={!filtro} />
        {COMMUNITY_CATEGORIES.map((c) => (
          <Filtro
            key={c.value}
            href={`/painel/comunidade?assunto=${c.value}`}
            rotulo={c.label}
            ativo={filtro === c.value}
          />
        ))}
      </nav>

      <div className="mb-8 space-y-4">
        {posts.length === 0 && (
          <Card>
            <p className="text-sm text-muted">
              Nada publicado {filtro ? "neste assunto" : "ainda"}. Você pode ser
              a primeira.
            </p>
          </Card>
        )}

        {posts.map((p) => {
          const meu = p.userId === user.id;
          return (
            <Card key={p.id}>
              <div className="flex flex-wrap items-center gap-2">
                <Selo userId={p.userId} size={38} />
                <span className="font-display font-semibold text-ink">
                  {apelidoDe(p.userId)}
                </span>
                {meu && <Badge tone="plum">Você</Badge>}
                <Badge tone="neutral">{categoryLabel(p.category)}</Badge>
                <time
                  dateTime={p.createdAt.toISOString()}
                  className="text-xs text-muted"
                >
                  {p.createdAt.toLocaleDateString("pt-BR")}
                </time>
              </div>

              <p className="mt-3 whitespace-pre-wrap text-sm text-ink">{p.body}</p>

              {p.replies.length > 0 && (
                <ul className="mt-4 space-y-3 border-l-2 border-line pl-4">
                  {p.replies.map((r) => (
                    <li key={r.id} className="flex gap-2.5">
                      <Selo userId={r.userId} size={26} />
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-muted">
                          {apelidoDe(r.userId)}
                        </p>
                        <p className="whitespace-pre-wrap text-sm text-ink">
                          {r.body}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              )}

              <RespostaForm postId={p.id} />

              <div className="mt-3 flex gap-2 border-t border-line pt-3">
                {meu ? (
                  <form action={apagarRelatoAction}>
                    <input type="hidden" name="id" value={p.id} />
                    <Button type="submit" size="sm" variant="ghost">
                      Apagar meu relato
                    </Button>
                  </form>
                ) : (
                  <form action={denunciarAction}>
                    <input type="hidden" name="id" value={p.id} />
                    <Button type="submit" size="sm" variant="ghost">
                      Denunciar
                    </Button>
                  </form>
                )}
              </div>
            </Card>
          );
        })}
      </div>

      <RelatoForm userId={user.id} />

      <p className="mt-4 text-xs text-muted">
        Denúncias ocultam o relato automaticamente e vão para revisão humana.{" "}
        <Link href="/painel/direitos" className="text-plum-700 hover:underline">
          Se o assunto for violência, veja também a rede de proteção.
        </Link>
      </p>
    </>
  );
}

function Filtro({
  href,
  rotulo,
  ativo,
}: {
  href: string;
  rotulo: string;
  ativo: boolean;
}) {
  return (
    <Link
      href={href}
      className={
        ativo
          ? "rounded-full bg-plum-700 px-3.5 py-1.5 text-sm font-semibold text-white"
          : "rounded-full border border-line px-3.5 py-1.5 text-sm text-muted hover:border-plum-300 hover:text-ink"
      }
    >
      {rotulo}
    </Link>
  );
}
