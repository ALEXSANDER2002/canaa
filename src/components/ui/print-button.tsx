"use client";

import { Button } from "./button";
import { Icon } from "./icon";

export function PrintButton() {
  return (
    <Button
      variant="outline"
      size="sm"
      className="no-print gap-2"
      onClick={() => window.print()}
    >
      <Icon name="book" className="h-4 w-4" />
      Imprimir / salvar PDF
    </Button>
  );
}
