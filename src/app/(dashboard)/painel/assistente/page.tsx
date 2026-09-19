import type { Metadata } from "next";

import { requireUser } from "@/lib/session";
import { createConversationAction } from "@/server/actions/chat";
import { Button } from "@/components/ui/button";
import { EmptyBloom } from "@/components/ui/illustrations";

export const metadata: Metadata = { title: "Assistente" };

export default async function AssistentePage() {
  await requireUser();

  return (
    <div className="flex flex-col items-center py-14 text-center">
      <EmptyBloom className="h-24 w-24 text-plum-200" />
      <h2 className="mt-4 text-xl text-ink">Vamos conversar?</h2>
      <p className="mt-2 max-w-sm text-sm text-muted">
        Tire dúvidas sobre ciclo, gestação, bem-estar e prevenção. A assistente
        conhece seus registros e vai te conhecendo melhor a cada conversa.
      </p>
      <form action={createConversationAction} className="mt-6">
        <Button size="lg">Começar uma conversa</Button>
      </form>
    </div>
  );
}
