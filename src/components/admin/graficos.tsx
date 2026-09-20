import { CORTE_AGREGADO } from "@core/papeis";

/**
 * Gráficos do painel administrativo.
 *
 * SVG e CSS à mão, sem biblioteca. Não é economia de bytes por esporte: são
 * barras categóricas simples, e uma biblioteca de gráficos custaria mais do
 * que a página inteira pesa hoje — a tela de unidades já carrega meio mega de
 * Mapbox, e esta aqui é consultada de um computador da Secretaria numa rede
 * que não é boa.
 *
 * Três regras que valem para todo gráfico daqui:
 *
 * 1. **A escala é uma só e está rotulada.** Barra sem eixo é decoração.
 * 2. **Cor nunca é o único código.** Todo valor aparece escrito ao lado.
 * 3. **O corte de agregação vale dentro do gráfico.** Uma barra de "3" num
 *    recorte por bairro não é estatística: é um endereço. Ver `agregado()`
 *    em `packages/core/papeis.ts` — aqui a barra vira hachura e o número
 *    vira "—", em vez de sumir do gráfico e dar a impressão de zero.
 */

/**
 * A grade de uma linha: rótulo · pista · valor.
 *
 * O rótulo tem teto (`minmax(0, …)`) e a pista tem piso (`minmax(2.5rem, 1fr)`)
 * porque é a pista que carrega a informação. Se algo tem de ser espremido numa
 * janela apertada, que seja o texto — ele trunca com reticências e continua no
 * `title`; a barra, espremida, simplesmente desaparece.
 */
const GRADE =
  "grid grid-cols-[minmax(0,6.5rem)_minmax(2.5rem,1fr)_2.5rem] items-center gap-2" +
  " sm:grid-cols-[minmax(0,9.5rem)_minmax(4rem,1fr)_3.5rem] sm:gap-3";

export interface Fatia {
  rotulo: string;
  valor: number;
  /** Destaque: a fatia que exige ação (ex.: serviço sem nenhuma unidade). */
  alerta?: boolean;
}

/**
 * Barras horizontais — para categorias com nome longo (bairro, serviço).
 *
 * Horizontal porque "Consulta ginecológica" e "Novo Horizonte" não cabem
 * embaixo de uma barra vertical sem girar o rótulo, e rótulo girado é a
 * primeira coisa que ninguém lê.
 */
export function BarrasHorizontais({
  dados,
  unidade,
  cortar = false,
  vazio = "Nada para mostrar ainda.",
}: {
  dados: Fatia[];
  /** Palavra que acompanha o número: "unidades", "lembretes". */
  unidade: string;
  /** Aplica o corte de agregação — só para contagem de PESSOAS. */
  cortar?: boolean;
  vazio?: string;
}) {
  if (dados.length === 0) {
    return <p className="text-sm text-muted">{vazio}</p>;
  }

  // `pico` é o que realmente existe; `maximo` é só o divisor, que não pode ser
  // zero. Rotular o eixo com o divisor faria um gráfico todo zerado anunciar
  // uma escala "0 … 1" que nenhum dado alcança.
  const pico = Math.max(...dados.map((d) => d.valor));
  const maximo = Math.max(pico, 1);

  return (
    <ul className="space-y-2.5">
      {dados.map((d) => {
        const suprimido = cortar && d.valor > 0 && d.valor < CORTE_AGREGADO;
        const largura = Math.max((d.valor / maximo) * 100, d.valor > 0 ? 3 : 0);

        return (
          // A coluna do rótulo é elástica de propósito. Com largura fixa, numa
          // janela estreita ela consome a faixa inteira e a pista da barra
          // chega a 0px — o gráfico vira uma tabela de números sem avisar.
          <li key={d.rotulo} className={GRADE}>
            <span className="truncate text-sm text-ink" title={d.rotulo}>
              {d.rotulo}
            </span>

            <span className="h-2.5 overflow-hidden rounded-full bg-mist">
              <span
                className="block h-full rounded-full"
                style={{
                  width: `${largura}%`,
                  background: suprimido
                    ? // Hachura: a barra existe (não é zero), mas o valor não
                      // pode ser lido. Dizer isso é melhor do que omitir.
                      "repeating-linear-gradient(45deg, var(--color-line) 0 4px, var(--color-mist) 4px 8px)"
                    : d.alerta
                      ? "var(--color-danger-600)"
                      : "var(--color-plum-600)",
                }}
              />
            </span>

            <span
              className={
                suprimido
                  ? "text-right text-sm text-muted"
                  : d.alerta
                    ? "num text-right text-sm font-bold text-danger-700"
                    : "num text-right text-sm font-semibold text-ink"
              }
            >
              {suprimido ? "—" : d.valor}
            </span>
          </li>
        );
      })}

      <li className="mt-1 flex items-center justify-between border-t border-line pt-2 text-xs text-muted">
        <span>0</span>
        <span>{unidade}</span>
        <span className="num">{pico}</span>
      </li>
    </ul>
  );
}

