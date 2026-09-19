import type { NextAuthConfig } from "next-auth";

/**
 * Configuração base do Auth.js — SEM dependências de Node (Prisma, bcrypt).
 * É segura para rodar no Edge Runtime (middleware). O provider de credenciais,
 * que precisa do banco e do bcrypt, é adicionado apenas em `src/lib/auth.ts`.
 */
export const authConfig = {
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
  // `providers` completo é definido em src/lib/auth.ts.
  providers: [],
  callbacks: {
    /**
     * Protege as rotas do painel. Retorna `false` para redirecionar
     * usuárias não autenticadas para a página de login.
     */
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = Boolean(auth?.user);
      // O middleware só checa se há sessão. A checagem de PAPEL fica em
      // `requireAdmin()`, que lê do banco: o middleware roda no Edge, sem
      // Prisma, e um papel guardado no token continuaria valendo depois de
      // revogado.
      const isOnDashboard =
        nextUrl.pathname.startsWith("/painel") ||
        nextUrl.pathname.startsWith("/admin");

      if (isOnDashboard) return isLoggedIn;

      // Se já logada, redireciona login/cadastro para o painel.
      const isAuthPage =
        nextUrl.pathname === "/login" || nextUrl.pathname === "/cadastro";
      if (isAuthPage && isLoggedIn) {
        return Response.redirect(new URL("/painel", nextUrl));
      }

      return true;
    },
    jwt({ token, user }) {
      if (user) token.id = user.id;
      return token;
    },
    session({ session, token }) {
      if (token.id && session.user) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
