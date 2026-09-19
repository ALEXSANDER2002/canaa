import { seloDe, apelidoDe } from "@core/community";
import { cn } from "@/lib/utils";

/**
 * Selo botânico — o rosto de quem escreve na comunidade.
 *
 * Nenhuma imagem é carregada e nenhum dado sai daqui: as pétalas são
 * desenhadas a partir do hash do id, o mesmo que já escolhia o apelido. Ver
 * `seloDe` em `packages/core/community.ts` para o porquê.
 *
 * O desenho é construído, não escolhido de um catálogo: número de pétalas,
 * giro e largura variam, mas a regra de construção é uma só — é isso que faz
 * cem selos diferentes lerem como o mesmo jardim em vez de cem adesivos.
 */
export function Selo({
  userId,
  size = 40,
  className,
}: {
  userId: string;
  size?: number;
  className?: string;
}) {
  const { petalas, giro, largura, cor } = seloDe(userId);

  /*
   * Pétala: duas curvas espelhadas saindo do centro, a mesma construção da
   * marca. `largura` abre ou fecha a barriga — folha estreita de capim ou
   * pétala de ipê.
   *
   * A barriga encolhe conforme o número de pétalas cresce. Sem isso, um selo
   * de oito pétalas gordas vira uma mancha escura: a tinta total tem que ficar
   * parecida entre um selo de cinco e um de oito, senão metade do jardim pesa
   * o dobro da outra.
   */
  const barriga = (1.9 + largura * 1.5) * (6 / petalas);
  const petala = `M12 12 C ${12 - barriga} 8, ${12 - barriga} 4.2, 12 1.8 C ${12 + barriga} 4.2, ${12 + barriga} 8, 12 12 Z`;

  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-full bg-mist",
        className,
      )}
      style={{ width: size, height: size }}
      aria-hidden
    >
      <svg viewBox="0 0 24 24" width={size * 0.64} height={size * 0.64}>
        <g fill={cor} transform={`rotate(${giro} 12 12)`}>
          {Array.from({ length: petalas }, (_, i) => (
            <path
              key={i}
              d={petala}
              transform={`rotate(${(360 / petalas) * i} 12 12)`}
              // Alternância leve de opacidade: dá volume sem precisar de
              // sombra, e mantém o selo legível a 20px.
              opacity={i % 2 === 0 ? 0.95 : 0.72}
            />
          ))}
        </g>
        {/* Miolo: primeiro um disco da cor do fundo, que corta o nó onde as
            pétalas se encontram, depois o ponto. É o mesmo truque da marca —
            sem ele o centro vira o ponto mais escuro do desenho. */}
        <circle cx="12" cy="12" r="2.4" fill="var(--color-mist)" />
        <circle cx="12" cy="12" r="1.5" fill={cor} opacity={0.6} />
      </svg>
    </span>
  );
}

/** Selo + apelido, o par que sempre anda junto na comunidade. */
export function Assinatura({
  userId,
  size = 36,
  sufixo,
}: {
  userId: string;
  size?: number;
  sufixo?: React.ReactNode;
}) {
  return (
    <span className="inline-flex items-center gap-2.5">
      <Selo userId={userId} size={size} />
      <span className="font-display font-semibold text-ink">
        {apelidoDe(userId)}
      </span>
      {sufixo}
    </span>
  );
}
