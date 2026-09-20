import { cn } from "@/lib/utils";
import { BrandMark } from "@/components/ui/icon";

/** Marca da aplicação (símbolo + wordmark serifado). */
export function Logo({
  className,
  withText = true,
}: {
  className?: string;
  withText?: boolean;
}) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <BrandMark className="h-7 w-7 text-plum-700" />
      {withText && (
        <span className="font-display text-xl font-semibold tracking-[-0.01em] text-ink">
          Elas <span className="italic text-plum-700">IA</span>
        </span>
      )}
    </span>
  );
}
