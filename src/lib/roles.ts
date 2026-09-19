import { redirect } from "next/navigation";

import { db } from "@/lib/db";
import { requireUser } from "@/lib/session";
import { pode, ehAdministrativo, type Permissao } from "@core/papeis";

/**
 * Quem está operando o painel administrativo.
 *
 * O papel é lido do BANCO a cada requisição, e não do JWT da sessão. Guardar
 * o papel no token seria mais barato — e faria uma revogação demorar até o
 * token expirar. Numa área que cadastra telefone de casa-abrigo e aprova
 * publicidade, "o acesso saiu na hora" vale mais do que uma consulta a menos.
 */
export interface Operadora {
  id: string;
  name: string;
  email: string;
  role: string;
  organizationId: string | null;
  organizationName: string | null;
}

export async function operadoraAtual(): Promise<Operadora | null> {
  const sessao = await requireUser();

  const registro = await db.user.findUnique({
    where: { id: sessao.id },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      organizationId: true,
      organization: { select: { name: true } },
    },
  });
  if (!registro) return null;

  return {
    id: registro.id,
    name: registro.name,
    email: registro.email,
    role: registro.role,
    organizationId: registro.organizationId,
    organizationName: registro.organization?.name ?? null,
  };
}

/**
 * Porta de entrada de /admin.
 *
 * Quem não tem nenhuma permissão administrativa volta para o painel comum —
 * e não vê uma tela de "acesso negado", que só confirmaria que a área existe.
 */
export async function requireAdmin(): Promise<Operadora> {
  const operadora = await operadoraAtual();
  if (!operadora || !ehAdministrativo(operadora.role)) redirect("/painel");
  return operadora;
}

/** Porta de entrada de uma seção específica de /admin. */
export async function requirePermissao(
  permissao: Permissao,
): Promise<Operadora> {
  const operadora = await requireAdmin();
  if (!pode(operadora.role, permissao)) redirect("/admin");
  return operadora;
}

/**
 * Versão para Server Actions.
 *
 * Diferente das duas acima, esta lança em vez de redirecionar: uma action que
 * não tem permissão precisa falhar, não navegar. Redirecionar dentro de uma
 * mutação esconderia a recusa atrás de uma tela nova.
 */
export async function exigirPermissao(
  permissao: Permissao,
): Promise<Operadora> {
  const operadora = await operadoraAtual();
  if (!operadora || !pode(operadora.role, permissao)) {
    throw new Error("Sem permissão para esta operação.");
  }
  return operadora;
}
