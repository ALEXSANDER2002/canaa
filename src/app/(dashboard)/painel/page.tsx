import Link from "next/link";

import { requireUser } from "@/lib/session";
import { db } from "@/lib/db";
import {
  getCycles,
  getPregnancy,
  getMoods,
  getUpcomingReminders,
  getDailyLogs,
} from "@/server/queries";
import {
  predictCycle,
  pregnancyProgress,
  cycleStats,
  cyclePhase,
  formatDate,
  daysBetween,
} from "@/lib/utils";
import { generateInsights } from "@/lib/insights";
import {
  chanceDeEngravidar,
  estadoDoCiclo,
  GRADIENTES_CICLO,
  ACENTO_CICLO,
} from "@core/calendar";
import { situacaoDaAcao, SITUACAO_LABEL } from "@core/apoio";
import { perguntaDoDia } from "@core/content";
import { pilar } from "@core/pilares";
import { BrandMark, Icon, type IconName } from "@/components/ui/icon";

const PROTECAO = pilar("protecao");
const COMUNIDADE = pilar("comunidade");
const IA = pilar("ia");

function diaDoAno(d: Date): number {
  const inicio = new Date(d.getFullYear(), 0, 0);
  return Math.floor((d.getTime() - inicio.getTime()) / 86_400_000);
}