/**
 * Série mensal — barras verticais.
 *
 * Meses sempre aparecem, mesmo com zero: um mês faltando na sequência faz a
 * pessoa ler a lacuna como "não houve dado", quando quase sempre significa
 * "não houve evento". São coisas diferentes para quem vai decidir orçamento.
 */
export function SerieMensal({
  dados,
  unidade,
  cortar = false,
}: {
  dados: Fatia[];
  unidade: string;
  cortar?: boolean;
}) {
  const pico = Math.max(...dados.map((d) => d.valor));
  const maximo = Math.max(pico, 1);
  const total = dados.reduce((soma, item) => soma + item.valor, 0);
  const media = dados.length ? Math.round(total / dados.length) : 0;
  const primeiro = dados[0]?.valor ?? 0;
  const ultimo = dados.at(-1)?.valor ?? 0;
  const variacao = primeiro > 0 ? Math.round(((ultimo - primeiro) / primeiro) * 100) : null;

  return (
    <div>
      <div className="mb-4 grid grid-cols-3 gap-2 border-b border-line pb-3">
        <ResumoSerie rotulo="Total" valor={total.toLocaleString("pt-BR")} />
        <ResumoSerie rotulo="Média/mês" valor={media.toLocaleString("pt-BR")} />
        <ResumoSerie
          rotulo="Variação"
          valor={variacao === null ? "—" : `${variacao > 0 ? "+" : ""}${variacao}%`}
          tom={variacao === null || variacao === 0 ? "neutro" : variacao > 0 ? "alta" : "baixa"}
        />
      </div>
      <div
        className="flex h-40 items-end gap-2 rounded-xl px-2 pt-3"
        style={{
          backgroundImage:
            "repeating-linear-gradient(to top, transparent 0, transparent calc(25% - 1px), var(--color-line) 25%)",
        }}
      >
        {dados.map((d) => {
          const suprimido = cortar && d.valor > 0 && d.valor < CORTE_AGREGADO;
          const altura = d.valor === 0 ? 2 : Math.max((d.valor / maximo) * 100, 6);

          return (
            <div
              key={d.rotulo}
              className="flex h-full flex-1 flex-col items-center justify-end gap-1.5"
              title={`${d.rotulo}: ${suprimido ? "valor protegido" : d.valor} ${unidade}`}
            >
              <span className="num text-[11px] font-bold text-ink">
                {d.valor === 0 ? "0" : suprimido ? "—" : d.valor}
              </span>
              <span
                className="w-full rounded-t-lg shadow-[inset_0_1px_0_rgba(255,255,255,.28)]"
                style={{
                  height: `${altura}%`,
                  background: suprimido
                    ? "repeating-linear-gradient(45deg, var(--color-line) 0 4px, var(--color-mist) 4px 8px)"
                    : d.valor === 0
                      ? "var(--color-line)"
                      : "linear-gradient(180deg, var(--color-plum-500), var(--color-plum-700))",
                }}
              />
              <span className="text-[10px] text-muted">{d.rotulo}</span>
            </div>
          );
        })}
      </div>
      <p className="mt-3 border-t border-line pt-2 text-xs text-muted">
        {unidade} · {pico === 0 ? "nenhum no período" : `pico de ${pico} no período`}
      </p>
    </div>
  );
}

function ResumoSerie({
  rotulo,
  valor,
  tom = "neutro",
}: {
  rotulo: string;
  valor: string;
  tom?: "neutro" | "alta" | "baixa";
}) {
  return (
    <div>
      <p className="text-[10px] font-semibold uppercase tracking-wide text-muted">{rotulo}</p>
      <p
        className={
          tom === "alta"
            ? "num mt-0.5 text-sm font-bold text-plum-700"
            : tom === "baixa"
              ? "num mt-0.5 text-sm font-bold text-emerald-700"
              : "num mt-0.5 text-sm font-bold text-ink"
        }
      >
        {valor}
      </p>
    </div>
  );
}
