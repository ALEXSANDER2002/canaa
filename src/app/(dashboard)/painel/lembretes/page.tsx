import type { Metadata } from "next";

import { requireUser } from "@/lib/session";
import { getReminders } from "@/server/queries";
import {
  toggleReminderAction,
  deleteReminderAction,
} from "@/server/actions/reminders";
import { formatDate, daysBetween, cn } from "@/lib/utils";
import { REMINDER_TYPES } from "@/lib/constants";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Icon } from "@/components/ui/icon";
import { DeleteButton } from "@/components/ui/delete-button";
import { ReminderForm } from "@/components/features/reminder-form";
import { EmptyState } from "@/components/ui/illustrations";

export const metadata: Metadata = { title: "Lembretes" };

function typeLabel(value: string) {
  return REMINDER_TYPES.find((t) => t.value === value)?.label ?? value;
}

export default async function LembretesPage() {
  const user = await requireUser();
  const reminders = await getReminders(user.id);

  const pending = reminders.filter((r) => !r.done);
  const done = reminders.filter((r) => r.done);
  const today = new Date();

  return (
    <div>
      <PageHeader
        title="Lembretes de exames"
        description="Organize exames preventivos, consultas e medicações."
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
        <ReminderForm />

        <div className="space-y-6">
          <Card>
            <CardTitle>Pendentes ({pending.length})</CardTitle>
            {pending.length === 0 ? (
              <EmptyState>Tudo em dia — nenhum lembrete pendente.</EmptyState>
            ) : (
              <ul className="mt-4 space-y-3">
                {pending.map((r) => {
                  const daysLeft = daysBetween(today, r.dueDate);
                  const overdue = daysLeft < 0;
                  return (
                    <li
                      key={r.id}
                      className="flex items-start justify-between gap-3 rounded-xl border border-plum-100 p-3"
                    >
                      <div className="flex items-start gap-3">
                        <form action={toggleReminderAction}>
                          <input type="hidden" name="id" value={r.id} />
                          <button
                            type="submit"
                            aria-label="Marcar como concluído"
                            className="mt-0.5 h-5 w-5 rounded-[var(--radius-chip)] border-2 border-plum-300 transition-colors hover:bg-plum-100"
                          />
                        </form>
                        <div>
                          <p className="font-medium text-ink">{r.title}</p>
                          <div className="mt-1 flex flex-wrap items-center gap-2 text-xs">
                            <Badge tone="clay">{typeLabel(r.type)}</Badge>
                            <span
                              className={cn(
                                "text-muted",
                                overdue && "font-medium text-danger-600",
                              )}
                            >
                              {formatDate(r.dueDate)}
                              {overdue
                                ? " · atrasado"
                                : daysLeft === 0
                                  ? " · hoje"
                                  : ` · em ${daysLeft} dias`}
                            </span>
                          </div>
                          {r.notes && (
                            <p className="mt-1 text-xs text-muted">{r.notes}</p>
                          )}
                        </div>
                      </div>
                      <DeleteButton action={deleteReminderAction} id={r.id} />
                    </li>
                  );
                })}
              </ul>
            )}
          </Card>

          {done.length > 0 && (
            <Card>
              <CardTitle>Concluídos ({done.length})</CardTitle>
              <ul className="mt-4 space-y-2">
                {done.map((r) => (
                  <li
                    key={r.id}
                    className="flex items-center justify-between gap-3 py-1"
                  >
                    <div className="flex items-center gap-3">
                      <form action={toggleReminderAction}>
                        <input type="hidden" name="id" value={r.id} />
                        <button
                          type="submit"
                          aria-label="Reabrir"
                          className="grid h-5 w-5 place-items-center rounded-[var(--radius-chip)] bg-sage-500 text-white"
                        >
                          <Icon name="check" className="h-3.5 w-3.5" strokeWidth={2.5} />
                        </button>
                      </form>
                      <span className="text-sm text-muted line-through">
                        {r.title}
                      </span>
                    </div>
                    <DeleteButton action={deleteReminderAction} id={r.id} />
                  </li>
                ))}
              </ul>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
