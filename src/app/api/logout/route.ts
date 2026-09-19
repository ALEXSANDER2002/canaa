import { signOut } from "@/lib/auth";

// GET /api/logout — encerra a sessão e volta ao login.
// Usado quando a sessão aponta para um usuário que não existe mais no banco.
export async function GET() {
  await signOut({ redirectTo: "/login" });
}

export { corsPreflight as OPTIONS } from "@/lib/api-auth";
