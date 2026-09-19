"use server";

import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";

import { db } from "@/lib/db";
import { requireUser } from "@/lib/session";
import { signOut } from "@/lib/auth";
import { goalSchema, pinSchema } from "@/lib/validations";
import type { ActionState } from "./auth";

/** Atualiza o objetivo da usuária. */
export async function updateGoalAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await requireUser();
  const parsed = goalSchema.safeParse({ goal: formData.get("goal") });
  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }
  await db.user.update({
    where: { id: user.id },
    data: { goal: parsed.data.goal },
  });
  revalidatePath("/painel/configuracoes");
  revalidatePath("/painel");
  return { success: true };
}

/** Define ou atualiza o PIN de bloqueio. */
export async function setPinAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await requireUser();
  const parsed = pinSchema.safeParse({ pin: formData.get("pin") });
  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }
  const pinHash = await bcrypt.hash(parsed.data.pin, 10);
  await db.user.update({ where: { id: user.id }, data: { pinHash } });
  revalidatePath("/painel/configuracoes");
  return { success: true };
}

/** Remove o PIN de bloqueio. */
export async function removePinAction() {
  const user = await requireUser();
  await db.user.update({ where: { id: user.id }, data: { pinHash: null } });
  revalidatePath("/painel/configuracoes");
}

/** Exclui permanentemente a conta e todos os dados (LGPD). */
export async function deleteAccountAction() {
  const user = await requireUser();
  await db.user.delete({ where: { id: user.id } });
  await signOut({ redirectTo: "/" });
}
