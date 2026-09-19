import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Icon, type IconName } from "@/components/ui/icon";
import { EmptyBloom } from "@/components/ui/illustrations";

/** Tela de recurso planejado (ainda não disponível), com o que virá. */
export function ComingSoon({
  icon,
  title,
  description,
  bullets,
}: {
  icon: IconName;
  title: string;
  description: string;
  bullets: string[];
}) {
  return (
    <Card className="mx-auto max-w-2xl text-center">
      <div className="flex flex-col items-center">
        <EmptyBloom className="h-24 w-24 text-plum-200" />
        <Badge tone="clay" className="mt-2">
          Em breve
        </Badge>
        <h1 className="mt-3 flex items-center gap-2 font-display text-2xl text-ink">
          <Icon name={icon} className="h-6 w-6 text-plum-700" />
          {title}
        </h1>
        <p className="mt-2 max-w-md text-muted">{description}</p>

        <ul className="mt-6 w-full max-w-sm space-y-2 text-left">
          {bullets.map((b) => (
            <li key={b} className="flex items-start gap-2.5 text-sm text-ink">
              <Icon
                name="check"
                className="mt-0.5 h-4 w-4 shrink-0 text-plum-500"
                strokeWidth={2.5}
              />
              {b}
            </li>
          ))}
        </ul>
      </div>
    </Card>
  );
}
