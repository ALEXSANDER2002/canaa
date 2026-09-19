"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

import { db } from "@/lib/db";
import { requireUser } from "@/lib/session";
import { goalSchema } from "@/lib/validations";
import type { ActionState } from "./auth";

/** Conclui o onboarding: define objetivo (e data de nascimento opcional). */
export async function completeOnboardingAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await requireUser();

  const parsed = goalSchema.safeParse({
    goal: formData.get("goal"),
    birthDate: formData.get("birthDate") || null,
  });

  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }

  // Sessão pode apontar para usuário inexistente (banco recriado) → logout.
  const exists = await db.user.findUnique({
    where: { id: user.id },
    select: { id: true },
  });
  if (!exists) redirect("/api/logout");

  await db.user.update({
    where: { id: user.id },
    data: {
      goal: parsed.data.goal,
      birthDate: parsed.data.birthDate ?? null,
      onboardedAt: new Date(),
    },
  });

  revalidatePath("/painel");
  redirect("/painel");
}
