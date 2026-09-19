import Link from "next/link";

import { requireUser } from "@/lib/session";
import { db } from "@/lib/db";
import { isOpenAIConfigured } from "@/lib/openai";
import { createConversationAction } from "@/server/actions/chat";
import { formatDate } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Icon } from "@/components/ui/icon";
import { ConversationLink } from "@/components/features/conversation-link";

export default async function AssistenteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireUser();

  const [conversations, memoryCount] = await Promise.all([
    db.conversation.findMany({
      where: { userId: user.id },
      orderBy: { updatedAt: "desc" },
      take: 40,
      select: { id: true, title: true, updatedAt: true },
    }),
    db.chatMemory.count({ where: { userId: user.id } }),
  ]);

  const configured = isOpenAIConfigured();

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="flex items-center gap-2 text-2xl text-ink">
            <Icon name="guide" className="h-6 w-6 text-plum-700" />
            Assistente
          </h1>
          <p className="mt-1 text-muted">
            Converse sobre sua saúde. Cada conversa tem seu próprio contexto.
          </p>
        </div>
        <form action={createConversationAction}>
          <Button className="gap-2">
            <Icon name="spark" className="h-4 w-4" />
            Nova conversa
          </Button>
        </form>
      </div>

      {!configured && (
        <Card className="mb-6 border-amber-200 bg-amber-50">
          <div className="flex items-start gap-3">
            <Icon name="shield" className="mt-0.5 h-5 w-5 shrink-0 text-amber-700" />
            <div>
              <p className="font-semibold text-amber-900">
                Chave da OpenAI não configurada
              </p>
              <p className="mt-1 text-sm text-amber-800">
                Adicione <code className="rounded bg-amber-100 px-1">OPENAI_API_KEY</code>{" "}
                ao arquivo <code className="rounded bg-amber-100 px-1">.env</code> e
                reinicie o servidor para ativar o chat.
              </p>
            </div>
          </div>
        </Card>
      )}

      <div className="grid gap-6 lg:grid-cols-[16rem_1fr]">
        {/* Lista de conversas */}
        <aside className="space-y-2">
          {memoryCount > 0 && (
            <Link href="/painel/assistente/memoria">
              <Badge tone="clay" className="mb-1">
                {memoryCount} lembrança(s) sobre você
              </Badge>
            </Link>
          )}

          {conversations.length === 0 ? (
            <p className="text-sm text-muted">
              Nenhuma conversa ainda. Comece uma nova.
            </p>
          ) : (
            <ul className="space-y-1">
              {conversations.map((c) => (
                <li key={c.id}>
                  <ConversationLink
                    id={c.id}
                    title={c.title}
                    subtitle={formatDate(c.updatedAt)}
                  />
                </li>
              ))}
            </ul>
          )}
        </aside>

        {/* Conversa aberta */}
        <Card className="min-w-0">{children}</Card>
      </div>
    </div>
  );
}
