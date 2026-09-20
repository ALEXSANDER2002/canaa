import { db } from "@/lib/db";
import {
  getCycles,
  getDailyLogs,
  getMoods,
  getPregnancy,
} from "@/server/queries";
import { milestoneForWeek } from "@/lib/pregnancy-milestones";
import {
  currentStreak,
  daysBetween,
  predictCycle,
  pregnancyProgress,
  startOfDay,
} from "@core/cycle";
import { PERGUNTAS_SUGERIDAS } from "@core/content";
import {
  cidadeParaVisitante,
  dicasParaHoje,
  diaDoAnoDe,
  mensagensDaCidade,
  mensagensParaVisitante,
  semAssuntosIntimos,
  type MascoteMensagem,
} from "@core/mascote";

/** Marcos de sequência de check-in que merecem comemoração. */
const LIMIARES_SEQUENCIA = [30, 14, 7, 3];

/** Só o que a Prefeitura já publica em `/api/v1/cidade/acoes`. */
function acoesDaCidade() {
  return db.cityAction.findMany({
    where: { active: true },
    orderBy: [{ pinned: "desc" }, { startsAt: "asc" }],
    take: 8,
    select: {
      id: true,
      title: true,
      summary: true,
      location: true,
      startsAt: true,
      endsAt: true,
      pinned: true,
    },
  });
}

/**
 * Tudo o que o mascote PODE dizer hoje.
 *
 * `userId === null` é um visitante, sem conta: recebe só o que já é público —
 * as campanhas da Prefeitura (a API delas é aberta de propósito), dicas gerais
 * e um convite. Nenhuma consulta pessoal roda para ele.
 *
 * Quem decide o que aparece, e quando, é o navegador (`escolherMensagem`, com
 * o limite diário e o intervalo). Aqui só se reúne o material — e três regras
 * valem para todo texto montado:
 *
 * - **Nada do pilar Proteção.** Nem consulta, nem mensagem. O tipo
 *   `PilarMascote` já não aceita.
 * - **Lembrete sem título.** O que ela escreveu num lembrete ("consulta com a
 *   psicóloga") não sobe para um balão que aparece sozinho, em qualquer tela,
 *   diante de quem estiver olhando. O balão diz que há um lembrete; o título
 *   fica na tela de lembretes.
 * - **Nada de janela fértil, atraso ou chance de gravidez.** É o dado que mais
 *   pesa nas mãos erradas — e nesta cidade as pessoas se reconhecem. As
 *   perguntas da assistente passam por `semAssuntosIntimos` pelo mesmo motivo.
 *
 * Falha silenciosa: o mascote é um extra. Se uma consulta cair, a página
 * segue sem ele.
 */
