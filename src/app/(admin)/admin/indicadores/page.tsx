import { requirePermissao } from "@/lib/roles";
import { db } from "@/lib/db";
import { agregado, CORTE_AGREGADO } from "@core/papeis";
import { SERVICOS_UNIDADE, servicosDa } from "@core/unidades";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardTitle, CardDescription } from "@/components/ui/card";
import {
  BarrasHorizontais,
  SerieMensal,
  type Fatia,
} from "@/components/admin/graficos";
import { Secao } from "@/components/admin/painel-pecas";
import { MapaCalorUnidades } from "@/components/admin/mapa-calor-unidades";

export const metadata = { title: "Indicadores" };

function inicioDoMes(): Date {
  const hoje = new Date();
  return new Date(hoje.getFullYear(), hoje.getMonth(), 1);
}

function serieDosUltimosMeses(datas: Date[], hoje = new Date()): Fatia[] {
  const resultado: Fatia[] = [];
  for (let i = 5; i >= 0; i--) {
    const inicio = new Date(hoje.getFullYear(), hoje.getMonth() - i, 1);
    const fim = new Date(hoje.getFullYear(), hoje.getMonth() - i + 1, 1);
    resultado.push({
      rotulo: inicio
        .toLocaleDateString("pt-BR", { month: "short" })
        .replace(".", ""),
      valor: datas.filter((data) => data >= inicio && data < fim).length,
    });
  }
  return resultado;
}

export default async function AdminIndicadores() {
  await requirePermissao("indicadores:ler");
  const hoje = new Date();
  const desde = inicioDoMes();
  const seisMeses = new Date(hoje.getFullYear(), hoje.getMonth() - 5, 1);

  const [
    usuarias,
    registrosDoMes,
    lembretesDeExame,
    acoesAtivas,
    unidades,
    relatos,
    sos,
    exames,
    diarios,
  ] = await Promise.all([
    db.user.count({ where: { role: "usuaria", onboardedAt: { not: null } } }),
    db.dailyLog.count({ where: { date: { gte: desde } } }),
    db.reminder.count({ where: { type: "exame", createdAt: { gte: desde } } }),
    db.cityAction.count({ where: { active: true } }),
    db.healthUnit.findMany({ where: { ativa: true } }),
    db.communityPost.count({ where: { hidden: false } }),
    db.sosEvent.findMany({
      where: { createdAt: { gte: seisMeses } },
      select: { createdAt: true },
    }),
    db.reminder.findMany({
      where: { type: "exame", createdAt: { gte: seisMeses } },
      select: { createdAt: true },
    }),
    db.dailyLog.findMany({
      where: { createdAt: { gte: seisMeses } },
      select: { createdAt: true },
    }),
  ]);

  const sosDoMes = sos.filter((evento) => evento.createdAt >= desde).length;

  const coberturaPorServico: Fatia[] = SERVICOS_UNIDADE.map((servico) => ({
    rotulo: servico.label,
    valor: unidades.filter((unidade) =>
      servicosDa(unidade).includes(servico.value),
    ).length,
    alerta: !unidades.some((unidade) =>
      servicosDa(unidade).includes(servico.value),
    ),
  })).sort((a, b) => a.valor - b.valor);

  const unidadesPorBairro = new Map<string, number>();
  for (const unidade of unidades) {
    const bairro = unidade.bairro?.trim() || "Sem bairro informado";
    unidadesPorBairro.set(bairro, (unidadesPorBairro.get(bairro) ?? 0) + 1);
  }
  const coberturaPorBairro: Fatia[] = [...unidadesPorBairro.entries()]
    .map(([rotulo, valor]) => ({ rotulo, valor }))
    .sort((a, b) => b.valor - a.valor);

  const pontosCalor = unidades
    .filter(
      (unidade): unidade is typeof unidade & {
        latitude: number;
        longitude: number;
      } => unidade.latitude != null && unidade.longitude != null,
    )
    .map((unidade) => ({
      id: unidade.id,
      nome: unidade.nome,
      bairro: unidade.bairro ?? "Sem bairro informado",
      latitude: unidade.latitude,
      longitude: unidade.longitude,
      servicos: servicosDa(unidade).length,
    }));

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
    { rotulo: "Unidades cadastradas", valor: unidades.length },
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

      <section className="mt-8">
        <Secao
          titulo="Mapa de calor da cobertura"
          descricao="Concentração territorial das unidades, ponderada pela quantidade de serviços oferecidos. Não usa localização de usuárias."
        >
          <MapaCalorUnidades pontos={pontosCalor} />
        </Secao>
      </section>

      <div className="mt-8 grid gap-4 lg:grid-cols-2">
        <Secao
          titulo="Cobertura por serviço"
          descricao="Quantas unidades ativas oferecem cada cuidado. Vermelho indica serviço sem cobertura cadastrada."
        >
          <BarrasHorizontais
            dados={coberturaPorServico}
            unidade="unidades"
          />
        </Secao>
        <Secao
          titulo="Unidades por bairro"
          descricao="Distribuição territorial da rede cadastrada."
        >
          <BarrasHorizontais
            dados={coberturaPorBairro}
            unidade="unidades"
          />
        </Secao>
      </div>

      <div className="mt-8 grid gap-4 xl:grid-cols-3">
        <Secao
          titulo="Procura por exames"
          descricao={`Lembretes criados nos últimos seis meses. Valores abaixo de ${CORTE_AGREGADO} são protegidos.`}
        >
          <SerieMensal
            dados={serieDosUltimosMeses(exames.map((item) => item.createdAt), hoje)}
            unidade="lembretes"
            cortar
          />
        </Secao>
        <Secao
          titulo="Registros de cuidado"
          descricao={`Check-ins diários agregados. Valores abaixo de ${CORTE_AGREGADO} não são exibidos.`}
        >
          <SerieMensal
            dados={serieDosUltimosMeses(diarios.map((item) => item.createdAt), hoje)}
            unidade="check-ins"
            cortar
          />
        </Secao>
        <Secao
          titulo="Acionamentos de ajuda"
          descricao="Eventos sem identificação ou localização individual, exibidos somente acima do corte de privacidade."
        >
          <SerieMensal
            dados={serieDosUltimosMeses(sos.map((item) => item.createdAt), hoje)}
            unidade="acionamentos"
            cortar
          />
        </Secao>
      </div>
    </>
  );
}
