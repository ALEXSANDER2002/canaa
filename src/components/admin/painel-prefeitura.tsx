import Link from "next/link";

import { db } from "@/lib/db";
import { SERVICOS_UNIDADE, servicosDa } from "@core/unidades";
import { situacaoDaAcao } from "@core/apoio";
import { agregado, CORTE_AGREGADO } from "@core/papeis";
import { Card, CardTitle, CardDescription } from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";
import { BarrasHorizontais, SerieMensal, type Fatia } from "@/components/admin/graficos";
import { Pendencia, Numero, Secao } from "@/components/admin/painel-pecas";

/**
 * Painel da Prefeitura — Secretaria de Saúde / SEMAS.
 *
 * A pergunta que esta tela responde não é "o que existe no sistema", é **onde
 * está o buraco da rede e o que eu publiquei está no ar**. Por isso ela abre
 * por cobertura e pendência, não por um índice de seções.
 *
 * O que ela deliberadamente NÃO mostra:
 *
 * - Nada individual. Nenhuma linha aqui desce ao nível de uma pessoa.
 * - Nada do pilar Proteção além de contagem agregada de acionamento — e essa
 *   vem de `SosEvent`, que nasce sem `userId`.
 * - Nenhum número abaixo do corte de agregação. Num município de 77 mil, "3
 *   mulheres no bairro X" não é estatística, é endereço.
 */
