import type { Metadata } from "next";
import { requireUser } from "@/lib/session";
import { ComingSoon } from "@/components/ui/coming-soon";

export const metadata: Metadata = { title: "Parceiros" };

export default async function ParceirosPage() {
  await requireUser();
  return (
    <ComingSoon
      icon="home"
      title="Rede de parceiros"
      description="Clínicas, laboratórios e farmácias parceiras, com serviços e condições especiais para você."
      bullets={[
        "Agendamento de exames e consultas",
        "Descontos e campanhas de parceiros locais",
        "Marketplace de serviços voltados à saúde da mulher",
      ]}
    />
  );
}
