import { cn } from "@/lib/utils";

// Ilustrações SVG autorais — composições orgânicas e editoriais que dão
// personalidade sem depender de imagens externas. Usam os tokens do tema.

const PETAL = "M12 12 C 10.1 8 10.1 4.2 12 1.5 C 13.9 4.2 13.9 8 12 12 Z";
const ANGLES = [0, 72, 144, 216, 288];

/** Broto/flor reutilizável em coordenadas 24×24, posicionável via transform. */
function Bloom({
  x,
  y,
  size,
  petal,
  center,
  opacity = 1,
}: {
  x: number;
  y: number;
  size: number;
  petal: string;
  center: string;
  opacity?: number;
}) {
  const s = size / 24;
  return (
    <g
      transform={`translate(${x} ${y}) scale(${s}) translate(-12 -12)`}
      opacity={opacity}
    >
      <g fill={petal}>
        {ANGLES.map((a, i) => (
          <path key={a} d={PETAL} transform={`rotate(${a} 12 12)`} opacity={i % 2 ? 0.85 : 1} />
        ))}
      </g>
      <circle cx="12" cy="12" r="2.15" fill={center} />
    </g>
  );
}

/** Composição principal da landing — lua, arcos, broto e sementes. */
export function HeroArt({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 420 420"
      fill="none"
      className={cn("h-full w-full", className)}
      aria-hidden="true"
    >
      {/* disco/lua */}
      <circle cx="250" cy="150" r="120" fill="var(--color-plum-100)" />
      <circle
        cx="250"
        cy="150"
        r="120"
        stroke="var(--color-plum-200)"
        strokeWidth="1.5"
      />
      {/* arco terracota (sorriso/crescente) */}
      <path
        d="M70 250 A150 150 0 0 0 360 250"
        stroke="var(--color-clay-400)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeDasharray="2 12"
      />
      {/* haste sálvia */}
      <path
        d="M120 380 C 150 300 130 220 190 170"
        stroke="var(--color-sage-500)"
        strokeWidth="2"
        strokeLinecap="round"
        opacity="0.7"
      />
      {/* anel */}
      <circle
        cx="330"
        cy="300"
        r="46"
        stroke="var(--color-clay-300)"
        strokeWidth="1.5"
      />
      {/* blocos orgânicos suaves */}
      <path
        d="M60 120 C 60 80 100 70 130 90 C 160 110 150 160 110 165 C 75 170 60 155 60 120 Z"
        fill="var(--color-clay-100)"
      />
      {/* brotos */}
      <Bloom x={190} y={175} size={150} petal="var(--color-plum-600)" center="var(--color-clay-500)" />
      <Bloom x={330} y={300} size={54} petal="var(--color-clay-500)" center="var(--color-plum-50)" />
      <Bloom x={95} y={135} size={40} petal="var(--color-plum-500)" center="var(--color-clay-200)" opacity={0.9} />
      {/* sementes */}
      <circle cx="300" cy="90" r="5" fill="var(--color-clay-400)" />
      <circle cx="150" cy="330" r="4" fill="var(--color-plum-300)" />
      <circle cx="370" cy="200" r="3.5" fill="var(--color-plum-400)" />
    </svg>
  );
}

/** Composição para o painel de autenticação (fundo ameixa escuro). */
export function AuthArt({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 340 300"
      fill="none"
      className={cn("h-auto w-full", className)}
      aria-hidden="true"
    >
      <circle cx="240" cy="120" r="110" fill="var(--color-plum-600)" opacity="0.5" />
      <path
        d="M20 200 A140 140 0 0 1 300 200"
        stroke="var(--color-clay-400)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeDasharray="2 14"
      />
      <circle cx="90" cy="90" r="40" stroke="var(--color-plum-300)" strokeWidth="1.5" opacity="0.6" />
      <Bloom x={230} y={130} size={130} petal="var(--color-plum-200)" center="var(--color-clay-400)" />
      <Bloom x={95} y={95} size={46} petal="var(--color-clay-300)" center="var(--color-plum-100)" />
      <circle cx="300" cy="60" r="4.5" fill="var(--color-clay-300)" />
      <circle cx="150" cy="230" r="4" fill="var(--color-plum-200)" opacity="0.7" />
    </svg>
  );
}

/** Estado vazio padrão — ilustração + mensagem centralizadas. */
export function EmptyState({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-3 py-10 text-center">
      <EmptyBloom className="h-24 w-24 text-plum-200" />
      <p className="max-w-xs text-sm text-muted">{children}</p>
    </div>
  );
}

/** Ilustração de linha para estados vazios. */
export function EmptyBloom({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 120 120"
      fill="none"
      className={cn("h-24 w-24", className)}
      aria-hidden="true"
    >
      <g
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.6"
      >
        {/* vaso */}
        <path d="M40 88 L44 108 H76 L80 88 Z" />
        <path d="M36 88 H84" />
        {/* hastes */}
        <path d="M60 88 V56" />
        <path d="M60 70 C 48 66 44 56 46 48 C 56 48 62 56 60 70" />
        <path d="M60 62 C 72 58 76 48 74 40 C 64 40 58 48 60 62" />
      </g>
      {/* broto no topo */}
      <g transform="translate(60 34) scale(1.4) translate(-12 -12)">
        <g fill="currentColor" opacity="0.85">
          {ANGLES.map((a) => (
            <path key={a} d={PETAL} transform={`rotate(${a} 12 12)`} />
          ))}
        </g>
        <circle cx="12" cy="12" r="2.15" fill="var(--color-clay-500)" />
      </g>
    </svg>
  );
}
