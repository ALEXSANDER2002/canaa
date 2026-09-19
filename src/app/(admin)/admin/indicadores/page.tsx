import { requirePermissao } from "@/lib/roles";
import { db } from "@/lib/db";
import { agregado, CORTE_AGREGADO } from "@core/papeis";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardTitle, CardDescription } from "@/components/ui/card";

export const metadata = { title: "Indicadores" };

function inicioDoMes(): Date {
  const hoje = new Date();
  return new Date(hoje.getFullYear(), hoje.getMonth(), 1);
}

export default async function AdminIndicadores() {
  await requirePermissao("indicadores:ler");
  const desde = inicioDoMes();

  const [
    usuarias,
    registrosDoMes,
    lembretesDeExame,
    acoesAtivas,
    unidadesAtivas,
    relatos,
    sosDoMes,
  ] = await Promise.all([
    db.user.count({ where: { role: "usuaria", onboardedAt: { not: null } } }),
    db.dailyLog.count({ where: { date: { gte: desde } } }),
    db.reminder.count({ where: { type: "exame", createdAt: { gte: desde } } }),
    db.cityAction.count({ where: { active: true } }),
    db.healthUnit.count({ where: { ativa: true } }),
    db.communityPost.count({ where: { hidden: false } }),
    db.sosEvent.count({ where: { createdAt: { gte: desde } } }),
  ]);

  const numeros = [
    {
      rotulo: "Usuárias com cadastro concluído",
      valor: agregado(usuarias),
      nota: "Total no município.",
    },
    {
      rotulo: "Registros diários neste mês",
      valor: agregado(registrosDoMes),
      nota: "Check-ins de sintoma, energia e sono.",
    },
    {
      rotulo: "Lembretes de exame criados neste mês",
      valor: agregado(lembretesDeExame),
      nota: "Indica quanta gente saiu da tela de exames com uma data marcada.",
    },
    {
      rotulo: "Relatos publicados na comunidade",
      valor: agregado(relatos),
      nota: "Visíveis no feed, sem contar os ocultos.",
    },
    {
      rotulo: "Acionamentos do SOS neste mês",
      valor: agregado(sosDoMes),
      nota: "Contagem sem identificação — ver a nota abaixo.",
    },
  ];

  // Estes dois são conteúdo publicado pela própria Prefeitura, não
  // comportamento de usuária: não passam pelo corte.
  const publicados = [
    { rotulo: "Campanhas no ar", valor: acoesAtivas },
    { rotulo: "Unidades cadastradas", valor: unidadesAtivas },
  ];

  return (
    <>
      <PageHeader
        title="Indicadores"
        description="Números agregados do município. Nenhum nome, nenhum perfil."
      />

      <Card className="mb-8 border-plum-200 bg-plum-50">
        <CardTitle className="text-plum-900">
          Por que alguns números aparecem como &ldquo;—&rdquo;
        </CardTitle>
        <CardDescription className="text-plum-800">
          Canaã dos Carajás tem cerca de 77 mil habitantes, e as pessoas se
          reconhecem. Qualquer número abaixo de {CORTE_AGREGADO} deixa de ser
          estatística e vira identificação — então ele não é mostrado. O
          acionamento do SOS é gravado sem nenhum vínculo com quem acionou: o
          registro existe para dimensionar a rede, não para localizar alguém.
        </CardDescription>
      </Card>

      <div className="mb-8 grid gap-4 sm:grid-cols-2">
        {numeros.map((n) => (
          <Card key={n.rotulo}>
            <p className="font-display text-3xl font-bold tabular-nums text-ink">
              {n.valor === null ? "—" : n.valor.toLocaleString("pt-BR")}
            </p>
            <p className="mt-1 font-semibold text-ink">{n.rotulo}</p>
            <p className="mt-0.5 text-sm text-muted">
              {n.valor === null
                ? `Menos de ${CORTE_AGREGADO} — não exibido.`
                : n.nota}
            </p>
          </Card>
        ))}
      </div>

      <h2 className="mb-3 font-display text-lg font-semibold text-ink">
        O que a Prefeitura publicou
      </h2>
      <div className="grid gap-4 sm:grid-cols-2">
        {publicados.map((p) => (
          <Card key={p.rotulo}>
            <p className="font-display text-3xl font-bold tabular-nums text-ink">
              {p.valor.toLocaleString("pt-BR")}
            </p>
            <p className="mt-1 font-semibold text-ink">{p.rotulo}</p>
          </Card>
        ))}
      </div>
    </>
  );
}
