import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const db = new PrismaClient();

// Datas relativas a uma referência fixa para o seed ser determinístico.
const today = new Date();
function daysAgo(n: number): Date {
  const d = new Date(today);
  d.setDate(d.getDate() - n);
  d.setHours(9, 0, 0, 0);
  return d;
}
function daysAhead(n: number): Date {
  return daysAgo(-n);
}

async function main() {
  const email = "maria@example.com";
  const passwordHash = await bcrypt.hash("senha1234", 10);

  // Recria a usuária de demonstração do zero.
  await db.user.deleteMany({ where: { email } });

  const user = await db.user.create({
    data: {
      name: "Maria Silva",
      email,
      passwordHash,
      birthDate: new Date("1995-03-12"),
      goal: "acompanhar",
      onboardedAt: new Date(),
    },
  });

  // Check-ins diários recentes.
  await db.dailyLog.createMany({
    data: [
      { userId: user.id, date: daysAgo(2), energy: 3, sleepHours: 7, pain: 2, symptoms: "Cansaço" },
      { userId: user.id, date: daysAgo(1), energy: 4, sleepHours: 8, pain: 1 },
      { userId: user.id, date: daysAgo(0), energy: 2, sleepHours: 6, pain: 3, symptoms: "Cólica,Dor de cabeça", note: "Dia puxado." },
    ],
  });

  // Histórico de ciclos (aprox. a cada 28 dias).
  await db.cycleEntry.createMany({
    data: [
      {
        userId: user.id,
        startDate: daysAgo(84),
        endDate: daysAgo(79),
        flow: "medio",
        symptoms: "Cólica,Cansaço",
      },
      {
        userId: user.id,
        startDate: daysAgo(56),
        endDate: daysAgo(51),
        flow: "intenso",
        symptoms: "Cólica,Dor de cabeça",
      },
      {
        userId: user.id,
        startDate: daysAgo(28),
        endDate: daysAgo(23),
        flow: "leve",
        symptoms: "Inchaço",
      },
    ],
  });

  // Registros de humor recentes.
  await db.moodEntry.createMany({
    data: [
      { userId: user.id, date: daysAgo(3), mood: "bem", intensity: 4 },
      { userId: user.id, date: daysAgo(2), mood: "ansiosa", intensity: 3 },
      { userId: user.id, date: daysAgo(1), mood: "otimo", intensity: 5 },
      { userId: user.id, date: daysAgo(0), mood: "cansada", intensity: 2 },
    ],
  });

  // Lembretes de exames/consultas.
  await db.reminder.createMany({
    data: [
      {
        userId: user.id,
        title: "Papanicolau (preventivo)",
        type: "exame",
        dueDate: daysAhead(10),
        notes: "Levar cartão do SUS.",
      },
      {
        userId: user.id,
        title: "Consulta com ginecologista",
        type: "consulta",
        dueDate: daysAhead(25),
      },
      {
        userId: user.id,
        title: "Mamografia",
        type: "exame",
        dueDate: daysAgo(5),
        done: true,
      },
    ],
  });

  // Anticoncepcional — últimos 6 dias tomados.
  await db.pillLog.createMany({
    data: [0, 1, 2, 3, 4, 5].map((n) => {
      const d = daysAgo(n);
      d.setHours(0, 0, 0, 0);
      return { userId: user.id, date: d, taken: true };
    }),
  });

  // Medidas de saúde.
  await db.healthMetric.createMany({
    data: [
      { userId: user.id, type: "peso", value: 62.5, date: daysAgo(20) },
      { userId: user.id, type: "peso", value: 62.1, date: daysAgo(6) },
      { userId: user.id, type: "pressao", value: 118, value2: 76, date: daysAgo(6) },
    ],
  });

  // Autoexame das mamas.
  await db.selfExamLog.create({
    data: { userId: user.id, date: daysAgo(15) },
  });

  // ══════════════ ações da Prefeitura ══════════════
  //
  // ATENÇÃO: os itens abaixo são EXEMPLOS de formato, não ações reais de Canaã
  // dos Carajás. Servem para a tela ter conteúdo em desenvolvimento e na
  // demonstração. Antes de mostrar o app para a Prefeitura ou para banca,
  // troque por ações verdadeiras — ou apague, que a tela tem estado vazio.
  await db.cityAction.deleteMany();
  await db.cityAction.createMany({
    data: [
      {
        title: "Mutirão do preventivo",
        summary:
          "Coleta de preventivo sem agendamento, por ordem de chegada. Leve cartão SUS e documento com foto.",
        category: "mulher",
        location: "EXEMPLO — substituir pela UBS real",
        startsAt: daysAhead(3),
        endsAt: daysAhead(5),
        contact: "Secretaria de Saúde",
        pinned: true,
      },
      {
        title: "Vacinação contra HPV",
        summary:
          "Meninas e meninos de 9 a 14 anos. Dose única, gratuita, em qualquer unidade de saúde.",
        category: "vacinacao",
        location: "EXEMPLO — substituir pelas unidades reais",
        startsAt: null,
        endsAt: null,
        contact: null,
      },
      {
        title: "Atendimento do CRAS",
        summary:
          "Cadastro Único, Bolsa Família, BPC e orientação sobre benefícios. Atendimento contínuo.",
        category: "assistencia",
        location: "EXEMPLO — substituir pelo endereço real do CRAS",
        startsAt: null,
        endsAt: null,
        contact: null,
      },
      {
        title: "Roda de conversa sobre saúde da mulher",
        summary:
          "Encontro aberto para tirar dúvidas sobre ciclo, contracepção e exames de rotina.",
        category: "mulher",
        location: "EXEMPLO — substituir pelo local real",
        startsAt: daysAhead(12),
        endsAt: daysAhead(12),
        contact: null,
      },
    ],
  });

  // ══════════════ rede de apoio ══════════════
  //
  // Deliberadamente VAZIA.
  //
  // Telefone ou endereço errado numa tela de violência manda alguém em risco
  // para o lugar errado — é a única parte do app onde dado inventado causa dano
  // direto. A tela já trata o vazio: mostra os canais nacionais (180, 190) e
  // explica que a central conhece a rede de cada município.
  //
  // Para preencher, use contatos que a equipe LIGOU e confirmou:
  //
  //   await db.supportService.create({
  //     data: {
  //       name: "Delegacia de Canaã dos Carajás",
  //       kind: "violencia",
  //       address: "...",
  //       phone: "...",
  //       hours: "24 horas",
  //       ordem: 1,
  //     },
  //   });
  await db.supportService.deleteMany();

  // ══════════════ instituições e papéis ══════════════
  //
  // Contas de demonstração da área administrativa. Todas usam a mesma senha do
  // login de demonstração — o que é aceitável num banco de desenvolvimento e
  // inaceitável em qualquer outro lugar. Antes de qualquer piloto, troque as
  // senhas e ative 2FA.
  await db.organization.deleteMany();

  const prefeitura = await db.organization.create({
    data: {
      name: "Secretaria Municipal de Saúde",
      kind: "prefeitura",
      contact: "EXEMPLO — substituir pelo contato real",
    },
  });

  const creas = await db.organization.create({
    data: {
      name: "CREAS — Centro de Referência Especializado",
      kind: "rede_apoio",
      contact: "EXEMPLO — substituir pelo contato real",
    },
  });

  const equipeOrg = await db.organization.create({
    data: { name: "Equipe Elas IA", kind: "parceiro" },
  });

  // O parceiro de demonstração tem organização própria de propósito. Se ele
  // dividisse a organização com a equipe, o painel dele mostraria as peças
  // certas por coincidência, e o recorte por `organizationId` — que é o que
  // impede um laboratório de ver a campanha de outro — nunca seria exercido.
  const laboratorioOrg = await db.organization.create({
    data: { name: "Laboratório Exemplo", kind: "parceiro" },
  });

  const contas: {
    name: string;
    email: string;
    role: string;
    organizationId: string | null;
  }[] = [
    {
      name: "Equipe Elas IA",
      email: "equipe@example.com",
      role: "equipe",
      organizationId: equipeOrg.id,
    },
    {
      name: "Secretaria de Saúde",
      email: "prefeitura@example.com",
      role: "prefeitura",
      organizationId: prefeitura.id,
    },
    {
      name: "Rede de apoio (CREAS)",
      email: "apoio@example.com",
      role: "rede_apoio",
      organizationId: creas.id,
    },
    {
      name: "Moderadora voluntária",
      email: "moderacao@example.com",
      role: "moderadora",
      organizationId: null,
    },
    {
      name: "Laboratório Exemplo",
      email: "parceiro@example.com",
      role: "parceiro",
      organizationId: laboratorioOrg.id,
    },
  ];

  for (const conta of contas) {
    await db.user.deleteMany({ where: { email: conta.email } });
    await db.user.create({
      data: {
        name: conta.name,
        email: conta.email,
        passwordHash,
        role: conta.role,
        organizationId: conta.organizationId,
        onboardedAt: new Date(),
      },
    });
  }

  // ══════════════ unidades de atendimento ══════════════
  //
  // EXEMPLOS de formato, como as ações da Prefeitura. Diferente da rede de
  // apoio, endereço errado aqui atrapalha mas não coloca ninguém em risco —
  // por isso a tabela não nasce vazia. Ainda assim: troque antes de mostrar.
  await db.healthUnit.deleteMany();
  await db.healthUnit.createMany({
    data: [
      {
        nome: "UBS Central (EXEMPLO)",
        tipo: "ubs",
        endereco: "EXEMPLO — substituir pelo endereço real",
        bairro: "Centro",
        latitude: -6.4988,
        longitude: -49.8797,
        horario: "seg a sex, 7h às 17h",
        servicos: "preventivo,prenatal,planejamento,vacinacao,ginecologia,teste_rapido",
        observacao: "Preventivo por ordem de chegada, das 7h às 11h.",
      },
      {
        nome: "Hospital Municipal (EXEMPLO)",
        tipo: "hospital",
        endereco: "EXEMPLO — substituir pelo endereço real",
        bairro: "Centro",
        latitude: -6.502,
        longitude: -49.873,
        horario: "24 horas",
        servicos: "emergencia,prenatal,ginecologia",
      },
      {
        nome: "Policlínica (EXEMPLO)",
        tipo: "policlinica",
        endereco: "EXEMPLO — substituir pelo endereço real",
        bairro: "Novo Horizonte",
        latitude: -6.493,
        longitude: -49.887,
        horario: "seg a sex, 8h às 18h",
        servicos: "mamografia,ginecologia,preventivo",
        observacao: "Mamografia com encaminhamento da UBS.",
      },
      {
        nome: "CAPS (EXEMPLO)",
        tipo: "caps",
        bairro: "Centro",
        latitude: -6.506,
        longitude: -49.884,
        endereco: "EXEMPLO — substituir pelo endereço real",
        horario: "seg a sex, 8h às 17h",
        servicos: "psicologia",
      },
    ],
  });

  // ══════════════ parceria de demonstração ══════════════
  await db.partner.deleteMany();
  const parceiro = await db.partner.create({
    data: {
      nome: "Laboratório Exemplo",
      tipo: "laboratorio",
      organizationId: laboratorioOrg.id,
      contato: "EXEMPLO",
    },
  });
  await db.campaign.create({
    data: {
      partnerId: parceiro.id,
      titulo: "Coleta de exames no bairro",
      texto:
        "Unidade móvel de coleta às quartas-feiras, das 7h às 11h. Consulte a lista de exames atendidos.",
      // Nasce aguardando aprovação — é assim que a fila do painel ganha um
      // item de demonstração sem que nada suba ao ar sozinho.
      status: "enviada",
      pilar: "saude",
      cidade: "Canaã dos Carajás",
      bairro: "Novo Horizonte",
    },
  });

  console.log("✓ Seed concluído.");
  console.log("  Login de demonstração:");
  console.log("  e-mail: maria@example.com");
  console.log("  senha:  senha1234");
  console.log("");
  console.log("  Contas da área administrativa (/admin), mesma senha:");
  for (const c of contas) {
    console.log(`  ${c.email.padEnd(24)} ${c.role}`);
  }
  console.log("");
  console.log("  ⚠ Ações, unidades e parceria são EXEMPLOS — troque por reais.");
  console.log("  ⚠ A rede de apoio está vazia: preencha só com contato conferido.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
