import Link from "next/link";

import { requireAdmin } from "@/lib/roles";
import { permissoesDe, papelLabel } from "@core/papeis";
import { ADMIN_SECTIONS } from "@/components/admin/admin-nav";
import { AdminNav } from "@/components/admin/admin-shell";
import { Logo } from "@/components/layout/logo";

export const metadata = { title: { default: "Administração", template: "%s · Administração" } };

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const operadora = await requireAdmin();
  const permissoes = permissoesDe(operadora.role);
  const secoes = ADMIN_SECTIONS.filter((s) => permissoes.includes(s.exige));

  return (
    <div className="flex min-h-screen bg-mist">
      <aside className="hidden w-64 shrink-0 flex-col border-r border-line bg-surface p-5 lg:flex">
        <Link href="/admin" className="mb-1 px-2">
          <Logo />
        </Link>
        <p className="mb-7 px-2 text-xs font-semibold uppercase tracking-wider text-plum-700">
          Administração
        </p>

        <AdminNav secoes={secoes} />

        <div className="mt-auto rounded-xl border border-line bg-mist p-3">
          <p className="text-sm font-semibold text-ink">{operadora.name}</p>
          <p className="text-xs text-muted">{papelLabel(operadora.role)}</p>
          {operadora.organizationName &&
            operadora.organizationName !== papelLabel(operadora.role) && (
              <p className="text-xs text-muted">{operadora.organizationName}</p>
            )}
          {/* Aqui havia "Ir para o meu painel". Conta administrativa não tem
              painel pessoal — /painel devolve para cá —, e o link virou um
              botão que pisca e não sai do lugar. Sair é o que resta de útil. */}
          <a
            href="/api/logout"
            className="mt-2 inline-block text-xs font-semibold text-plum-700 hover:underline"
          >
            Sair
          </a>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between gap-4 border-b border-line bg-surface px-6 py-3 lg:hidden">
          <Logo withText={false} />
          <span className="text-xs font-semibold uppercase tracking-wider text-plum-700">
            Administração
          </span>
        </header>

        <main className="flex-1 px-6 py-8">
          <div className="mx-auto max-w-5xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
