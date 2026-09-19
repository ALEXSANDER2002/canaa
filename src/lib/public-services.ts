// Serviços públicos de saúde da mulher (conteúdo orientativo).
// Descreve serviços disponíveis no SUS e campanhas — sem endereços específicos,
// que serão integrados a partir de dados oficiais da Secretaria de Saúde.

import type { IconName } from "@/components/ui/icon";

export interface PublicService {
  icon: IconName;
  title: string;
  description: string;
  where: string;
}

export const PUBLIC_SERVICES: PublicService[] = [
  {
    icon: "cycle",
    title: "Exame preventivo (Papanicolau)",
    description:
      "Detecta precocemente alterações no colo do útero. Gratuito pelo SUS.",
    where: "UBS / Unidade Básica de Saúde mais próxima",
  },
  {
    icon: "pregnancy",
    title: "Pré-natal",
    description:
      "Acompanhamento completo da gestação, com consultas e exames.",
    where: "UBS e maternidades da rede pública",
  },
  {
    icon: "wellbeing",
    title: "Planejamento familiar",
    description:
      "Orientação sobre métodos contraceptivos e saúde reprodutiva.",
    where: "UBS / equipes de Saúde da Família",
  },
  {
    icon: "shield",
    title: "Vacinação (incluindo HPV)",
    description:
      "Vacinas que protegem a saúde da mulher em diferentes idades.",
    where: "Salas de vacina das UBS",
  },
  {
    icon: "guide",
    title: "Saúde mental",
    description:
      "Apoio psicológico e acolhimento pela rede pública (CAPS).",
    where: "CAPS e UBS de referência",
  },
];

export interface Campaign {
  month: string;
  title: string;
  description: string;
}

export const CAMPAIGNS: Campaign[] = [
  {
    month: "Outubro",
    title: "Outubro Rosa",
    description:
      "Conscientização e prevenção do câncer de mama. Fique atenta às ações no município.",
  },
  {
    month: "Ano todo",
    title: "Preventivo em dia",
    description:
      "Mutirões periódicos de exame preventivo nas unidades de saúde.",
  },
  {
    month: "Ano todo",
    title: "Pré-natal para todas",
    description:
      "Incentivo ao início precoce do pré-natal para gestantes.",
  },
];
