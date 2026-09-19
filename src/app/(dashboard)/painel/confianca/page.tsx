import type { Metadata } from "next";

import { requireUser } from "@/lib/session";
import { db } from "@/lib/db";
import {
  LIMITE_CONTATOS_CONFIANCA,
  AVISO_REDE_CONFIANCA,
  STATUS_CONTATO_LABEL,
  mensagemAlerta,
  type StatusContato,
} from "@core/protecao";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ContatoForm } from "@/components/features/contato-form";
import {
  removerContatoAction,
  confirmarContatoAction,
} from "@/server/actions/protecao";

export const metadata: Metadata = { title: "Rede de confiança" };

export default async function ConfiancaPage() {
  const user = await requireUser();

  const contatos = await db.trustedContact.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "asc" },
  });

  const aceitos = contatos.filter((c) => c.status === "aceito").length;

  return (
    <>
      <PageHeader
        title="Rede de confiança"
        description={`Até ${LIMITE_CONTATOS_CONFIANCA} pessoas que recebem uma mensagem quando você apertar o botão de ajuda no app.`}
      />

      <Card className="mb-6">
        <CardTitle>Como escolher</CardTitle>
        <CardDescription>{AVISO_REDE_CONFIANCA}</CardDescription>
        <div className="mt-4 rounded-xl border border-line bg-mist p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-muted">
            É esta mensagem que elas recebem
          </p>
          <p className="mt-2 text-sm text-ink">
            {mensagemAlerta(
              (user.name ?? "Ela").split(" ")[0],
              "Rua Exemplo, 100 — Canaã dos Carajás",
            )}
          </p>
        </div>
      </Card>

      <div className="mb-6 space-y-3">
        {contatos.length === 0 && (
          <Card>
            <p className="text-sm text-muted">
              Ninguém cadastrado ainda. Sem contatos, o botão de ajuda do app
              continua funcionando — ele liga para o 190 direto, que é a parte
              que não depende de ninguém.
            </p>
          </Card>
        )}

        {contatos.map((c) => (
          <Card key={c.id}>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-display font-semibold text-ink">
                    {c.name}
                  </span>
                  {c.relation && <Badge tone="neutral">{c.relation}</Badge>}
                  <Badge tone={c.status === "aceito" ? "sage" : "warning"}>
                    {STATUS_CONTATO_LABEL[c.status as StatusContato] ?? c.status}
                  </Badge>
                </div>
                <p className="mt-1 text-sm text-muted">{c.phone}</p>
              </div>

              <div className="flex shrink-0 gap-2">
                {c.status !== "aceito" && (
                  <form action={confirmarContatoAction}>
                    <input type="hidden" name="id" value={c.id} />
                    <Button type="submit" size="sm" variant="outline">
                      Ela aceitou
                    </Button>
                  </form>
                )}
                <form action={removerContatoAction}>
                  <input type="hidden" name="id" value={c.id} />
                  <Button type="submit" size="sm" variant="ghost">
                    Remover
                  </Button>
                </form>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {contatos.some((c) => c.status !== "aceito") && (
        <div className="mb-6 rounded-[var(--radius-card)] border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          Fale com quem ainda está pendente antes de contar com ela. Enquanto
          você não marcar &ldquo;ela aceitou&rdquo;, essa pessoa não entra no
          alerta — cadastrar o número de alguém que não sabe é montar uma rede
          que não existe.
        </div>
      )}

      <ContatoForm cheio={contatos.length >= LIMITE_CONTATOS_CONFIANCA} />

      {aceitos > 0 && (
        <p className="mt-4 text-sm text-muted">
          {aceitos} pessoa{aceitos > 1 ? "s" : ""} pronta{aceitos > 1 ? "s" : ""}{" "}
          para receber o alerta.
        </p>
      )}
    </>
  );
}
