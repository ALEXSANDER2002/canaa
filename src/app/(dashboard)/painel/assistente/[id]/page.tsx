import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { requireUser } from "@/lib/session";
import { db } from "@/lib/db";
import { deleteConversationAction } from "@/server/actions/chat";
import { ChatWindow } from "@/components/features/chat-window";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";

export const metadata: Metadata = { title: "Conversa" };

export default async function ConversaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireUser();
  const { id } = await params;

  const conversation = await db.conversation.findFirst({
    where: { id, userId: user.id },
    select: {
      id: true,
      title: true,
      messages: {
        orderBy: { createdAt: "asc" },
        select: { id: true, role: true, content: true },
      },
    },
  });

  if (!conversation) notFound();

  return (
    <div className="flex min-w-0 flex-col">
      <div className="mb-3 flex items-start justify-between gap-3 border-b border-line pb-3">
        <p className="min-w-0 truncate font-semibold text-ink">
          {conversation.title}
        </p>
        <form
          action={deleteConversationAction}
          className="shrink-0"
        >
          <input type="hidden" name="id" value={conversation.id} />
          <Button
            variant="ghost"
            size="sm"
            className="gap-1.5 text-plum-700"
            aria-label="Apagar conversa"
          >
            <Icon name="trash" className="h-4 w-4" />
            Apagar
          </Button>
        </form>
      </div>

      <ChatWindow
        conversationId={conversation.id}
        initialMessages={conversation.messages}
      />
    </div>
  );
}
