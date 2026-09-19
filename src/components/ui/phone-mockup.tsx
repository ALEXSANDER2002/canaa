import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/utils";

// Mockup de iPhone (puro CSS/SVG) da página inicial. Ele mostra os pilares
// do produto, em vez de vender o app como se fosse apenas um calendário.

export function PhoneMockup({ className }: { className?: string }) {
  return (
    <div className={cn("relative mx-auto w-[300px] select-none", className)}>
      {/* halo de fundo */}
      <div className="absolute -inset-8 -z-10 rounded-[4.5rem] bg-plum-50/70 blur-md" />

      {/* botões laterais */}
      <div className="absolute -left-[2px] top-[110px] h-7 w-[3px] rounded-l bg-neutral-500" />
      <div className="absolute -left-[2px] top-[160px] h-12 w-[3px] rounded-l bg-neutral-500" />
      <div className="absolute -left-[2px] top-[220px] h-12 w-[3px] rounded-l bg-neutral-500" />
      <div className="absolute -right-[2px] top-[180px] h-16 w-[3px] rounded-r bg-neutral-500" />

      {/* moldura de titânio — iPhone 17: rim polido + bezel fino e simétrico */}
      <div className="rounded-[3.5rem] bg-gradient-to-b from-neutral-300 via-neutral-500 to-neutral-800 p-[2.5px] shadow-[0_40px_80px_-22px_rgba(33,28,26,0.5)]">
        <div className="rounded-[3.4rem] bg-black p-[7px] ring-1 ring-white/10">
          <div className="relative overflow-hidden rounded-[2.95rem] bg-white ring-1 ring-black/50">
            {/* Dynamic Island */}
            <div className="absolute left-1/2 top-2.5 z-20 flex h-[26px] w-[88px] -translate-x-1/2 items-center justify-end gap-1.5 rounded-full bg-black pr-2.5">
              <span className="h-1.5 w-1.5 rounded-full bg-neutral-500" />
            </div>

            <div className="px-5 pb-7 pt-3">
              {/* barra de status */}
              <div className="flex h-7 items-center justify-between text-[12px] font-semibold text-ink">
                <span className="tabular-nums">9:41</span>
                <span className="flex items-center gap-1.5">
                  <span className="flex items-end gap-[2px]">
                    <span className="h-1 w-[3px] rounded-sm bg-ink" />
                    <span className="h-1.5 w-[3px] rounded-sm bg-ink" />
                    <span className="h-2 w-[3px] rounded-sm bg-ink" />
                    <span className="h-2.5 w-[3px] rounded-sm bg-ink/30" />
                  </span>
                  <svg width="15" height="11" viewBox="0 0 15 11" className="text-ink">
                    <path
                      d="M7.5 2.2C9.4 2.2 11.1 3 12.3 4.2L7.5 9 2.7 4.2C3.9 3 5.6 2.2 7.5 2.2Z"
                      fill="currentColor"
                    />
                  </svg>
                  <span className="flex h-2.5 w-4 items-center rounded-[3px] border border-ink px-[1px]">
                    <span className="block h-[7px] w-full rounded-[1px] bg-ink" />
                  </span>
                </span>
              </div>

              {/* cabeçalho */}
              <div className="mt-4 flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-medium text-muted">Bom dia, Marina</p>
                  <p className="font-display text-lg font-semibold text-ink">Seu cuidado</p>
                </div>
                <span className="grid h-8 w-8 place-items-center rounded-full bg-clay-100 text-clay-600">
                  <Icon name="spark" className="h-4 w-4" />
                </span>
              </div>

              {/* destaque de saúde */}
              <div className="mt-4 flex items-center justify-between rounded-2xl bg-gradient-to-br from-plum-50 to-clay-50 px-3.5 py-3.5">
                <div>
                  <p className="font-display text-[15px] font-semibold text-ink">
                    Seu próximo passo está aqui
                  </p>
                  <p className="mt-0.5 text-[9px] text-muted">Ciclo, exames e bem-estar</p>
                </div>
                <span className="grid h-8 w-8 place-items-center rounded-full bg-plum-700 text-white">
                  <Icon name="cycle" className="h-4 w-4" />
                </span>
              </div>

              {/* caminhos do dia */}
              <div className="mt-4 grid grid-cols-2 gap-2">
                {[
                  ["Bem-estar", "Como você está?", "wellbeing", "bg-sage-50 text-sage-600"],
                  ["Assistente", "Posso ajudar", "guide", "bg-clay-50 text-clay-600"],
                  ["Proteção", "Rede de apoio", "shield", "bg-[#eef0f7] text-[#333f6d]"],
                  ["Comunidade", "Você não está só", "diary", "bg-[#f8efe7] text-[#96511f]"],
                ].map(([title, detail, icon, color]) => (
                  <div key={title} className="rounded-xl border border-line/80 bg-white px-2.5 py-2">
                    <span className={cn("grid h-5 w-5 place-items-center rounded-lg", color)}>
                      <Icon name={icon as Parameters<typeof Icon>[0]["name"]} className="h-3 w-3" />
                    </span>
                    <p className="mt-1.5 text-[10px] font-bold text-ink">{title}</p>
                    <p className="text-[8px] text-muted">{detail}</p>
                  </div>
                ))}
              </div>

              <div className="mt-3 flex items-center gap-2 rounded-xl bg-mist px-3 py-2.5">
                <span className="grid h-6 w-6 place-items-center rounded-full bg-white text-plum-700 shadow-sm">
                  <Icon name="reminder" className="h-3.5 w-3.5" />
                </span>
                <p className="flex-1 text-[9px] font-medium text-ink">Lembrete: cuide de você hoje</p>
                <Icon name="arrow" className="h-3 w-3 text-muted" />
              </div>

              {/* navegação inferior */}
              <div className="mt-4 flex items-center justify-between px-1 text-[8px] text-muted">
                {[
                  ["home", "Início"], ["cycle", "Saúde"], ["diary", "Comunidade"], ["guide", "Ajuda"],
                ].map(([icon, label], index) => (
                  <span key={label} className={cn("flex flex-col items-center gap-0.5", index === 0 && "font-bold text-plum-700")}>
                    <Icon name={icon as Parameters<typeof Icon>[0]["name"]} className="h-3.5 w-3.5" />
                    {label}
                  </span>
                ))}
                </div>

              {/* barra inferior (home indicator) */}
              <div className="mx-auto mt-4 h-1 w-28 rounded-full bg-ink/15" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
