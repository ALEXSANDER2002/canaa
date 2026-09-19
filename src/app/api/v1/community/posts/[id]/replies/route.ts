import { db } from "@/lib/db";
import { resolveApiUser, unauthorized, badRequest } from "@/lib/api-auth";
import { communityReplySchema } from "@/lib/validations";
import { apelidoDe } from "@core/community";

export const runtime = "nodejs";

/** POST /api/v1/community/posts/:id/replies — Body: { body } */
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const userId = await resolveApiUser(req);
  if (!userId) return unauthorized();

  const parsed = communityReplySchema.safeParse(
    await req.json().catch(() => null),
  );
  if (!parsed.success) {
    return badRequest(
      parsed.error.issues[0]?.message ?? "Requisição inválida.",
      parsed.error.flatten().fieldErrors,
    );
  }

  const { id } = await params;

  // Não deixa responder relato inexistente nem oculto por denúncia.
  const post = await db.communityPost.findFirst({
    where: { id, hidden: false },
    select: { id: true, userId: true },
  });
  if (!post) {
    return Response.json({ error: "Relato não encontrado." }, { status: 404 });
  }

  const reply = await db.communityReply.create({
    data: { postId: id, userId, body: parsed.data.body },
    select: { id: true, body: true, createdAt: true },
  });

  return Response.json(
    {
      reply: {
        ...reply,
        apelido: apelidoDe(userId),
        meu: true,
        autoraDoRelato: userId === post.userId,
      },
    },
    { status: 201 },
  );
}

export { corsPreflight as OPTIONS } from "@/lib/api-auth";