export default async function PainelPage() {
  const user = await requireUser();
  const firstName = (user.name ?? "").split(" ")[0] || "você";
  const hoje = new Date();

  const [cycles, pregnancy, moods, reminders, dailyLogs, relatos, acoes] =
    await Promise.all([
      getCycles(user.id),
      getPregnancy(user.id),
      getMoods(user.id, 30),
      getUpcomingReminders(user.id, 1),
      getDailyLogs(user.id, 30),
      db.communityPost.findMany({
        where: { hidden: false },
        select: { createdAt: true },
      }),
      db.cityAction.findMany({
        where: { active: true },
        orderBy: [{ pinned: "desc" }, { startsAt: "asc" }],
      }),
    ]);

  const prediction = predictCycle(cycles.map((c) => c.startDate));
  const stats = cycleStats(cycles.map((c) => c.startDate));
  const phase = prediction
    ? cyclePhase(
        prediction.currentCycleDay,
        prediction.cycleLength,
        prediction.periodLength,
      )
    : null;
  const insights = generateInsights({
    prediction,
    stats,
    phase,
    dailyLogs,
    moods,
  }).slice(0, 3);
  const progress = pregnancy ? pregnancyProgress(pregnancy.lastPeriodDate) : null;
  const proximo = reminders[0] ?? null;

  const chance = chanceDeEngravidar(hoje, prediction);
  const estado = estadoDoCiclo(phase?.key, chance);
  const gradiente = GRADIENTES_CICLO[estado];
  const acento = ACENTO_CICLO[estado];
  const faltam = prediction ? daysBetween(hoje, prediction.nextPeriodDate) : null;
  const atrasada = faltam !== null && faltam < 0;

  const semana = hoje.getTime() - 7 * 86_400_000;
  const relatosNovos = relatos.filter(
    (r) => r.createdAt.getTime() >= semana,
  ).length;
  const vivas = acoes.filter((a) => situacaoDaAcao(a) !== "encerrada");
  const acaoDestaque = vivas.find((a) => a.pinned) ?? vivas[0] ?? null;
  const data = new Intl.DateTimeFormat("pt-BR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(hoje);
  const dataFormatada = data.charAt(0).toUpperCase() + data.slice(1);

  const destaqueTitulo = prediction
    ? atrasada
      ? "Seu ciclo pede uma atualização"
      : faltam === 0
        ? "Sua menstruação é prevista para hoje"
        : `Faltam ${faltam} ${faltam === 1 ? "dia" : "dias"} para a menstruação`
    : "Comece pelo seu ciclo";
  const destaqueDescricao = prediction
    ? atrasada
      ? `Você está no ${prediction.currentCycleDay}º dia. Registre a última menstruação para atualizar a previsão.`
      : `Dia ${prediction.currentCycleDay} do ciclo${phase ? ` · ${phase.label}` : ""}${progress ? ` · gestação de ${progress.weeks} semanas` : ""}.`
    : "Registre a última menstruação para visualizar seu histórico e receber previsões.";

  return (
    <div className="space-y-7 pb-3">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-semibold tracking-[-0.01em] text-ink sm:text-[2.4rem]">
            Olá, {firstName}<span className="text-plum-600">.</span>
          </h1>
          <p className="mt-1.5 text-sm text-muted sm:text-base">
            Seu cuidado começa pelo que importa hoje.
          </p>
        </div>
        <div className="hidden rounded-full border border-line bg-white px-4 py-2 text-xs font-semibold text-muted shadow-sm sm:block">
          {dataFormatada}
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.65fr)_minmax(280px,0.9fr)]">
        <Link
          href="/painel/ciclo"
          className="group relative isolate flex min-h-[288px] flex-col overflow-hidden rounded-[var(--radius-card)] border border-white/70 p-6 shadow-[var(--shadow-card)] transition-all hover:-translate-y-0.5 hover:shadow-[var(--shadow-card-hover)] sm:p-8"
          style={{
            background: `linear-gradient(125deg, ${gradiente[0]} 0%, ${gradiente[1]} 55%, ${gradiente[2]} 100%)`,
          }}
        >
          <div aria-hidden className="pointer-events-none absolute -right-12 -top-16 h-64 w-64 rounded-full border-[38px] border-white/25" />
          <BrandMark
            className="pointer-events-none absolute -bottom-12 right-2 h-52 w-52 rotate-[-14deg] text-white/25 sm:right-9"
            centerColor="transparent"
          />
          <span className="relative z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white/75">
            <Icon name="cycle" className="h-4 w-4" style={{ color: acento }} />
          </span>
          <div className="relative z-10 mt-auto max-w-[30rem] pt-8">
            <h2 className="font-display text-[1.85rem] font-semibold leading-[1.13] tracking-[-0.01em] text-ink sm:text-[2.15rem]">
              {destaqueTitulo}
            </h2>
            <p className="mt-3 max-w-[28rem] text-sm leading-relaxed text-ink/75 sm:text-[15px]">
              {destaqueDescricao}
            </p>
            <span className="mt-6 inline-flex items-center gap-2 rounded-full bg-white px-4 py-2.5 text-xs font-bold text-ink shadow-sm transition-transform group-hover:translate-x-1">
              Ver meu ciclo <Icon name="arrow" className="h-4 w-4" />
            </span>
          </div>
        </Link>

        <div className="flex min-h-[288px] flex-col rounded-[var(--radius-card)] border border-line/80 bg-white p-6 shadow-[var(--shadow-card)] sm:p-7">
          <div className="flex items-start justify-between gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-[var(--radius-control)] bg-plum-50 text-plum-700">
              <Icon name="reminder" className="h-5 w-5" />
            </div>
            <span className="rounded-full bg-mist px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-muted">
              Próximo cuidado
            </span>
          </div>
          <div className="mt-auto pt-7">
            <p className="text-xs font-bold uppercase tracking-[0.12em] text-plum-700">
              {proximo ? formatDate(proximo.dueDate) : "No seu tempo"}
            </p>
            <h2 className="mt-2 font-display text-xl font-bold leading-snug text-ink sm:text-2xl">
              {proximo ? proximo.title : "Organize seus lembretes"}
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-muted">
              {proximo
                ? "Deixe esse compromisso por perto e acompanhe seus próximos passos."
                : "Consultas, exames e cuidados importantes em um só lugar."}
            </p>
            <Link
              href="/painel/lembretes"
              className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-plum-700 hover:text-plum-800"
            >
              Ver lembretes <Icon name="arrow" className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>

      <section aria-labelledby="explorar-title">
        <div className="mb-3 flex items-end justify-between gap-4">
          <div>
            <h2 id="explorar-title" className="font-display text-xl font-bold text-ink sm:text-2xl">
              Cuidado em todas as dimensões
            </h2>
          </div>
          <p className="hidden text-xs text-muted sm:block">Escolha por onde quer começar</p>
        </div>
        <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
          <AreaCard
            href="/painel/bem-estar"
            icon="wellbeing"
            title="Bem-estar"
            description="Escute seu corpo e suas emoções."
            bg="var(--color-sage-50)"
            color="var(--color-sage-600)"
          />
          <AreaCard
            href="/painel/apoio"
            icon="shield"
            title={PROTECAO.label}
            description="Informação e apoio quando precisar."
            bg={PROTECAO.corSuave}
            color={PROTECAO.corTexto}
          />
          <AreaCard
            href="/painel/comunidade"
            icon="diary"
            title={COMUNIDADE.label}
            description={
              relatosNovos > 0
                ? `${relatosNovos} relato${relatosNovos > 1 ? "s" : ""} nesta semana`
                : "Histórias e encontros perto de você."
            }
            bg={COMUNIDADE.corSuave}
            color={COMUNIDADE.corTexto}
          />
          <AreaCard
            href="/painel/assistente"
            icon="guide"
            title={IA.label}
            description="Uma conversa para orientar seus passos."
            bg={IA.corSuave}
            color={IA.corTexto}
          />
        </div>
      </section>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.35fr)_minmax(280px,1fr)]">
        <section className="rounded-[var(--radius-card)] border border-line/80 bg-white p-6 shadow-[var(--shadow-card)]" aria-labelledby="insights-title">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-plum-50 text-plum-700">
              <Icon name="spark" className="h-4 w-4" />
            </span>
            <h2 id="insights-title" className="font-display text-lg font-bold text-ink">
              Para você agora
            </h2>
          </div>
          {insights.length > 0 ? (
            <ul className="mt-5 divide-y divide-line/70">
              {insights.map((ins, i) => (
                <li key={i} className="flex gap-3 py-3 first:pt-0 last:pb-0">
                  <Icon name={ins.icon} className="mt-0.5 h-4 w-4 shrink-0 text-plum-700" />
                  <span className="text-sm leading-relaxed text-ink/85">{ins.text}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-4 text-sm leading-relaxed text-muted">
              Seus registros vão ajudar a organizar orientações úteis para você.
            </p>
          )}
        </section>

        <section
          className="flex flex-col rounded-[var(--radius-card)] border border-line/80 p-6"
          style={{ background: COMUNIDADE.corSuave }}
          aria-labelledby="cidade-title"
        >
          <div className="flex items-center gap-3">
            <span
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-white"
              style={{ color: COMUNIDADE.corTexto }}
            >
              <Icon name="calendar" className="h-4 w-4" />
            </span>
            <h2 id="cidade-title" className="font-display text-lg font-bold text-ink">
              Na sua cidade
            </h2>
          </div>
          <p
            className="mt-5 text-[11px] font-bold uppercase tracking-[0.12em]"
            style={{ color: COMUNIDADE.corTexto }}
          >
            {acaoDestaque
              ? SITUACAO_LABEL[situacaoDaAcao(acaoDestaque)]
              : "Canaã dos Carajás"}
          </p>
          <h3 className="mt-2 font-display text-lg font-bold text-ink">
            {acaoDestaque ? acaoDestaque.title : "Descubra o que acontece perto de você"}
          </h3>
          <p className="mt-2 text-sm leading-relaxed text-muted">
            Ações, serviços e informação de cuidado no território.
          </p>
          <Link
            href="/painel/cidade"
            className="mt-auto inline-flex items-center gap-2 pt-6 text-sm font-bold hover:underline"
            style={{ color: COMUNIDADE.corTexto }}
          >
            Ver ações locais <Icon name="arrow" className="h-4 w-4" />
          </Link>
        </section>
      </div>

      <Link
        href="/painel/assistente"
        className="group flex items-center gap-3 rounded-[var(--radius-card)] border border-plum-100 bg-plum-50/60 px-5 py-4 text-sm text-plum-900 transition-colors hover:bg-plum-50"
      >
        <Icon name="guide" className="h-5 w-5 shrink-0 text-plum-700" />
        <span className="min-w-0 flex-1">
          <span className="block text-xs font-semibold text-plum-700">Uma dúvida comum</span>
          <span className="line-clamp-2 block">“{perguntaDoDia(diaDoAno(hoje))}”</span>
        </span>
        <Icon name="arrow" className="h-4 w-4 shrink-0 transition-transform group-hover:translate-x-1" />
      </Link>
    </div>
  );
}

function AreaCard({
  href,
  icon,
  title,
  description,
  bg,
  color,
}: {
  href: string;
  icon: IconName;
  title: string;
  description: string;
  bg: string;
  color: string;
}) {
  return (
    <Link
      href={href}
      className="group flex min-h-[150px] flex-col rounded-[var(--radius-card)] border border-line/70 bg-white p-4 shadow-[var(--shadow-card)] transition-all hover:-translate-y-0.5 hover:shadow-[var(--shadow-card-hover)] sm:p-5"
    >
      <span className="flex h-10 w-10 items-center justify-center rounded-[var(--radius-control)]" style={{ background: bg, color }}>
        <Icon name={icon} className="h-5 w-5" />
      </span>
      <div className="mt-auto pt-4">
        <div className="flex items-center justify-between gap-2">
          <h3 className="font-display text-[15px] font-bold text-ink">{title}</h3>
          <Icon name="arrow" className="h-4 w-4 text-muted/70 transition-transform group-hover:translate-x-1" />
        </div>
        <p className="mt-1 text-xs leading-relaxed text-muted">{description}</p>
      </div>
    </Link>
  );
}
