import { db } from "@/lib/db";
import { corsPreflight, resolveApiUser } from "@/lib/api-auth";
import { ehAdministrativo } from "@core/papeis";
import { montarMensagensMascote } from "@/server/mascote";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * A resposta muda conforme quem pergunta (visitante, usuária, conta
 * institucional). Nada disso pode ser guardado em cache compartilhado — e
 * `private, no-store` garante que nem o navegador reaproveite.
 */
const SEM_CACHE = { "Cache-Control": "private, no-store" };

/**
 * GET /api/v1/mascote → o que o mascote pode dizer agora.
 *
 * Responde a QUALQUER pessoa, com ou sem conta:
 *
 * - **Sem credencial** (visitante): campanhas da Prefeitura, dicas gerais e um
 *   convite. Só o que já é público — as campanhas saem de
 *   `/api/v1/cidade/acoes`, aberta de propósito.
 * - **Com sessão** (cookie ou `Bearer` do app): o mesmo, mais os avisos
 *   pessoais (lembrete, registro do dia, ciclo…).
 * - **Conta administrativa**: nada. Conta institucional é usada por mais de
 *   uma pessoa, e o mascote não tem trabalho a fazer num painel de moderação.
 *
 * É uma rota separada, e não um dado no layout, de propósito: ler a sessão no
 * layout raiz tornaria a landing e o login dinâmicos — o site inteiro
 * perderia o cache estático para servir um balão.
 *
 * Sem registro de acesso: nenhuma linha daqui grava quem perguntou.
 */
export async function GET(req: Request) {
  const userId = await resolveApiUser(req);

  if (userId) {
    const registro = await db.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });

    // Sessão de conta que não existe mais, ou conta administrativa.
    if (!registro || ehAdministrativo(registro.role)) {
      return Response.json({ mensagens: [] }, { headers: SEM_CACHE });
    }
  }

  const mensagens = await montarMensagensMascote(userId);
  return Response.json({ mensagens }, { headers: SEM_CACHE });
}

export { corsPreflight as OPTIONS };
