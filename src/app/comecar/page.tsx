import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { requireUser } from "@/lib/session";
import { db } from "@/lib/db";
import { ehAdministrativo } from "@core/papeis";
import { Logo } from "@/components/layout/logo";
import { OnboardingForm } from "@/components/features/onboarding-form";

export const metadata: Metadata = { title: "Bem-vinda" };

export default async function ComecarPage() {
  const sessionUser = await requireUser();
  const user = await db.user.findUnique({
    where: { id: sessionUser.id },
    select: { onboardedAt: true, name: true, role: true },
  });

  // Sessão órfã (usuário não existe mais) → logout.
  if (!user) redirect("/api/logout");
  // Conta administrativa não faz este onboarding. Ele pergunta data de
  // nascimento e objetivo — engravidar, evitar, acompanhar — para calibrar o
  // ciclo e a faixa de exames. Nada disso descreve uma Secretaria.
  if (ehAdministrativo(user.role)) redirect("/admin");
  // Já fez o onboarding? Vai direto para o painel.
  if (user.onboardedAt) redirect("/painel");

  const firstName = (user?.name ?? "").split(" ")[0] || "";

  return (
    <div className="min-h-screen">
      <header className="border-b border-line px-6 py-4">
        <Logo />
      </header>
      <main className="mx-auto max-w-lg px-6 py-12">
        <h1 className="text-3xl text-ink">
          Bem-vinda{firstName ? `, ` : ""}
          <span className="italic text-plum-700">{firstName}</span>
        </h1>
        <p className="mt-2 text-muted">
          Conte um pouco sobre você para personalizarmos sua experiência.
        </p>
        <div className="mt-8">
          <OnboardingForm />
        </div>
      </main>
    </div>
  );
}
