import Link from "next/link";

import { db } from "@/lib/db";
import {
  verificacaoVencida,
  diasParaVencer,
  TIPOS_SERVICO_APOIO,
  VALIDADE_VERIFICACAO_DIAS,
} from "@core/protecao";
import { CANAIS_NACIONAIS } from "@core/apoio";
import { COMMUNITY_CATEGORIES } from "@core/community";
import { DENUNCIAS_PARA_OCULTAR } from "@core/moderacao";
import { statusCampanhaLabel, PARCERIA_LINHAS } from "@core/parcerias";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BarrasHorizontais, type Fatia } from "@/components/admin/graficos";
import { Pendencia, Numero, Secao } from "@/components/admin/painel-pecas";

/** Lista em português: "180, 190 e 192" — não "180 e 190 e 192". */
function listar(itens: string[]) {
  if (itens.length <= 1) return itens[0] ?? "";
  return `${itens.slice(0, -1).join(", ")} e ${itens[itens.length - 1]}`;
}

/* ══════════════════════════ rede de apoio ══════════════════════════ */

/**
 * Painel da rede de apoio (CREAS, Centro de Referência da Mulher).
 *
 * Um trabalho só: manter contato verificado no ar. Por isso a tela é quase
 * inteiramente sobre validade — não há indicador de uso, de usuária, nem de
 * quantas pessoas abriram a tela de proteção. Esse número não existe no banco
 * de propósito, e não vai ser inventado aqui para encher painel.
 */
export async function PainelRedeApoio() {
  const servicos = await db.supportService.findMany({ where: { active: true } });

  const vencidos = servicos.filter((s) => verificacaoVencida(s.verifiedAt));
  const noAr = servicos.filter((s) => !verificacaoVencida(s.verifiedAt));
  const vencendo = noAr.filter((s) => diasParaVencer(s.verifiedAt) <= 30);

  const porTipo: Fatia[] = TIPOS_SERVICO_APOIO.map((t) => {
    const quantos = noAr.filter((s) => s.kind === t.value).length;
    return { rotulo: t.label, valor: quantos, alerta: quantos === 0 };
  });

  return (
    <div className="space-y-8">
      {vencidos.length > 0 && (
        <Pendencia
          href="/admin/servicos"
          tom="alerta"
          titulo={`${vencidos.length} contato${vencidos.length > 1 ? "s" : ""} fora do ar por verificação vencida`}
          texto={`${vencidos.map((s) => s.name).join(", ")}. Enquanto ninguém ligar e confirmar, a tela de proteção mostra só os canais nacionais.`}
        />
      )}
      {vencendo.length > 0 && (
        <Pendencia
          href="/admin/servicos"
          tom="neutro"
          titulo={`${vencendo.length} contato${vencendo.length > 1 ? "s" : ""} vence${vencendo.length > 1 ? "m" : ""} em até 30 dias`}
          texto="Reverificar antes do prazo evita que o contato saia do ar sozinho."
        />
      )}

      <div className="grid gap-4 sm:grid-cols-3">
        <Numero valor={noAr.length} rotulo="Contatos no ar" nota="Verificados e visíveis no app" />
        <Numero valor={vencidos.length} rotulo="Fora do ar" nota={`Sem verificação há mais de ${VALIDADE_VERIFICACAO_DIAS} dias`} />
        <Numero
          valor={CANAIS_NACIONAIS.length}
          rotulo="Canais nacionais"
          nota="Sempre visíveis, mesmo sem nenhum contato local cadastrado"
        />
      </div>

      <Secao
        titulo="Cobertura por tipo de serviço"
        descricao="Contatos verificados e no ar, por tipo. Tipo em vermelho é tipo que a tela de proteção não consegue indicar em Canaã."
      >
        <BarrasHorizontais
          dados={porTipo}
          unidade="contatos no ar"
          vazio="Nenhum contato cadastrado ainda."
        />
      </Secao>

      <Card className="border-plum-200 bg-plum-50">
        <p className="font-semibold text-plum-900">
          Telefone errado aqui é pior do que tela vazia
        </p>
        <p className="mt-1 text-sm leading-relaxed text-plum-800">
          Quem abre aquela tela pode estar em risco agora. É por isso que cada
          contato tem nome de quem ligou e conferiu, e sai do ar sozinho depois
          de {VALIDADE_VERIFICACAO_DIAS} dias — {listar(CANAIS_NACIONAIS.map((c) => c.numero))} valem
          em qualquer município e não ficam desatualizados.
        </p>
      </Card>
    </div>
  );
}

/* ══════════════════════════ moderação ══════════════════════════ */

