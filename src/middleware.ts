import NextAuth from "next-auth";
import { authConfig } from "@/auth.config";

// O middleware usa apenas a configuração edge-safe (sem Prisma/bcrypt).
// A lógica de proteção de rotas está em `authConfig.callbacks.authorized`.
export default NextAuth(authConfig).auth;

export const config = {
  // Executa em todas as rotas, exceto assets estáticos e a API do NextAuth.
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\.).*)"],
};
