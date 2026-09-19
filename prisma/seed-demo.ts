/**
 * Dados de DEMONSTRAÇÃO — volume para as telas terem o que desenhar.
 *
 * Isto não faz parte de `seed.ts` de propósito. O seed é o mínimo honesto: as
 * contas, as unidades marcadas "EXEMPLO" e a rede de apoio vazia. Este arquivo
 * inventa gente e movimento, e rodar isso num banco de produção seria publicar
 * telefone falso de casa-abrigo e número inventado de acionamento para a
 * Secretaria. Por isso mora em outro comando (`npm run db:demo`), e cada linha
 * que ele cria carrega marca no nome ou no e-mail.
 *
 * O sorteio é determinístico: a mesma semente devolve sempre os mesmos números.
 * Demonstração que muda de forma a cada execução faz perder tempo procurando
 * bug onde só houve `Math.random()`.
 */
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

import { MOOD_OPTIONS } from "../packages/core/constants";
import { COMMUNITY_CATEGORIES } from "../packages/core/community";
import { CORTE_AGREGADO } from "../packages/core/papeis";

const db = new PrismaClient();

/** Tudo que este script cria carrega uma destas marcas. É como ele se desfaz. */
const DOMINIO_DEMO = "@demo.invalid";
const MARCA = "DEMONSTRAÇÃO";

function sorteio(semente: number) {
  let s = semente >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}
const rnd = sorteio(20260918);

const escolher = <T>(lista: readonly T[]): T =>
  lista[Math.floor(rnd() * lista.length)];

const inteiro = (min: number, max: number) =>
  min + Math.floor(rnd() * (max - min + 1));

const diasAtras = (d: number) => {
  const data = new Date();
  data.setHours(12, 0, 0, 0);
  data.setDate(data.getDate() - d);
  return data;
};

/** Um dia qualquer dentro do mês que começou há `mesesAtras` meses. */
const dentroDoMes = (mesesAtras: number) => {
  const hoje = new Date();
  const inicio = new Date(hoje.getFullYear(), hoje.getMonth() - mesesAtras, 1);
  const ultimo = new Date(hoje.getFullYear(), hoje.getMonth() - mesesAtras + 1, 0);
  const limite = mesesAtras === 0 ? hoje.getDate() : ultimo.getDate();
  return new Date(inicio.getFullYear(), inicio.getMonth(), inteiro(1, limite), 10, 0, 0);
};

const BAIRROS = [
  "Centro",
  "Novo Horizonte",
  "Vale Verde",
  "Jardim Canaã",
  "Bela Vista",
  "Planalto",
  "Zona rural",
];

