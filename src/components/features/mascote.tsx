"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  chaveDaMensagem,
  escolherMensagem,
  MASCOTE_INTERVALO_MIN,
  MASCOTE_LIMITE_POR_DIA,
  type EmocaoMascote,
  type MascoteMensagem,
} from "@core/mascote";
import { pilar } from "@core/pilares";
import { pilarDaRota } from "@/components/layout/nav-items";
import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/utils";
import {
  definirDesligado,
  diaLocal,
  EVENTO_MASCOTE,
  lerEstado,
  salvarEstado,
  type EstadoMascote,
} from "@/lib/mascote-storage";
import styles from "./mascote.module.css";

/** Espera depois de abrir a página antes de aparecer: deixa ela ler primeiro. */
const ATRASO_INICIAL_MS = 2500;
const SAIDA_MS = 380;

/**
 * Telas em que o mascote não aparece.
 *
 * - Proteção: nunca. Um balão com movimento numa tela que precisa passar
 *   despercebida trairia quem está ali (ver `PilarMascote`).
 * - Assistente: o campo de digitar fica no rodapé, onde ele pousaria.
 * - Relatório: é uma folha para imprimir e levar à consulta.
 */
const PILARES_SEM_MASCOTE = ["protecao", "ia"];
const ROTAS_SEM_MASCOTE = ["/painel/relatorio"];

/**
 * Mascote no canto da tela — chega, fala e vai embora.
 *
 * A decisão do que mostrar é local: nenhuma chamada de rede, nenhum registro.
 * Ver `packages/core/mascote.ts` e `src/lib/mascote-storage.ts`.
 */
