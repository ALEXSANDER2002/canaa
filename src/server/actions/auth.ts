"use server";

import { AuthError } from "next-auth";
import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";

import { db } from "@/lib/db";
import { signIn, signOut } from "@/lib/auth";
import { registerSchema, loginSchema } from "@/lib/validations";
import { ehAdministrativo } from "@core/papeis";

/**
 * Para onde a pessoa vai depois de entrar.
 *
 * Conta administrativa não abre em `/painel`. O painel é o espaço pessoal —
 * ciclo, humor, lembretes de exame — e a moderadora, a Secretaria e o parceiro
 * não entraram aqui para registrar menstruação: entraram para trabalhar.
 * Somem-se a isso as contas institucionais, que podem ser usadas por mais de
 * uma pessoa; dado íntimo guardado nelas seria dado íntimo compartilhado.
 */
async function destinoDe(email: string): Promise<string> {
  const conta = await db.user.findUnique({
    where: { email },
    select: { role: true },
  });
  return conta && ehAdministrativo(conta.role) ? "/admin" : "/painel";
}

export interface ActionState {
  error?: string;
  fieldErrors?: Record<string, string[]>;
  success?: boolean;
}

/** Cria uma nova conta e já autentica a usuária. */
export async function registerAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = registerSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });

  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const { name, email, password } = parsed.data;

  const existing = await db.user.findUnique({ where: { email } });
  if (existing) {
    return { error: "Já existe uma conta com este e-mail." };
  }

  const passwordHash = await bcrypt.hash(password, 10);
  await db.user.create({ data: { name, email, passwordHash } });

  // Autentica automaticamente após o cadastro.
  await signIn("credentials", {
    email,
    password,
    redirect: false,
  });

  redirect("/painel");
}

/** Autentica com e-mail e senha. */
export async function loginAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }

  try {
    await signIn("credentials", {
      email: parsed.data.email,
      password: parsed.data.password,
      redirect: false,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: "E-mail ou senha incorretos." };
    }
    throw error;
  }

  redirect(await destinoDe(parsed.data.email));
}

export async function logoutAction() {
  await signOut({ redirectTo: "/" });
}
