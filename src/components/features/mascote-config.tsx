"use client";

import { useEffect, useState } from "react";

import { cn } from "@/lib/utils";
import {
  definirDesligado,
  EVENTO_MASCOTE,
  lerEstado,
} from "@/lib/mascote-storage";

/**
 * Liga e desliga o mascote.
 *
 * A escolha vale para ESTE aparelho: fica no armazenamento do navegador, não
 * no banco. É de propósito — a preferência não vira um dado a mais sobre ela,
 * e quem usa o mesmo celular e o computador decide separadamente. Vale também
 * para o mascote das telas públicas, antes do login.
 */
export function MascoteSwitch() {
  // `null` até ler o armazenamento: evita piscar "ligado" e depois "desligado".
  const [ligado, setLigado] = useState<boolean | null>(null);

  useEffect(() => {
    const ler = () => setLigado(!lerEstado().desligado);
    ler();
    window.addEventListener(EVENTO_MASCOTE, ler);
    window.addEventListener("storage", ler);
    return () => {
      window.removeEventListener(EVENTO_MASCOTE, ler);
      window.removeEventListener("storage", ler);
    };
  }, []);

  return (
    <div className="flex items-center justify-between gap-4">
      <div>
        <p id="mascote-rotulo" className="text-sm font-medium text-ink">
          Mostrar o mascote no canto da tela
        </p>
        <p className="text-sm text-muted">
          Vale só para este aparelho.
        </p>
      </div>

      <button
        type="button"
        role="switch"
        aria-checked={ligado === true}
        aria-labelledby="mascote-rotulo"
        disabled={ligado === null}
        onClick={() => definirDesligado(ligado === true)}
        className={cn(
          "relative inline-flex h-7 w-12 shrink-0 items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-plum-400 focus-visible:ring-offset-2 disabled:opacity-50",
          ligado ? "bg-plum-700" : "bg-line",
        )}
      >
        <span
          aria-hidden
          className={cn(
            "inline-block h-5 w-5 rounded-full bg-white shadow transition-transform",
            ligado ? "translate-x-6" : "translate-x-1",
          )}
        />
      </button>
    </div>
  );
}
