import { requirePermissao } from "@/lib/roles";
import { db } from "@/lib/db";
import { PAPEIS, papelLabel, permissoesDe } from "@core/papeis";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PapelForm } from "@/components/admin/papel-form";

export const metadata = { title: "Papéis" };

export default async function AdminPapeis() {
  await requirePermissao("papeis:atribuir");

  const [administradoras, organizacoes] = await Promise.all([
    db.user.findMany({
      where: { role: { not: "usuaria" } },
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        organizationId: true,
        organization: { select: { name: true } },
      },
    }),
    db.organization.findMany({
      where: { active: true },
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
  ]);

  return (
    <>
      <PageHeader
        title="Papéis"
        description="Quem administra o quê, e em nome de qual instituição."
      />

      <Card className="mb-8">
        <CardTitle>O que cada papel pode</CardTitle>
        <CardDescription>
          Permissão é concedida por lista explícita, nunca por hierarquia. Uma
          permissão nova não cai no colo de ninguém sem alguém decidir.
        </CardDescription>
        <ul className="mt-4 divide-y divide-line text-sm">
          {PAPEIS.filter((p) => p.value !== "usuaria").map((p) => (
            <li key={p.value} className="py-3 first:pt-0 last:pb-0">
              <p className="font-semibold text-ink">{p.label}</p>
              <p className="text-muted">{p.descricao}</p>
              <div className="mt-1.5 flex flex-wrap gap-1.5">
                {permissoesDe(p.value).map((perm) => (
                  <span
                    key={perm}
                    className="rounded-full bg-mist px-2 py-0.5 font-mono text-[11px] text-muted"
                  >
                    {perm}
                  </span>
                ))}
              </div>
            </li>
          ))}
        </ul>
      </Card>

      <h2 className="mb-3 font-display text-lg font-semibold text-ink">
        Quem tem acesso hoje
      </h2>

      <div className="space-y-3">
        {administradoras.length === 0 && (
          <Card>
            <p className="text-sm text-muted">
              Ninguém além de você. Promova uma conta pelo Prisma Studio ou pelo
              seed, e ela aparecerá aqui.
            </p>
          </Card>
        )}

        {administradoras.map((a) => (
          <Card key={a.id}>
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <span className="font-display font-semibold text-ink">{a.name}</span>
              <Badge tone="plum">{papelLabel(a.role)}</Badge>
              {a.organization && (
                <Badge tone="neutral">{a.organization.name}</Badge>
              )}
              <span className="text-xs text-muted">{a.email}</span>
            </div>
            <PapelForm
              userId={a.id}
              papelAtual={a.role}
              organizationId={a.organizationId}
              organizacoes={organizacoes}
            />
          </Card>
        ))}
      </div>
    </>
  );
}
