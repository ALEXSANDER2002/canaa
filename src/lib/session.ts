import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

/**
 * Retorna a sessão atual ou redireciona para o login.
 * Use em Server Components e Server Actions do painel.
 */
export async function requireUser() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }
  return session.user;
}
