"use client";

import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="grid min-h-screen place-items-center p-6 text-center">
      <div className="max-w-sm">
        <span className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-plum-50 text-plum-700">
          <Icon name="close" className="h-5 w-5" />
        </span>
        <h1 className="mt-5 text-3xl text-ink">Algo deu errado</h1>
        <p className="mt-3 text-muted">
          Ocorreu um erro inesperado. Tente novamente.
        </p>
        <Button className="mt-7" onClick={reset}>
          Tentar novamente
        </Button>
      </div>
    </div>
  );
}