export function Mascote({
  userId,
  mensagens,
}: {
  userId: string;
  mensagens: MascoteMensagem[];
}) {
  const pathname = usePathname();
  const estado = useRef<EstadoMascote | null>(null);
  const timerSaida = useRef<number | undefined>(undefined);

  const [pronto, setPronto] = useState(false);
  const [desligado, setDesligado] = useState(false);
  const [atual, setAtual] = useState<MascoteMensagem | null>(null);
  const [saindo, setSaindo] = useState(false);
  const [pausado, setPausado] = useState(false);

  const pilarDaTela = pilarDaRota(pathname);
  const rotaOculta =
    (pilarDaTela !== null && PILARES_SEM_MASCOTE.includes(pilarDaTela)) ||
    ROTAS_SEM_MASCOTE.some((r) => pathname === r || pathname.startsWith(`${r}/`));

  const digitados = useDigitacao(atual?.texto ?? "", atual !== null);

  /* ── 1. Lê o estado guardado neste aparelho ─────────────────────────── */
  useEffect(() => {
    const ler = () => {
      const lido = lerEstado(userId);
      estado.current = lido;
      setDesligado(lido.desligado);
      setPronto(true);
    };

    ler();
    window.addEventListener(EVENTO_MASCOTE, ler);
    window.addEventListener("storage", ler);
    return () => {
      window.removeEventListener(EVENTO_MASCOTE, ler);
      window.removeEventListener("storage", ler);
    };
  }, [userId]);

  useEffect(() => () => window.clearTimeout(timerSaida.current), []);

  /* ── 2. Mostrar / fechar ────────────────────────────────────────────── */
  const mostrar = useCallback(
    (msg: MascoteMensagem, contaNoLimite: boolean) => {
      const est = estado.current;
      if (!est) return;

      const agora = Date.now();
      est.vistas[chaveDaMensagem(msg.id)] = agora;
      if (contaNoLimite) {
        est.hoje += 1;
        est.ultima = agora;
      }
      salvarEstado(userId, est);

      window.clearTimeout(timerSaida.current);
      setSaindo(false);
      setPausado(false);
      setAtual(msg);
    },
    [userId],
  );

  const fechar = useCallback(() => {
    setSaindo(true);
    window.clearTimeout(timerSaida.current);
    timerSaida.current = window.setTimeout(() => {
      setAtual(null);
      setSaindo(false);
      setPausado(false);
    }, SAIDA_MS);
  }, []);

  /* ── 3. Agenda a próxima aparição ───────────────────────────────────── */
  useEffect(() => {
    if (!pronto || desligado || rotaOculta || atual) return;

    const timer = window.setTimeout(() => {
      const est = estado.current;
      if (!est) return;

      const agora = Date.now();
      const dia = diaLocal(agora);
      if (est.dia !== dia) {
        est.dia = dia;
        est.hoje = 0;
      }

      if (est.hoje >= MASCOTE_LIMITE_POR_DIA) return;
      if (agora - est.ultima < MASCOTE_INTERVALO_MIN * 60_000) return;

      const msg = escolherMensagem(mensagens, {
        rota: pathname,
        vistas: est.vistas,
        agora,
      });
      if (msg) mostrar(msg, true);
    }, ATRASO_INICIAL_MS);

    return () => window.clearTimeout(timer);
  }, [pronto, desligado, rotaOculta, atual, pathname, mensagens, mostrar]);

  /* ── 4. Some sozinho, a menos que ela esteja lendo ──────────────────── */
  useEffect(() => {
    if (!atual || pausado || saindo) return;

    const tamanho = atual.texto.length + (atual.titulo?.length ?? 0);
    const espera = Math.min(16_000, 6_000 + tamanho * 45);
    const timer = window.setTimeout(fechar, espera);
    return () => window.clearTimeout(timer);
  }, [atual, pausado, saindo, fechar]);

  /* ── 5. Trocou para uma tela onde ele não pode aparecer ────────────── */
  useEffect(() => {
    if (rotaOculta) {
      window.clearTimeout(timerSaida.current);
      setAtual(null);
      setSaindo(false);
    }
  }, [rotaOculta]);

  /* ── "Outra dica" ───────────────────────────────────────────────────── */
  const haOutra = useMemo(() => {
    if (!atual || !estado.current) return false;
    return (
      escolherMensagem(mensagens, {
        rota: pathname,
        vistas: estado.current.vistas,
        ignorarIds: [atual.id],
      }) !== null
    );
  }, [atual, mensagens, pathname]);

  const proxima = () => {
    const est = estado.current;
    if (!est || !atual) return;

    const msg = escolherMensagem(mensagens, {
      rota: pathname,
      vistas: est.vistas,
      ignorarIds: [atual.id],
    });
    // Pedido dela: não conta no limite diário.
    if (msg) mostrar(msg, false);
    else fechar();
  };

  const desligar = () => {
    definirDesligado(userId, true);
    setAtual(null);
    setSaindo(false);
  };

  if (!pronto || desligado || rotaOculta || !atual) return null;

  const dados = pilar(atual.pilar);
  const emocao: EmocaoMascote = atual.emocao ?? "feliz";
  const falando = digitados > 0 && digitados < atual.texto.length && !saindo;

  return (
    <aside
      aria-label="Mensagem da mascote"
      className={cn(
        "no-print pointer-events-none fixed right-3 z-30 flex flex-col items-end sm:right-5 lg:bottom-6 lg:right-6",
        // Acima da barra inferior do celular (e da área segura do iPhone).
        "bottom-[calc(5.25rem+env(safe-area-inset-bottom))]",
        saindo && styles.saida,
      )}
      onMouseEnter={() => setPausado(true)}
      onMouseLeave={() => setPausado(false)}
      onFocus={() => setPausado(true)}
      onBlur={() => setPausado(false)}
      onKeyDown={(e) => {
        if (e.key === "Escape") fechar();
      }}
    >
      {/* `key` reinicia as animações quando ela pede "Outra dica". */}
      <div key={atual.id} className="flex flex-col items-end">
        <div
          className={cn(
            styles.balao,
            "pointer-events-auto relative mb-2.5 w-[min(19.5rem,calc(100vw-1.5rem))] rounded-[var(--radius-card)] border border-line bg-surface p-4 pr-3 shadow-[var(--shadow-card-hover)]",
          )}
        >
          <div className="flex items-start justify-between gap-2">
            <span
              className="inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide"
              style={{ backgroundColor: dados.corSuave, color: dados.corTexto }}
            >
              {atual.rotulo}
            </span>
            <button
              type="button"
              onClick={fechar}
              aria-label="Dispensar mensagem"
              className="-mr-1 -mt-1 flex h-8 w-8 items-center justify-center rounded-full text-muted transition-colors hover:bg-mist hover:text-ink"
            >
              <Icon name="close" className="h-4 w-4" />
            </button>
          </div>

          {atual.titulo && (
            <p className="font-display mt-2.5 text-base font-semibold leading-snug text-ink">
              {atual.titulo}
            </p>
          )}

          {/* Leitor de tela recebe o texto inteiro, sem esperar a digitação. */}
          <p className="sr-only">{atual.texto}</p>

          {/* O texto completo, invisível, reserva a altura final: o balão não
              cresce enquanto as letras aparecem. */}
          <p className="relative mt-1.5 pr-2 text-sm leading-relaxed text-ink/90">
            <span className="invisible">{atual.texto}</span>
            <span
              aria-hidden
              className={cn("absolute inset-0", falando && styles.cursor)}
            >
              {atual.texto.slice(0, digitados)}
            </span>
          </p>

          <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2 pr-1">
            {atual.cta && (
              <Link
                href={atual.cta.href}
                onClick={fechar}
                className="inline-flex h-9 items-center gap-1.5 rounded-full bg-plum-700 px-3.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-plum-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-plum-400 focus-visible:ring-offset-2"
              >
                {atual.cta.rotulo}
                <Icon name="arrow" className="h-3.5 w-3.5" />
              </Link>
            )}
            {haOutra && (
              <button
                type="button"
                onClick={proxima}
                className="text-sm font-semibold text-plum-700 hover:underline"
              >
                Outra dica
              </button>
            )}
            <button
              type="button"
              onClick={desligar}
              className="ml-auto text-[11px] text-muted underline-offset-2 hover:underline"
            >
              Parar de mostrar
            </button>
          </div>

          {/* Rabinho apontando para o mascote. */}
          <span
            aria-hidden
            className="absolute -bottom-1.5 right-[30px] h-3 w-3 rotate-45 border-b border-r border-line bg-surface lg:right-[38px]"
          />
        </div>

        <div
          aria-hidden
          className={cn(
            styles.mascote,
            "pointer-events-none h-[72px] w-[72px] lg:h-[88px] lg:w-[88px]",
          )}
        >
          <Flor emocao={emocao} falando={falando} />
        </div>
      </div>
    </aside>
  );
}