async function main() {
  console.log("Semeando dados de demonstração…\n");

  /* ─────────────── limpeza do que este script criou antes ───────────────
     Apagar a usuária leva junto ciclo, diário, humor, lembrete e relato —
     todos têm `onDelete: Cascade`. `SosEvent` não tem dono (nasce sem
     `userId`, de propósito), então some por inteiro. */
  const apagadas = await db.user.deleteMany({
    where: { email: { endsWith: DOMINIO_DEMO } },
  });
  await db.sosEvent.deleteMany();
  await db.supportService.deleteMany({ where: { name: { startsWith: MARCA } } });
  await db.healthUnit.deleteMany({ where: { nome: { startsWith: MARCA } } });
  if (apagadas.count) console.log(`  ↺ ${apagadas.count} usuárias de demonstração anteriores removidas`);

  /* ═══════════════════ as usuárias de demonstração ═══════════════════ */

  const senha = await bcrypt.hash("senha1234", 10);
  const QUANTAS = 42;

  const demo = await Promise.all(
    Array.from({ length: QUANTAS }, (_, i) => {
      const n = String(i + 1).padStart(2, "0");
      // Nascimento espalhado entre 18 e 64 anos: a tela de exames escolhe a
      // faixa por idade, e uma coorte toda da mesma idade esconderia isso.
      const idade = inteiro(18, 64);
      return db.user.create({
        data: {
          name: `${MARCA} — usuária ${n}`,
          email: `usuaria${n}${DOMINIO_DEMO}`,
          passwordHash: senha,
          role: "usuaria",
          birthDate: new Date(new Date().getFullYear() - idade, inteiro(0, 11), inteiro(1, 28)),
          goal: escolher(["acompanhar", "engravidar", "evitar"]),
          onboardedAt: diasAtras(inteiro(30, 300)),
        },
        select: { id: true },
      });
    }),
  );
  console.log(`  ✓ ${demo.length} usuárias de demonstração`);

  /* ═══════════ procura por exame — o gráfico da Prefeitura ═══════════

     Os valores por mês são escritos à mão, e não sorteados, porque este
     gráfico existe para mostrar DUAS coisas: um mês cheio e um mês abaixo do
     corte de agregação. Junho fica de propósito sob o corte — é ali que a
     barra vira hachura e o número vira "—". Com números aleatórios, a chance
     de cair um mês assim é sorte, e demonstração não se apoia em sorte. */
  const porMes = [
    { mesesAtras: 5, quantos: 24 },
    { mesesAtras: 4, quantos: 31 },
    { mesesAtras: 3, quantos: CORTE_AGREGADO - 2 }, // abaixo do corte: hachura
    { mesesAtras: 2, quantos: 27 },
    { mesesAtras: 1, quantos: 38 },
    { mesesAtras: 0, quantos: 22 },
  ];

  const lembretes = porMes.flatMap(({ mesesAtras, quantos }) =>
    Array.from({ length: quantos }, () => {
      const criado = dentroDoMes(mesesAtras);
      const vence = new Date(criado);
      vence.setDate(vence.getDate() + inteiro(7, 60));
      return {
        userId: escolher(demo).id,
        title: escolher([
          "Papanicolau (preventivo)",
          "Mamografia",
          "Ultrassom transvaginal",
          "Exame de sangue",
        ]),
        type: "exame",
        dueDate: vence,
        createdAt: criado,
      };
    }),
  );
  await db.reminder.createMany({ data: lembretes });
  console.log(`  ✓ ${lembretes.length} lembretes de exame em 6 meses`);

  /* ═══════════ acionamentos de ajuda — contagem agregada ═══════════

     `SosEvent` não tem `userId` nem localização mais fina que o bairro. Aqui
     é igual: o script sorteia camada e bairro, e nada mais. O painel da
     Prefeitura só mostra o número se ele passar do corte — por isso o mês
     corrente fica acima, senão a tela mostraria "—" e ninguém veria o
     indicador funcionando. */
  const sos = [
    { mesesAtras: 0, quantos: CORTE_AGREGADO + 3 },
    { mesesAtras: 1, quantos: 26 },
    { mesesAtras: 2, quantos: 19 },
  ].flatMap(({ mesesAtras, quantos }) =>
    Array.from({ length: quantos }, () => ({
      camada: escolher(["ligacao", "rede"]),
      bairro: escolher(BAIRROS),
      createdAt: dentroDoMes(mesesAtras),
    })),
  );
  await db.sosEvent.createMany({ data: sos });
  console.log(`  ✓ ${sos.length} acionamentos de ajuda (sem dono, sem localização)`);

  /* ═══════════ fila de moderação ═══════════ */

  const relatos = Array.from({ length: 34 }, (_, i) => {
    const denuncias = i < 9 ? inteiro(3, 11) : inteiro(0, 2);
    return {
      userId: escolher(demo).id,
      category: escolher(COMMUNITY_CATEGORIES).value,
      body: `${MARCA} — relato de exemplo ${i + 1}. Texto sem conteúdo real, só para a fila ter tamanho.`,
      // A ocultação automática por denúncia é a mesma regra do app; aqui só
      // reproduzimos o resultado dela.
      hidden: denuncias >= 3,
      reports: denuncias,
      createdAt: diasAtras(inteiro(1, 45)),
    };
  });
  await db.communityPost.createMany({ data: relatos });
  console.log(`  ✓ ${relatos.length} relatos, ${relatos.filter((r) => r.hidden).length} na fila de moderação`);

  /* ═══════════ rede de apoio ═══════════

     ATENÇÃO: telefone de demonstração é (00) 0000-0000, que não disca. Não é
     preguiça. Quem abre a tela de proteção pode estar em risco agora, e um
     número plausível ali — de teste, de escritório, de qualquer coisa — é pior
     do que tela vazia. O nome começa com a marca pelo mesmo motivo.

     A cobertura é desigual de propósito: "jurídico" fica sem nenhum contato,
     para o painel da rede mostrar o estado vermelho; um contato está vencido,
     para a pendência de "fora do ar" aparecer; outro vence em 12 dias. */
  const hoje = new Date();
  const verificadoHa = (d: number) => {
    const x = new Date(hoje);
    x.setDate(x.getDate() - d);
    return x;
  };

  await db.supportService.createMany({
    data: [
      { name: `${MARCA} — Delegacia de Atendimento à Mulher`, kind: "violencia", phone: "(00) 0000-0000", hours: "24h", verifiedAt: verificadoHa(10), verifiedBy: "Demonstração", ordem: 1 },
      { name: `${MARCA} — Casa-abrigo regional`, kind: "violencia", phone: "(00) 0000-0000", hours: "24h", verifiedAt: verificadoHa(78), verifiedBy: "Demonstração", ordem: 2 },
      { name: `${MARCA} — CREAS`, kind: "assistencia", phone: "(00) 0000-0000", hours: "seg a sex, 8h às 17h", verifiedAt: verificadoHa(21), verifiedBy: "Demonstração", ordem: 3 },
      { name: `${MARCA} — Hospital municipal`, kind: "saude", phone: "(00) 0000-0000", hours: "24h", verifiedAt: verificadoHa(5), verifiedBy: "Demonstração", ordem: 4 },
      // Vencido: passou dos 90 dias e some da tela de proteção sozinho.
      { name: `${MARCA} — CAPS`, kind: "saude", phone: "(00) 0000-0000", hours: "seg a sex", verifiedAt: verificadoHa(126), verifiedBy: "Demonstração", ordem: 5 },
    ],
  });
  console.log("  ✓ 5 contatos de apoio (1 vencido, 1 vencendo, 'jurídico' sem nenhum)");

  /* ═══════════ unidades de saúde ═══════════

     Três unidades a mais, em bairros que ainda não apareciam, para o gráfico
     "Unidades por bairro" ter mais de duas barras. Nenhuma delas oferece
     mamografia: no seed só uma unidade oferecia, e mantendo assim o gráfico
     de cobertura mostra a diferença entre um serviço concentrado e um
     serviço espalhado. */
  await db.healthUnit.createMany({
    data: [
      { nome: `${MARCA} — UBS Vale Verde`, tipo: "ubs", bairro: "Vale Verde", endereco: "Endereço de demonstração", telefone: "(00) 0000-0000", horario: "seg a sex, 7h às 17h", servicos: "ginecologia,prenatal,preventivo,vacinacao", latitude: -6.488, longitude: -49.872 },
      { nome: `${MARCA} — UBS Planalto`, tipo: "ubs", bairro: "Planalto", endereco: "Endereço de demonstração", telefone: "(00) 0000-0000", horario: "seg a sex, 7h às 17h", servicos: "ginecologia,prenatal,teste_rapido", latitude: -6.511, longitude: -49.892 },
      { nome: `${MARCA} — Posto Zona Rural`, tipo: "ubs", bairro: "Zona rural", endereco: "Endereço de demonstração", telefone: "(00) 0000-0000", horario: "quartas, 8h às 14h", servicos: "ginecologia,vacinacao", latitude: -6.478, longitude: -49.902 },
    ],
  });
  console.log("  ✓ 3 unidades de saúde em bairros novos");

  /* ═══════════ a história da Maria — os gráficos do aplicativo ═══════════

     As telas de gráfico do app leem 90 dias de diário, humor e medida. Com os
     3 registros do seed elas desenham um ponto e uma linha reta. Aqui a Maria
     ganha 90 dias de histórico com FORMA: cólica sobe perto da menstruação,
     energia cai junto. Série achatada não deixa ver se o gráfico está certo. */
  const maria = await db.user.findUnique({
    where: { email: "maria@example.com" },
    select: { id: true },
  });

  if (!maria) {
    console.log("\n  ⚠ maria@example.com não existe — rode `npm run db:seed` antes.");
  } else {
    await Promise.all([
      db.dailyLog.deleteMany({ where: { userId: maria.id } }),
      db.moodEntry.deleteMany({ where: { userId: maria.id } }),
      db.healthMetric.deleteMany({ where: { userId: maria.id } }),
      db.cycleEntry.deleteMany({ where: { userId: maria.id } }),
    ]);

    const CICLO = 28;
    const ciclos = [0, 1, 2, 3, 4, 5].map((i) => {
      const inicio = diasAtras(i * CICLO + inteiro(0, 2));
      const fim = new Date(inicio);
      fim.setDate(fim.getDate() + inteiro(4, 6));
      return {
        userId: maria.id,
        startDate: inicio,
        endDate: fim,
        flow: escolher(["leve", "medio", "intenso"]),
      };
    });
    await db.cycleEntry.createMany({ data: ciclos });

    const diarios = [];
    const humores = [];
    for (let d = 89; d >= 0; d--) {
      const diaDoCiclo = (CICLO - (d % CICLO)) % CICLO;
      const menstruada = diaDoCiclo < 5;
      // Cólica alta na menstruação e na véspera; energia é quase o espelho.
      const dor = menstruada ? inteiro(3, 5) : diaDoCiclo > 24 ? inteiro(2, 4) : inteiro(0, 2);
      const energia = menstruada ? inteiro(1, 3) : diaDoCiclo > 24 ? inteiro(2, 3) : inteiro(3, 5);
      diarios.push({
        userId: maria.id,
        date: diasAtras(d),
        pain: dor,
        energy: energia,
        sleepHours: Math.round((5.5 + rnd() * 3.5) * 2) / 2,
      });
      // Humor não é diário na vida real; aqui também não é.
      if (rnd() < 0.55) {
        humores.push({
          userId: maria.id,
          date: diasAtras(d),
          mood: menstruada
            ? escolher(["cansada", "triste", "neutro"])
            : escolher(MOOD_OPTIONS.map((m) => m.value)),
          intensity: inteiro(2, 5),
        });
      }
    }
    await db.dailyLog.createMany({ data: diarios });
    await db.moodEntry.createMany({ data: humores });

    const medidas = [];
    let peso = 63.4;
    for (let d = 88; d >= 0; d -= 7) {
      peso += (rnd() - 0.45) * 0.6;
      medidas.push({ userId: maria.id, date: diasAtras(d), type: "peso", value: Math.round(peso * 10) / 10 });
      medidas.push({ userId: maria.id, date: diasAtras(d), type: "pressao", value: inteiro(108, 126), value2: inteiro(68, 82) });
    }
    await db.healthMetric.createMany({ data: medidas });

    console.log(
      `  ✓ Maria: ${ciclos.length} ciclos, ${diarios.length} dias de diário, ${humores.length} humores, ${medidas.length} medidas`,
    );
  }

  console.log("\n✓ Demonstração pronta.");
  console.log(`  Tudo que este script criou tem "${MARCA}" no nome ou ${DOMINIO_DEMO} no e-mail.`);
  console.log("  Para remover: rode `npm run db:reset` (volta ao seed mínimo).");
  console.log("\n  ⚠ NUNCA rode isto em produção. Os telefones de apoio são falsos.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
