import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

// GET /api/export — baixa todos os dados da usuária autenticada (LGPD).
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return new Response("Não autorizado", { status: 401 });
  }

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    include: {
      cycles: true,
      pregnancy: true,
      moods: true,
      reminders: true,
      dailyLogs: true,
      healthMetrics: true,
      pillLogs: true,
      selfExams: true,
      memories: true,
      conversations: { include: { messages: true } },
    },
  });

  if (!user) return new Response("Não encontrado", { status: 404 });

  // Remove dados sensíveis de autenticação do export.
  const { passwordHash: _p, pinHash: _pin, ...safe } = user;
  void _p;
  void _pin;

  const payload = {
    exportadoEm: new Date().toISOString(),
    dados: safe,
  };

  return new Response(JSON.stringify(payload, null, 2), {
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": 'attachment; filename="meus-dados-canaa-delas.json"',
    },
  });
}

export { corsPreflight as OPTIONS } from "@/lib/api-auth";