/* ══════════════ digitação ══════════════ */

/**
 * Quantos caracteres do texto já apareceram.
 *
 * Com "reduzir movimento" ligado no sistema o texto sai inteiro de uma vez —
 * digitar letra a letra é movimento, e a preferência vale para ele também.
 */
function useDigitacao(texto: string, ativo: boolean): number {
  const [n, setN] = useState(0);

  useEffect(() => {
    if (!ativo) {
      setN(0);
      return;
    }
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setN(texto.length);
      return;
    }

    setN(0);
    let i = 0;
    let intervalo: number | undefined;

    // Espera o balão terminar de entrar.
    const inicio = window.setTimeout(() => {
      intervalo = window.setInterval(() => {
        i += 1;
        setN(i);
        if (i >= texto.length) window.clearInterval(intervalo);
      }, 24);
    }, 550);

    return () => {
      window.clearTimeout(inicio);
      window.clearInterval(intervalo);
    };
  }, [texto, ativo]);

  return n;
}

/* ══════════════ o desenho ══════════════ */

/**
 * A flor.
 *
 * Oito pétalas em coral, um rosto, uma folha que acena — a mesma construção
 * radial do Selo botânico e da marca, só que com olhos. Cores são as do
 * design system (plum-500 #ff5773, plum-400 #ff8098, sage, ink), escritas em
 * hex porque SVG inline não enxerga as variáveis do Tailwind com segurança.
 * Se a marca mudar de cor, mude aqui também.
 */
