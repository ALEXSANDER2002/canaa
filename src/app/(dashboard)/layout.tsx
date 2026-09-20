import { redirect } from "next/navigation";

import { requireUser } from "@/lib/session";
import { db } from "@/lib/db";
import { ehAdministrativo } from "@core/papeis";
import { Sidebar, MobileNav, MobileSectionNav } from "@/components/layout/sidebar";
import { UserMenu } from "@/components/layout/user-menu";
import { Logo } from "@/components/layout/logo";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireUser();

  const record = await db.user.findUnique({
    where: { id: user.id },
    select: { onboardedAt: true, role: true },
  });
  // Sessão aponta para um usuário inexistente (ex.: banco recriado) → logout.
  if (!record) redirect("/api/logout");
  // Conta administrativa vai para /admin — o espelho do que `requireAdmin`
  // faz na direção oposta. Sem isto, a moderadora que digitasse /painel caía
  // no espaço pessoal: "Comece pelo seu ciclo", lembrete de preventivo, humor
  // do dia. Nada ali é o trabalho dela, e conta institucional é usada por mais
  // de uma pessoa — registro íntimo guardado nela vaza para a próxima.
  if (ehAdministrativo(record.role)) redirect("/admin");
  // Gate de onboarding: quem ainda não concluiu vai para /comecar.
  if (!record.onboardedAt) redirect("/comecar");

  return (
    <div className="flex min-h-screen bg-canvas">
      <Sidebar />

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-10 flex items-center justify-between border-b border-line/70 bg-canvas/90 px-5 py-3 backdrop-blur-md sm:px-8">
          <div className="lg:hidden">
            <Logo withText={false} />
          </div>
          <div className="hidden items-center gap-2 text-xs font-semibold text-muted lg:flex">
            <span>Elas IA</span>
            <span className="text-line">/</span>
            <span className="text-ink">Seu espaço</span>
          </div>
          <div className="ml-auto">
            <UserMenu name={user.name ?? "Usuária"} email={user.email ?? ""} />
          </div>
        </header>

        <MobileSectionNav />

        <main className="flex-1 px-5 py-7 pb-28 sm:px-8 lg:py-10 lg:pb-10">
          <div className="mx-auto max-w-5xl">{children}</div>
        </main>
      </div>

      <MobileNav />
    </div>
  );
}
