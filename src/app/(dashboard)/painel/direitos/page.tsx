import type { Metadata } from "next";

import { requireUser } from "@/lib/session";
import {
  FORMAS_VIOLENCIA,
  MEDIDA_PROTETIVA,
  PLANO_SEGURANCA,
  CANAIS_NACIONAIS,
  AVISO_PROTECAO,
} from "@core/apoio";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardTitle, CardDescription } from "@/components/ui/card";

export const metadata: Metadata = { title: "Seus direitos" };

export default async function DireitosPage() {
  await requireUser();

  return (
    <>
      <PageHeader
        title="Seus direitos"
        description="O que a lei chama de violência, o que é medida protetiva e como aumentar sua segurança."
      />

      <div className="mb-8 rounded-[var(--radius-card)] border border-line bg-mist p-4 text-sm text-ink">
        {AVISO_PROTECAO}
      </div>

      <section className="mb-10">
        <h2 className="mb-1 font-display text-xl font-bold text-ink">
          As cinco formas de violência
        </h2>
        <p className="mb-4 max-w-[68ch] text-sm text-muted">
          São as do artigo 7º da Lei Maria da Penha. Estão aqui porque é muito
          comum achar que &ldquo;só conta&rdquo; quando tem marca no corpo.
        </p>

        <div className="grid gap-4 sm:grid-cols-2">
          {FORMAS_VIOLENCIA.map((f) => (
            <Card key={f.chave}>
              <CardTitle>{f.nome}</CardTitle>
              <CardDescription>{f.texto}</CardDescription>
              <ul className="mt-3 space-y-1.5 text-sm text-ink">
                {f.exemplos.map((e) => (
                  <li key={e} className="flex gap-2">
                    <span aria-hidden className="text-muted">
                      —
                    </span>
                    {e}
                  </li>
                ))}
              </ul>
            </Card>
          ))}
        </div>
      </section>

      <section className="mb-10">
        <Card>
          <CardTitle>{MEDIDA_PROTETIVA.titulo}</CardTitle>
          <CardDescription>{MEDIDA_PROTETIVA.resumo}</CardDescription>
          <ol className="mt-4 space-y-3">
            {MEDIDA_PROTETIVA.passos.map((p, i) => (
              <li key={p} className="flex gap-3 text-sm text-ink">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-plum-100 text-xs font-bold text-plum-800">
                  {i + 1}
                </span>
                {p}
              </li>
            ))}
          </ol>
        </Card>
      </section>

      <section className="mb-10">
        <h2 className="mb-1 font-display text-xl font-bold text-ink">
          Plano de segurança
        </h2>
        <p className="mb-4 max-w-[68ch] text-sm text-muted">
          Nada aqui diz para você sair de casa. Essa decisão é sua, e o momento
          da saída é o de maior risco — o que está abaixo aumenta sua segurança
          independente do que você decidir.
        </p>
        <Card>
          <ul className="space-y-3 text-sm text-ink">
            {PLANO_SEGURANCA.map((p) => (
              <li key={p} className="flex gap-2.5">
                <span aria-hidden className="text-plum-700">
                  —
                </span>
                {p}
              </li>
            ))}
          </ul>
        </Card>
      </section>

      <section>
        <h2 className="mb-4 font-display text-xl font-bold text-ink">
          Quem atende
        </h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {CANAIS_NACIONAIS.map((c) => (
            <Card
              key={c.numero}
              className={c.urgente ? "border-plum-300 bg-plum-50" : undefined}
            >
              <div className="flex items-baseline gap-3">
                <a
                  href={`tel:${c.numero}`}
                  className="font-display text-3xl font-bold tabular-nums text-plum-700 hover:underline"
                >
                  {c.numero}
                </a>
                <span className="font-semibold text-ink">{c.nome}</span>
              </div>
              <p className="mt-2 text-sm text-muted">{c.descricao}</p>
            </Card>
          ))}
        </div>
      </section>
    </>
  );
}
