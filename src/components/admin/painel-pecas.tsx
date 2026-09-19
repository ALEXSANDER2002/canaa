import Link from "next/link";

import { Card } from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";

/**
 * Peças comuns aos painéis de perfil.
 *
 * Todo perfil abre por pendência e depois por número — a ordem é a mesma
 * porque a pergunta é a mesma ("o que precisa de mim agora?"), mesmo que a
 * resposta seja completamente diferente para a Prefeitura e para a moderadora.
 */

/** Aquilo que exige uma ação de quem está lendo. Sempre leva a algum lugar. */
export function Pendencia({
  href,
  titulo,
  texto,
  tom,
}: {
  href: string;
  titulo: string;
  texto: string;
  tom: "alerta" | "neutro";
}) {
  const alerta = tom === "alerta";
  return (
    <Link
      href={href}
      className={
        alerta
          ? "block rounded-[var(--radius-card)] border border-danger-200 bg-danger-50 p-5 transition-colors hover:bg-danger-100/60"
          : "block rounded-[var(--radius-card)] border border-line bg-surface p-5 transition-colors hover:bg-mist"
      }
    >
      <div className="flex items-start gap-3">
        <Icon
          name={alerta ? "shield" : "reminder"}
          className={alerta ? "mt-0.5 h-5 w-5 shrink-0 text-danger-700" : "mt-0.5 h-5 w-5 shrink-0 text-plum-700"}
        />
        <div>
          <p className={alerta ? "font-semibold text-danger-800" : "font-semibold text-ink"}>
            {titulo}
          </p>
          <p className={alerta ? "mt-1 text-sm leading-relaxed text-danger-700" : "mt-1 text-sm leading-relaxed text-muted"}>
            {texto}
          </p>
        </div>
      </div>
    </Link>
  );
}

/**
 * Número grande com o que ele significa embaixo.
 *
 * `valor` aceita `null` de propósito: é o que `agregado()` devolve quando a
 * contagem fica abaixo do corte. O componente mostra "—" e a nota explica
 * por quê, em vez de esconder a linha — sumir daria a entender que o
 * indicador não existe.
 */
export function Numero({
  valor,
  rotulo,
  nota,
}: {
  valor: number | null;
  rotulo: string;
  nota?: string;
}) {
  return (
    <Card>
      <p className="num font-display text-4xl font-semibold text-ink">
        {valor === null ? "—" : valor.toLocaleString("pt-BR")}
      </p>
      <p className="mt-1.5 font-semibold text-ink">{rotulo}</p>
      {nota && <p className="mt-1 text-sm leading-relaxed text-muted">{nota}</p>}
    </Card>
  );
}

/** Bloco de conteúdo com título e explicação do que se está olhando. */
export function Secao({
  titulo,
  descricao,
  children,
}: {
  titulo: string;
  descricao?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-[var(--radius-card)] border border-line bg-surface p-6 shadow-[var(--shadow-card)]">
      <h2 className="font-display text-lg font-semibold text-ink">{titulo}</h2>
      {descricao && (
        <p className="mt-1 max-w-2xl text-sm leading-relaxed text-muted">{descricao}</p>
      )}
      <div className="mt-5">{children}</div>
    </section>
  );
}
