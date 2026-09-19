import * as React from "react";
import { cn } from "@/lib/utils";

type Tone = "plum" | "clay" | "sage" | "neutral" | "warning";

const toneClasses: Record<Tone, string> = {
  plum: "bg-plum-100 text-plum-800",
  clay: "bg-clay-100 text-clay-700",
  sage: "bg-sage-100 text-sage-600",
  neutral: "bg-plum-50 text-muted",
  warning: "bg-amber-100 text-amber-700",
};

export function Badge({
  tone = "plum",
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & { tone?: Tone }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border border-current/10 px-2.5 py-0.5 text-xs font-medium",
        toneClasses[tone],
        className,
      )}
      {...props}
    />
  );
}
