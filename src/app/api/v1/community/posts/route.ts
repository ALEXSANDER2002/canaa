import { db } from "@/lib/db";
import { resolveApiUser, unauthorized, badRequest } from "@/lib/api-auth";
import { communityPostSchema } from "@/lib/validations";
import { apelidoDe } from "@core/community";

export const runtime = "nodejs";

/**
 * GET /api/v1/community/posts?category=&take=
 *
 * O `userId` NUNCA sai daqui. O que vai para o cliente é o apelido derivado
 * dele, mais um `meu: true` quando o relato é da própria usuária — só isso
 * basta para ela poder apagar o que escreveu.
 */
export async function GET(req: Request) {
  const userId = await resolveApiUser(req);
  if (!userId) return unauthorized();

  const url = new URL(req.url);
  const category = url.searchParams.get("category");
  const take = Math.min(Number(url.searchParams.get("take")) || 30, 100);

  const posts = await db.communityPost.findMany({
    where: {
      hidden: false,
      ...(category && category !== "todos" ? { category } : {}),
    },
    orderBy: { createdAt: "desc" },
    take,
    select: {
      id: true,
      userId: true,
      category: true,
      body: true,
      createdAt: true,
      _count: { select: { replies: { where: { hidden: false } } } },
    },
  });

  return Response.json({
    posts: posts.map(({ userId: autor, _count, ...p }) => ({
      ...p,
      apelido: apelidoDe(autor),
      meu: autor === userId,
      respostas: _count.replies,
    })),
  });
}

/** POST /api/v1/community/posts — Body: { category, body } */
export async function POST(req: Request) {
  const userId = await resolveApiUser(req);
  if (!userId) return unauthorized();

  // Silenciamento decidido na moderação. Checado na escrita e não na leitura:
  // quem foi silenciada continua lendo. A punição é não poder publicar por 30
  // dias, não ser expulsa de um espaço que pode ser o único que ela tem.
  const autora = await db.user.findUnique({
    where: { id: userId },
    select: { silencedUntil: true },
  });
  if (autora?.silencedUntil && autora.silencedUntil > new Date()) {
    return Response.json(
      {
        error: `Você não pode publicar até ${autora.silencedUntil.toLocaleDateString("pt-BR")}. Você continua podendo ler e responder.`,
      },
      { status: 403 },
    );
  }

  const parsed = communityPostSchema.safeParse(
    await req.json().catch(() => null),
  );
  if (!parsed.success) {
    return badRequest(
      parsed.error.issues[0]?.message ?? "Requisição inválida.",
      parsed.error.flatten().fieldErrors,
    );
  }

  const post = await db.communityPost.create({
    data: {
      userId,
      category: parsed.data.category,
      body: parsed.data.body,
    },
    select: { id: true, category: true, body: true, createdAt: true },
  });

  return Response.json(
    { post: { ...post, apelido: apelidoDe(userId), meu: true, respostas: 0 } },
    { status: 201 },
  );
}

export { corsPreflight as OPTIONS } from "@/lib/api-auth";