/** Painel da moderadora. Uma fila, e o que já foi decidido. */
export async function PainelModeracao() {
  const trintaDias = new Date(Date.now() - 30 * 86_400_000);

  const [fila, decisoes] = await Promise.all([
    db.communityPost.findMany({
      where: { hidden: true },
      select: { category: true, reports: true, createdAt: true },
    }),
    db.moderationAction.count({ where: { createdAt: { gte: trintaDias } } }),
  ]);

  const porCategoria: Fatia[] = COMMUNITY_CATEGORIES.map((c) => ({
    rotulo: c.label,
    valor: fila.filter((p) => p.category === c.value).length,
  })).filter((f) => f.valor > 0);

  const maisAntigo = fila.length
    ? fila.reduce((a, b) => (a.createdAt < b.createdAt ? a : b))
    : null;

  return (
    <div className="space-y-8">
      {fila.length > 0 ? (
        <Pendencia
          href="/admin/moderacao"
          tom={fila.length > 5 ? "alerta" : "neutro"}
          titulo={`${fila.length} relato${fila.length > 1 ? "s" : ""} aguardando decisão`}
          texto={
            maisAntigo
              ? `O mais antigo está parado desde ${maisAntigo.createdAt.toLocaleDateString("pt-BR")}. Relato oculto some do feed até alguém decidir.`
              : ""
          }
        />
      ) : (
        <Card>
          <p className="font-semibold text-ink">Fila vazia</p>
          <p className="mt-1 text-sm leading-relaxed text-muted">
            Nenhum relato aguardando revisão. A ocultação automática em{" "}
            {DENUNCIAS_PARA_OCULTAR} denúncias continua funcionando enquanto
            ninguém está olhando.
          </p>
        </Card>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <Numero valor={fila.length} rotulo="Na fila agora" nota="Ocultos por denúncia, sem decisão humana" />
        <Numero valor={decisoes} rotulo="Decisões em 30 dias" nota="Restaurar, remover ou silenciar" />
      </div>

      {porCategoria.length > 0 && (
        <Secao
          titulo="A fila por assunto"
          descricao="Onde a denúncia está se concentrando. Concentração num assunto costuma indicar desinformação circulando, não uma autora."
        >
          <BarrasHorizontais dados={porCategoria} unidade="relatos na fila" />
        </Secao>
      )}

      <Card className="border-clay-200 bg-clay-50">
        <p className="font-semibold text-clay-700">Você vê o apelido, nunca o nome</p>
        <p className="mt-1 text-sm leading-relaxed text-clay-700">
          A consulta da fila nem seleciona o nome real. Não existe caminho, a
          partir desta área, para descobrir quem escreveu — e isso é proposital.
        </p>
      </Card>
    </div>
  );
}

/* ══════════════════════════ parceiro ══════════════════════════ */

/** Painel do parceiro comercial. Só as próprias peças, nunca dado de usuária. */
export async function PainelParceiro({ organizationId }: { organizationId: string | null }) {
  const campanhas = await db.campaign.findMany({
    where: organizationId ? { partner: { organizationId } } : { id: "__nenhuma__" },
    include: { partner: { select: { nome: true } } },
    orderBy: { createdAt: "desc" },
  });

  const recusadas = campanhas.filter((c) => c.status === "recusada");
  const aguardando = campanhas.filter((c) => c.status === "enviada");
  const aprovadas = campanhas.filter((c) => c.status === "aprovada");

  return (
    <div className="space-y-8">
      {recusadas.length > 0 && (
        <Pendencia
          href="/admin/parcerias"
          tom="alerta"
          titulo={`${recusadas.length} peça${recusadas.length > 1 ? "s" : ""} recusada${recusadas.length > 1 ? "s" : ""}`}
          texto={recusadas.map((c) => `${c.titulo}: ${c.motivoRecusa ?? "sem motivo registrado"}`).join(" · ")}
        />
      )}
      {aguardando.length > 0 && (
        <Pendencia
          href="/admin/parcerias"
          tom="neutro"
          titulo={`${aguardando.length} peça${aguardando.length > 1 ? "s" : ""} aguardando aprovação`}
          texto="Nenhuma vai ao ar antes de alguém da equipe aprovar."
        />
      )}

      <div className="grid gap-4 sm:grid-cols-3">
        <Numero valor={aprovadas.length} rotulo="No ar" nota="Rotuladas como Parceria no app" />
        <Numero valor={aguardando.length} rotulo="Aguardando" nota="Na fila de aprovação" />
        <Numero valor={recusadas.length} rotulo="Recusadas" nota="Precisam de ajuste antes de reenviar" />
      </div>

      {campanhas.length > 0 && (
        <Secao titulo="Suas peças">
          <ul className="divide-y divide-line">
            {campanhas.slice(0, 8).map((c) => (
              <li key={c.id} className="flex flex-wrap items-center gap-2 py-2.5 first:pt-0">
                <span className="font-semibold text-ink">{c.titulo}</span>
                <Badge tone={c.status === "aprovada" ? "sage" : "neutral"}>
                  {statusCampanhaLabel(c.status)}
                </Badge>
                <span className="text-xs text-muted">{c.partner.nome}</span>
              </li>
            ))}
          </ul>
        </Secao>
      )}

      <Secao
        titulo="As três linhas que a peça não cruza"
        descricao="Não é diretriz de estilo: é o que a equipe verifica antes de aprovar."
      >
        <ul className="space-y-2">
          {PARCERIA_LINHAS.map((linha) => (
            <li key={linha} className="flex gap-2.5 text-sm text-ink">
              <span aria-hidden className="text-plum-700">
                —
              </span>
              {linha}
            </li>
          ))}
        </ul>
      </Secao>
    </div>
  );
}

/* ══════════════════════════ equipe ══════════════════════════ */

/** Painel da equipe: o estado de todos os domínios de uma vez. */
export async function PainelEquipe() {
  const [servicos, unidades, denunciados, campanhasNaFila, auditoria] =
    await Promise.all([
      db.supportService.findMany({ where: { active: true }, select: { verifiedAt: true } }),
      db.healthUnit.count({ where: { ativa: true } }),
      db.communityPost.count({ where: { hidden: true } }),
      db.campaign.count({ where: { status: "enviada" } }),
      db.auditLog.findMany({
        orderBy: { createdAt: "desc" },
        take: 6,
        select: {
          id: true,
          acao: true,
          recurso: true,
          detalhe: true,
          createdAt: true,
          actor: { select: { name: true } },
        },
      }),
    ]);

  const vencidos = servicos.filter((s) => verificacaoVencida(s.verifiedAt)).length;

  return (
    <div className="space-y-8">
      {vencidos > 0 && (
        <Pendencia
          href="/admin/servicos"
          tom="alerta"
          titulo={`${vencidos} contato${vencidos > 1 ? "s" : ""} de proteção fora do ar`}
          texto="Verificação vencida. É a única pendência do sistema que deixa alguém em risco sem resposta."
        />
      )}
      {denunciados > 0 && (
        <Pendencia
          href="/admin/moderacao"
          tom="neutro"
          titulo={`${denunciados} relato${denunciados > 1 ? "s" : ""} na fila de moderação`}
          texto="Ocultos automaticamente, aguardando decisão humana."
        />
      )}
      {campanhasNaFila > 0 && (
        <Pendencia
          href="/admin/parcerias"
          tom="neutro"
          titulo={`${campanhasNaFila} peça${campanhasNaFila > 1 ? "s" : ""} de parceiro aguardando aprovação`}
          texto="Nenhuma vai ao ar antes de alguém aprovar."
        />
      )}

      <div className="grid gap-4 sm:grid-cols-3">
        <Numero valor={servicos.length - vencidos} rotulo="Contatos de proteção no ar" />
        <Numero valor={unidades} rotulo="Unidades de saúde" />
        <Numero valor={denunciados} rotulo="Relatos na fila" />
      </div>

      <Secao
        titulo="Últimas escritas administrativas"
        descricao="Quem mexeu em quê. Nada vindo da usuária no pilar Proteção entra aqui."
      >
        {auditoria.length === 0 ? (
          <p className="text-sm text-muted">Nenhuma escrita registrada ainda.</p>
        ) : (
          <ul className="divide-y divide-line text-sm">
            {auditoria.map((e) => (
              <li key={e.id} className="flex flex-wrap items-baseline gap-x-2 py-2 first:pt-0">
                <span className="num w-28 shrink-0 text-xs text-muted">
                  {e.createdAt.toLocaleDateString("pt-BR")}
                </span>
                <span className="font-semibold text-ink">{e.actor.name}</span>
                <span className="text-muted">
                  {e.acao} · {e.recurso}
                </span>
                {e.detalhe && <span className="text-ink">{e.detalhe}</span>}
              </li>
            ))}
          </ul>
        )}
        <Link
          href="/admin/auditoria"
          className="mt-4 inline-block text-sm font-semibold text-plum-700 hover:underline"
        >
          Ver auditoria completa
        </Link>
      </Secao>
    </div>
  );
}

/* ══════════════════════════ fallback ══════════════════════════ */

/**
 * Papel administrativo sem painel próprio ainda.
 *
 * Não inventa conteúdo: diz o que a pessoa pode fazer e leva para lá.
 */
export function PainelGenerico({ secoes }: { secoes: { href: string; label: string; descricao: string }[] }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {secoes.map((s) => (
        <Link key={s.href} href={s.href} className="group">
          <Card className="h-full transition-shadow hover:shadow-[var(--shadow-card-hover)]">
            <p className="font-display font-semibold text-ink group-hover:text-plum-700">
              {s.label}
            </p>
            <p className="mt-1 text-sm leading-relaxed text-muted">{s.descricao}</p>
          </Card>
        </Link>
      ))}
    </div>
  );
}