export async function montarMensagensMascote(
  userId: string | null,
): Promise<MascoteMensagem[]> {
  try {
    const hoje = new Date();
    const dia = diaDoAnoDe(hoje);

    /* ── Visitante: só o que é público ── */
    if (userId === null) {
      const acoes = await acoesDaCidade();
      return [...cidadeParaVisitante(acoes, hoje), ...mensagensParaVisitante(dia)];
    }

    const inicioHoje = startOfDay(hoje);

    const [
      acoes,
      lembretes,
      lembretesDeExame,
      cycles,
      pregnancy,
      dailyLogs,
      moods,
    ] = await Promise.all([
      acoesDaCidade(),
      db.reminder.findMany({
        where: { userId, done: false },
        orderBy: { dueDate: "asc" },
        take: 20,
        select: { id: true, dueDate: true },
      }),
      db.reminder.count({ where: { userId, type: "exame" } }),
      getCycles(userId),
      getPregnancy(userId),
      getDailyLogs(userId, 60),
      getMoods(userId, 1),
    ]);

    const mensagens: MascoteMensagem[] = [];

    /* ── Da cidade: campanhas que a Prefeitura publicou em /admin ── */
    mensagens.push(...mensagensDaCidade(acoes, hoje));

    /* ── Lembretes: só avisa que existe, nunca o título ── */
    const proximos = lembretes.filter((l) => {
      const faltam = daysBetween(hoje, l.dueDate);
      return faltam >= 0 && faltam <= 3;
    });
    const atrasados = lembretes.filter(
      (l) => daysBetween(hoje, l.dueDate) < 0,
    );

    if (proximos.length > 0) {
      const primeiro = proximos[0];
      const faltam = daysBetween(hoje, primeiro.dueDate);

      mensagens.push({
        id: `lembrete:${primeiro.id}:${faltam === 0 ? "hoje" : "breve"}`,
        pilar: "saude",
        rotulo: "Lembrete",
        texto:
          faltam === 0
            ? "Você tem um lembrete para hoje."
            : faltam === 1
              ? "Você tem um lembrete para amanhã."
              : `Você tem um lembrete daqui a ${faltam} dias.`,
        cta: { rotulo: "Ver lembretes", href: "/painel/lembretes" },
        prioridade: faltam === 0 ? 100 : 92,
        repetirEmHoras: 8,
        evitarEm: ["/painel/lembretes"],
        emocao: "atenta",
      });
    }

    if (atrasados.length > 0) {
      mensagens.push({
        id: `lembrete:atrasados:${atrasados.length}`,
        pilar: "saude",
        rotulo: "Lembrete",
        texto: "Alguns lembretes passaram do prazo. Quer atualizar a lista?",
        cta: { rotulo: "Ver lembretes", href: "/painel/lembretes" },
        prioridade: 70,
        repetirEmHoras: 72,
        evitarEm: ["/painel/lembretes"],
        emocao: "atenta",
      });
    }

    /* ── Exames: o desfecho que o app quer mover ── */
    if (lembretesDeExame === 0) {
      mensagens.push({
        id: "app:exames",
        pilar: "saude",
        rotulo: "Prevenção",
        texto:
          "Que tal conferir quais exames de rotina valem para a sua idade? De lá dá para criar o lembrete direto.",
        cta: { rotulo: "Ver exames", href: "/painel/exames" },
        prioridade: 40,
        repetirEmHoras: 24 * 14,
        evitarEm: ["/painel/exames", "/painel/lembretes"],
        emocao: "feliz",
      });
    }

    /* ── Registro do dia e sequência (a parte "Duolingo") ── */
    const logouHoje = dailyLogs.some((l) => l.date >= inicioHoje);
    const registrouHoje =
      logouHoje || moods.some((m) => m.date >= inicioHoje);
    const sequencia = currentStreak(dailyLogs.map((l) => l.date));

    if (!registrouHoje) {
      mensagens.push({
        id: "registro:dia",
        pilar: "saude",
        rotulo: "Seu dia",
        texto:
          sequencia >= 2
            ? `Você já registrou ${sequencia} dias seguidos. Que tal registrar hoje também?`
            : "Como você está hoje? Registrar leva só um minutinho.",
        cta: { rotulo: "Fazer registro", href: "/painel/diario" },
        prioridade: 50,
        repetirEmHoras: 20,
        evitarEm: ["/painel/diario", "/painel/bem-estar"],
        emocao: "feliz",
      });
    }

    const limiar = LIMIARES_SEQUENCIA.find((n) => sequencia >= n);
    if (logouHoje && limiar) {
      mensagens.push({
        id: `conquista:sequencia:${limiar}`,
        pilar: "saude",
        rotulo: "Conquista",
        titulo: `${sequencia} dias seguidos!`,
        texto:
          "Você vem cuidando de si com constância. Isso também ajuda o app a entender melhor o seu ciclo.",
        cta: { rotulo: "Ver metas", href: "/painel/metas" },
        prioridade: 80,
        repetirEmHoras: 24 * 10,
        evitarEm: ["/painel/metas"],
        emocao: "comemorando",
      });
    }

    /* ── Ciclo: só a menstruação chegando, nada além disso ── */
    const previsao = predictCycle(cycles.map((c) => c.startDate));
    if (previsao) {
      const faltam = daysBetween(hoje, previsao.nextPeriodDate);
      if (faltam >= 0 && faltam <= 2) {
        mensagens.push({
          id: `ciclo:proxima:${previsao.nextPeriodDate.toISOString().slice(0, 10)}`,
          pilar: "saude",
          rotulo: "Seu ciclo",
          texto:
            faltam === 0
              ? "Sua menstruação é prevista para hoje. Se já começou, registre no ciclo."
              : "Sua menstruação deve chegar em breve. Quando começar, registre para a previsão ficar mais certeira.",
          cta: { rotulo: "Abrir ciclo", href: "/painel/ciclo" },
          prioridade: 75,
          repetirEmHoras: 20,
          evitarEm: ["/painel/ciclo"],
          emocao: "feliz",
        });
      }
    }

    /* ── Gestação: um marco por semana ──
       Se preferir que a gestação nunca apareça fora da tela dela, apague
       este bloco. */
    if (pregnancy?.active) {
      const p = pregnancyProgress(pregnancy.lastPeriodDate, hoje);
      mensagens.push({
        id: `gestacao:semana:${p.weeks}`,
        pilar: "saude",
        rotulo: "Gestação",
        titulo: `Semana ${p.weeks}`,
        texto: milestoneForWeek(p.weeks),
        cta: { rotulo: "Ver gestação", href: "/painel/gestacao" },
        prioridade: 65,
        repetirEmHoras: 24 * 6,
        evitarEm: ["/painel/gestacao"],
        emocao: "feliz",
      });
    }

    /* ── Assistente: uma pergunta por dia, da mesma lista do hub ── */
    const perguntas = semAssuntosIntimos(PERGUNTAS_SUGERIDAS);
    if (perguntas.length > 0) {
      mensagens.push({
        id: `assistente:pergunta:${dia}`,
        pilar: "ia",
        rotulo: "Assistente",
        texto: `Que tal perguntar: “${perguntas[dia % perguntas.length]}”`,
        cta: { rotulo: "Perguntar", href: "/painel/assistente" },
        prioridade: 30,
        repetirEmHoras: 20,
        evitarEm: ["/painel/assistente"],
        emocao: "feliz",
      });
    }

    /* ── Dicas de saúde curadas ── */
    mensagens.push(...dicasParaHoje(dia));

    return mensagens;
  } catch {
    // Sem `console.error(erro)`: o objeto pode carregar dado da usuária.
    console.error("[mascote] não foi possível montar as mensagens");
    return [];
  }
}
