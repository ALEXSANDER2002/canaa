import type { Metadata } from "next";

import { requireUser } from "@/lib/session";
import { db } from "@/lib/db";
import { clearMemoriesAction } from "@/server/actions/chat";
import { formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";

export const metadata: Metadata = { title: "O que a assistente sabe" };

export default async function MemoriaPage() {
  const user = await requireUser();
  const memories = await db.chatMemory.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <div className="mb-4 border-b border-line pb-3">
        <p className="font-semibold text-ink">O que a assistente aprendeu</p>
        <p className="mt-1 text-sm text-muted">
          Fatos guardados das suas conversas, usados para personalizar as
          respostas. Você pode apagar tudo quando quiser.
        </p>
      </div>

      {memories.length === 0 ? (
        <p className="py-8 text-center text-sm text-muted">
          A assistente ainda não guardou nada sobre você.
        </p>
      ) : (
        <>
          <ul className="space-y-2">
            {memories.map((m) => (
              <li
                key={m.id}
                className="flex items-start gap-3 rounded-xl border border-line bg-mist px-4 py-3"
              >
                <Icon
                  name="spark"
                  className="mt-0.5 h-4 w-4 shrink-0 text-clay-500"
                />
                <div>
                  <p className="text-sm text-ink">{m.fact}</p>
                  <p className="mt-0.5 text-xs text-muted">
                    {formatDate(m.createdAt)}
                  </p>
                </div>
              </li>
            ))}
          </ul>

          <form
            action={clearMemoriesAction}
            className="mt-6 border-t border-line pt-4"
          >
            <Button variant="danger" size="sm">
              Apagar tudo o que ela aprendeu
            </Button>
          </form>
        </>
      )}
    </div>
  );
}
