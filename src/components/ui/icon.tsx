import * as React from "react";
import { cn } from "@/lib/utils";

// Conjunto de ícones de linha (stroke, 24×24, currentColor). Substituem os
// emojis para dar consistência e um tom editorial/profissional.

export type IconName =
  | "home"
  | "cycle"
  | "pregnancy"
  | "wellbeing"
  | "reminder"
  | "arrow"
  | "check"
  | "trash"
  | "close"
  | "calendar"
  | "guide"
  | "shield"
  | "spark"
  | "book"
  | "settings"
  | "diary"
  | "pin";

const paths: Record<IconName, React.ReactNode> = {
  home: (
    <>
      <path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8" />
      <path d="M3 10a2 2 0 0 1 .7-1.5l7-6a2 2 0 0 1 2.6 0l7 6A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    </>
  ),
  // Ciclo — setas em círculo
  cycle: (
    <>
      <path d="M3 12a9 9 0 0 1 9-9 9.7 9.7 0 0 1 6.7 2.7L21 8" />
      <path d="M21 3v5h-5" />
      <path d="M21 12a9 9 0 0 1-9 9 9.7 9.7 0 0 1-6.7-2.7L3 16" />
      <path d="M3 21v-5h5" />
    </>
  ),
  // Gestação — broto/nova vida
  pregnancy: (
    <>
      <path d="M7 20h10" />
      <path d="M10 20c5.5-2.5.8-6.4 3-10" />
      <path d="M9.5 9.4c1.1.8 1.8 2.2 2.3 3.7-2 .4-3.5.4-4.8-.3-1.2-.6-2.3-1.9-3-4.2 2.8-.5 4.4 0 5.5.8z" />
      <path d="M14.1 6a7 7 0 0 0-1.1 4c1.9-.1 3.3-.6 4.3-1.4 1-1 1.6-2.3 1.7-4.6-2.7.1-4 1-4.9 2z" />
    </>
  ),
  wellbeing: (
    <path d="M19 14c1.5-1.5 3-3.2 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.8 0-3 .5-4.5 2-1.5-1.5-2.7-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4 3 5.5l7 7z" />
  ),
  reminder: (
    <>
      <path d="M10.3 21a2 2 0 0 0 3.4 0" />
      <path d="M3.3 15.3A1 1 0 0 0 4 17h16a1 1 0 0 0 .7-1.7C19.4 14 18 12.5 18 8A6 6 0 0 0 6 8c0 4.5-1.4 6-2.7 7.3" />
    </>
  ),
  arrow: <path d="M5 12h14M13 6l6 6-6 6" />,
  check: <path d="M20 6 9 17l-5-5" />,
  trash: (
    <>
      <path d="M3 6h18" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
      <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
      <path d="M10 11v6M14 11v6" />
    </>
  ),
  close: <path d="M18 6 6 18M6 6l12 12" />,
  calendar: (
    <>
      <path d="M8 2v4M16 2v4" />
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <path d="M3 10h18" />
    </>
  ),
  // Pino de mapa — usado só para localização de unidade de saúde.
  pin: (
    <>
      <path d="M12 21c4-4.2 7-7.9 7-11.5A7 7 0 0 0 5 9.5C5 13.1 8 16.8 12 21Z" />
      <circle cx="12" cy="9.5" r="2.3" />
    </>
  ),
  // Orientação inteligente — bússola (evita o clichê de "sparkles" de IA)
  guide: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="m15.5 8.5-2 5-5 2 2-5z" />
    </>
  ),
  // Privacidade — escudo com confirmação
  shield: (
    <>
      <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
      <path d="m9 12 2 2 4-4" />
    </>
  ),
  /*
   * Destaque — a pétala da própria marca, não a estrelinha de IA.
   *
   * Isto era um asterisco de oito raios retos: exatamente o ✨ que todo
   * produto de IA usa para dizer "mágica". Ele estava, entre outros lugares,
   * no cabeçalho da Assistente — o pior lugar possível para o clichê.
   * A flor de quatro pétalas é o desenho do símbolo da marca reduzido, então
   * o ícone de "destaque" passa a ser reconhecidamente deste produto.
   */
  spark: (
    <>
      <path d="M12 4c1.6 1.9 2.4 3.4 2.4 5S13.6 12.1 12 14c-1.6-1.9-2.4-3.4-2.4-5S10.4 5.9 12 4Z" />
      <path d="M12 20c-1.6-1.9-2.4-3.4-2.4-5s.8-3.1 2.4-5c1.6 1.9 2.4 3.4 2.4 5s-.8 3.1-2.4 5Z" />
      <path d="M4 12c1.9-1.6 3.4-2.4 5-2.4s3.1.8 5 2.4c-1.9 1.6-3.4 2.4-5 2.4S5.9 13.6 4 12Z" />
      <path d="M20 12c-1.9 1.6-3.4 2.4-5 2.4s-3.1-.8-5-2.4c1.9-1.6 3.4-2.4 5-2.4s3.1.8 5 2.4Z" />
    </>
  ),
  book: (
    <>
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
    </>
  ),
  settings: (
    <>
      <path d="M4 7h9M17 7h3M4 17h3M11 17h9" />
      <circle cx="15" cy="7" r="2.2" />
      <circle cx="9" cy="17" r="2.2" />
    </>
  ),
  /*
   * Diário — caderno com fita de marcação.
   *
   * Antes era um calendário com outro enquadramento: mesmos dois traços no
   * topo, mesmo retângulo arredondado, mesmas linhas dentro. Lado a lado na
   * barra de navegação, a 20px, ninguém distinguia "Diário" de "Lembretes".
   * Agora a silhueta é outra: lombada à esquerda e fita descendo do topo.
   */
  diary: (
    <>
      <path d="M6 3h13a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z" />
      <path d="M8 3v18" />
      <path d="M15 3v7l-2.2-1.6L10.6 10V3" />
    </>
  ),
};

export function Icon({
  name,
  className,
  strokeWidth = 1.6,
  style,
}: {
  name: IconName;
  className?: string;
  strokeWidth?: number;
  /** Para a cor do pilar, que é token de dado e não classe do Tailwind. */
  style?: React.CSSProperties;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("h-5 w-5", className)}
      style={style}
      aria-hidden="true"
    >
      {paths[name]}
    </svg>
  );
}

// Pétala usada para compor a marca (broto/flor). Aponta para cima a partir
// do centro (12,12); é rotacionada 5× para formar a corola.
const PETAL = "M12 12 C 10.1 8 10.1 4.2 12 1.5 C 13.9 4.2 13.9 8 12 12 Z";
const PETAL_ANGLES = [0, 72, 144, 216, 288];

/**
 * Marca da aplicação — um broto/flor de cinco pétalas com miolo terracota.
 * A cor das pétalas vem de `currentColor`; o miolo aceita `centerColor`.
 */
export function BrandMark({
  className,
  centerColor = "var(--color-clay-500)",
}: {
  className?: string;
  centerColor?: string;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className={cn("h-6 w-6", className)}
      aria-hidden="true"
    >
      <g fill="currentColor">
        {PETAL_ANGLES.map((a, i) => (
          <path
            key={a}
            d={PETAL}
            transform={`rotate(${a} 12 12)`}
            opacity={i % 2 === 0 ? 1 : 0.82}
          />
        ))}
      </g>
      <circle cx="12" cy="12" r="2.15" fill={centerColor} />
    </svg>
  );
}