function Flor({
  emocao,
  falando,
}: {
  emocao: EmocaoMascote;
  falando: boolean;
}) {
  const comemorando = emocao === "comemorando";
  const atenta = emocao === "atenta";

  const olhos = comemorando ? (
    <g fill="none" stroke="#262322" strokeWidth="2.4" strokeLinecap="round">
      <path d="M40 41.5 Q43.5 36.5 47 41.5" />
      <path d="M53 41.5 Q56.5 36.5 60 41.5" />
    </g>
  ) : (
    <g className={styles.olhos}>
      <ellipse cx="43.5" cy="40.5" rx={atenta ? 3 : 2.5} ry={atenta ? 4.3 : 3.4} fill="#262322" />
      <ellipse cx="56.5" cy="40.5" rx={atenta ? 3 : 2.5} ry={atenta ? 4.3 : 3.4} fill="#262322" />
      <circle cx="44.3" cy="39.1" r="0.95" fill="#fff" />
      <circle cx="57.3" cy="39.1" r="0.95" fill="#fff" />
    </g>
  );

  const sobrancelhas = atenta ? (
    <g fill="none" stroke="#262322" strokeWidth="1.6" strokeLinecap="round">
      <path d="M39.5 33.5 Q43.5 31 47 33.5" />
      <path d="M53 33.5 Q56.5 31 60.5 33.5" />
    </g>
  ) : null;

  const boca =
    falando || comemorando ? (
      <g className={falando ? styles.boca : undefined}>
        <path d="M41.5 46 Q50 60 58.5 46 Z" fill="#8a122f" />
        <path d="M45.5 52.5 Q50 49.8 54.5 52.5 Q50 56.6 45.5 52.5Z" fill="#ff8098" />
      </g>
    ) : atenta ? (
      <ellipse cx="50" cy="50.5" rx="2.4" ry="3" fill="#262322" />
    ) : (
      <path
        d="M42.5 47.5 Q50 54 57.5 47.5"
        fill="none"
        stroke="#262322"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
    );

  return (
    <svg
      viewBox="0 0 100 100"
      className="h-full w-full overflow-visible"
      role="presentation"
      focusable="false"
    >
      <ellipse className={styles.sombra} cx="50" cy="96.5" rx="20" ry="3" fill="#262322" opacity="0.12" />

      <g className={cn(styles.corpo, comemorando && styles.pulo)}>
        {/* caule e folhas */}
        <path d="M50 74 V94" fill="none" stroke="#566b45" strokeWidth="4" strokeLinecap="round" />
        <path d="M50 88 C40 88 33 84 31 77 C39 77 46 80 50 88Z" fill="#6b7f57" />
        <g className={styles.folhaDir}>
          <path d="M50 88 C60 88 67 84 69 77 C61 77 54 80 50 88Z" fill="#566b45" />
        </g>

        {/* pétalas */}
        <g className={styles.petalas}>
          {Array.from({ length: 8 }, (_, i) => (
            <ellipse
              key={i}
              cx="50"
              cy="18"
              rx="8.5"
              ry="14"
              transform={`rotate(${i * 45} 50 42)`}
              fill={i % 2 === 0 ? "#ff5773" : "#ff8098"}
            />
          ))}
        </g>

        {/* rosto */}
        <circle cx="50" cy="42" r="19" fill="#fff6ec" />
        <circle cx="37.5" cy="47.5" r="3" fill="#ff5773" opacity="0.35" />
        <circle cx="62.5" cy="47.5" r="3" fill="#ff5773" opacity="0.35" />
        {sobrancelhas}
        {olhos}
        {boca}
      </g>

      {comemorando && (
        <g fill="#f5b83d">
          {[
            [13, 20, 0],
            [88, 16, 0.3],
            [9, 58, 0.55],
            [92, 56, 0.15],
          ].map(([x, y, atraso], i) => (
            <g key={i} transform={`translate(${x} ${y})`}>
              <path
                className={styles.brilho}
                style={{ animationDelay: `${atraso}s` }}
                d="M0 -6 L1.6 -1.6 L6 0 L1.6 1.6 L0 6 L-1.6 1.6 L-6 0 L-1.6 -1.6Z"
              />
            </g>
          ))}
        </g>
      )}
    </svg>
  );
}
