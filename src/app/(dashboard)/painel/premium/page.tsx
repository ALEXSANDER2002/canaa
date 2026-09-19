import type { Metadata } from "next";
import { requireUser } from "@/lib/session";
import { ComingSoon } from "@/components/ui/coming-soon";

export const metadata: Metadata = { title: "Premium" };

export default async function PremiumPage() {
  await requireUser();
  return (
    <ComingSoon
      icon="spark"
      title="Canaã Delas Premium"
      description="Recursos avançados para quem quer acompanhar a saúde com ainda mais profundidade."
      bullets={[
        "Relatórios personalizados para levar ao médico",
        "Insights avançados de ciclo e bem-estar",
        "Conteúdo exclusivo da biblioteca de saúde",
      ]}
    />
  );
}
