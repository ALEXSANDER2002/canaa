import { db } from "@/lib/db";
import { resolveApiUser, unauthorized } from "@/lib/api-auth";
import { apelidoDe } from "@core/community";

export const runtime = "nodejs";

/** GET /api/v1/community/posts/:id — o relato com suas respostas. */
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const userId = await resolveApiUser(req);
  if (!userId) return unauthorized();

  const { id } = await params;

  const post = await db.communityPost.findFirst({
    where: { id, hidden: false },
    select: {
      id: true,
      userId: true,
      category: true,
      body: true,
      createdAt: true,
      replies: {
        where: { hidden: false },
        orderBy: { createdAt: "asc" },
        select: {
          id: true,
          userId: true,
          body: true,
          createdAt: true,
        },
      },
    },
  });

  if (!post) {
    return Response.json({ error: "Relato não encontrado." }, { status: 404 });
  }

  const { userId: autor, replies, ...resto } = post;

  return Response.json({
    post: {
      ...resto,
      apelido: apelidoDe(autor),
      meu: autor === userId,
      respostas: replies.length,
      replies: replies.map(({ userId: quem, ...r }) => ({
        ...r,
        apelido: apelidoDe(quem),
        meu: quem === userId,
        /** Marca a resposta de quem abriu o relato — dá contexto na leitura. */
        autoraDoRelato: quem === autor,
      })),
    },
  });
}

/**
 * DELETE /api/v1/community/posts/:id
 *
 * Só a autora apaga o próprio relato. O filtro por `userId` no `deleteMany`
 * é o que garante isso mesmo se alguém mandar um id de terceiro.
 */
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const userId = await resolveApiUser(req);
  if (!userId) return unauthorized();

  const { id } = await params;
  const { count } = await db.communityPost.deleteMany({ where: { id, userId } });

  if (count === 0) {
    return Response.json(
      { error: "Relato não encontrado ou não é seu." },
      { status: 404 },
    );
  }

  return Response.json({ ok: true });
}

export { corsPreflight as OPTIONS } from "@/lib/api-auth";