export async function PainelPrefeitura() {
  const hoje = new Date();
  const seisMeses = new Date(hoje.getFullYear(), hoje.getMonth() - 5, 1);

  const [unidades, acoes, lembretesExame, sosDoMes] = await Promise.all([
    db.healthUnit.findMany({ where: { ativa: true } }),
    db.cityAction.findMany({ where: { active: true } }),
    db.reminder.findMany({
      where: { type: "exame", createdAt: { gte: seisMeses } },
      select: { createdAt: true },
    }),
    db.sosEvent.count({
      where: { createdAt: { gte: new Date(hoje.getFullYear(), hoje.getMonth(), 1) } },
    }),
  ]);

  /* ── cobertura de serviços: onde a rede tem buraco ── */
  const porServico: Fatia[] = SERVICOS_UNIDADE.map((s) => {
    const quantas = unidades.filter((u) => servicosDa(u).includes(s.value)).length;
    return { rotulo: s.label, valor: quantas, alerta: quantas === 0 };
  }).sort((a, b) => a.valor - b.valor);

  const semCobertura = porServico.filter((s) => s.valor === 0);

  /* ── cobertura por bairro ── */
  const bairros = new Map<string, number>();
  for (const u of unidades) {
    const b = u.bairro?.trim() || "Sem bairro informado";
    bairros.set(b, (bairros.get(b) ?? 0) + 1);
  }
  const porBairro: Fatia[] = [...bairros.entries()]
    .map(([rotulo, valor]) => ({ rotulo, valor }))
    .sort((a, b) => b.valor - a.valor);

  /* ── demanda: lembrete de exame criado por mês ── */
  const meses: Fatia[] = [];
  for (let i = 5; i >= 0; i--) {
    const inicio = new Date(hoje.getFullYear(), hoje.getMonth() - i, 1);
    const fim = new Date(hoje.getFullYear(), hoje.getMonth() - i + 1, 1);
    meses.push({
      rotulo: inicio.toLocaleDateString("pt-BR", { month: "short" }).replace(".", ""),
      valor: lembretesExame.filter(
        (r) => r.createdAt >= inicio && r.createdAt < fim,
      ).length,
    });
  }

  /* ── pendências ── */
  const semServico = unidades.filter((u) => servicosDa(u).length === 0);
  const emSete = new Date(hoje.getTime() + 7 * 86_400_000);
  const encerrando = acoes.filter(
    (a) => a.endsAt && a.endsAt >= hoje && a.endsAt <= emSete,
  );
  const noAr = acoes.filter((a) => situacaoDaAcao(a) !== "encerrada");

  return (
    <div className="space-y-8">
      {/* ═══ o que precisa de você ═══ */}
      {(semServico.length > 0 || semCobertura.length > 0 || encerrando.length > 0) && (
        <div className="space-y-3">
          {semCobertura.length > 0 && (
            <Pendencia
              href="/admin/unidades"
              tom="alerta"
              titulo={`${semCobertura.length} serviço${semCobertura.length > 1 ? "s" : ""} sem nenhuma unidade na rede`}
              texto={`${semCobertura.map((s) => s.rotulo).join(", ")}. A tela de exames por idade mostra o exame, mas não tem para onde mandar quem precisa dele.`}
            />
          )}
          {semServico.length > 0 && (
            <Pendencia
              href="/admin/unidades"
              tom="neutro"
              titulo={`${semServico.length} unidade${semServico.length > 1 ? "s" : ""} sem serviço marcado`}
              texto={`${semServico.map((u) => u.nome).join(", ")} — não aparece${semServico.length > 1 ? "m" : ""} em nenhuma busca por exame enquanto estiver assim.`}
            />
          )}
          {encerrando.length > 0 && (
            <Pendencia
              href="/admin/acoes"
              tom="neutro"
              titulo={`${encerrando.length} campanha${encerrando.length > 1 ? "s" : ""} encerra${encerrando.length > 1 ? "m" : ""} em até 7 dias`}
              texto={encerrando.map((a) => a.title).join(", ")}
            />
          )}
        </div>
      )}

      {/* ═══ números do município ═══ */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Numero valor={unidades.length} rotulo="Unidades no ar" nota="Visíveis para as usuárias" />
        <Numero valor={noAr.length} rotulo="Campanhas no ar" nota="Mutirões, vacinação e ações" />
        <Numero
          valor={agregado(sosDoMes)}
          rotulo="Acionamentos de ajuda no mês"
          nota={
            sosDoMes >= CORTE_AGREGADO
              ? "Contagem sem identificação — só para dimensionar a rede"
              : `Abaixo de ${CORTE_AGREGADO}, não é exibido`
          }
        />
      </div>

      {/* ═══ cobertura ═══ */}
      <Secao
        titulo="Onde a rede tem buraco"
        descricao="Quantas unidades ativas oferecem cada serviço. Serviço em vermelho é serviço que o app não consegue indicar a ninguém."
      >
        <BarrasHorizontais
          dados={porServico}
          unidade="unidades que oferecem"
          vazio="Nenhuma unidade cadastrada ainda."
        />
      </Secao>

      <div className="grid gap-4 lg:grid-cols-2">
        <Secao
          titulo="Unidades por bairro"
          descricao="Onde a rede está concentrada."
        >
          <BarrasHorizontais
            dados={porBairro}
            unidade="unidades"
            vazio="Nenhuma unidade cadastrada ainda."
          />
        </Secao>

        <Secao
          titulo="Procura por exame"
          descricao={`Lembretes de exame que as usuárias criaram, por mês. Mês com menos de ${CORTE_AGREGADO} aparece hachurado.`}
        >
          <SerieMensal dados={meses} unidade="lembretes de exame criados" cortar />
        </Secao>
      </div>

      {/* ═══ atalhos do dia a dia ═══ */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Atalho
          href="/admin/acoes"
          icone="calendar"
          titulo="Publicar campanha"
          texto="Mutirão, vacinação, roda de conversa — aparece na aba Comunidade do app."
        />
        <Atalho
          href="/admin/unidades"
          icone="home"
          titulo="Manter as unidades"
          texto="Horário, telefone e quais serviços cada uma realmente faz."
        />
      </div>
    </div>
  );
}

function Atalho({
  href,
  icone,
  titulo,
  texto,
}: {
  href: string;
  icone: Parameters<typeof Icon>[0]["name"];
  titulo: string;
  texto: string;
}) {
  return (
    <Link href={href} className="group">
      <Card className="h-full transition-shadow hover:shadow-[var(--shadow-card-hover)]">
        <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-[var(--radius-control)] bg-plum-50">
          <Icon name={icone} className="h-5 w-5 text-plum-700" />
        </div>
        <CardTitle className="text-base group-hover:text-plum-700">{titulo}</CardTitle>
        <CardDescription>{texto}</CardDescription>
      </Card>
    </Link>
  );
}
