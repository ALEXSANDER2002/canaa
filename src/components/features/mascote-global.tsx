"use client";

import dynamic from "next/dynamic";

/**
 * Carrega o mascote sob demanda.
 *
 * `ssr: false` e import dinâmico: o mascote só é baixado depois que a página
 * hidratou, em um pedaço de JavaScript à parte. Ele fica no layout raiz e,
 * portanto, em TODA página — inclusive a landing, que é a mais visitada e a que
 * mais importa manter leve. Sem isto, o desenho, o CSS e as dicas iriam no
 * pacote principal de todas as telas.
 *
 * (`ssr: false` só é permitido dentro de um Client Component — por isso este
 * arquivo existe, em vez de o layout raiz importar o mascote direto.)
 */
const Mascote = dynamic(
  () => import("./mascote").then((m) => m.Mascote),
  { ssr: false },
);

export function MascoteGlobal() {
  return <Mascote />;
}
