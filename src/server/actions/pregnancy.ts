"use server";

import { revalidatePath } from "next/cache";

import { db } from "@/lib/db";
import { requireUser } from "@/lib/session";
import { pregnancySchema } from "@/lib/validations";
import { addDays } from "@/lib/utils";
import { PREGNANCY_DURATION_DAYS } from "@/lib/constants";
import type { ActionState } from "./auth";

/** Cria ou atualiza a gestação ativa da usuária (uma por usuária). */
export async function upsertPregnancyAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await requireUser();

  const parsed = pregnancySchema.safeParse({
    lastPeriodDate: formData.get("lastPeriodDate"),
    notes: formData.get("notes") || null,
  });

  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const { lastPeriodDate, notes } = parsed.data;
  const dueDate = addDays(lastPeriodDate, PREGNANCY_DURATION_DAYS);

  await db.pregnancy.upsert({
    where: { userId: user.id },
    create: {
      userId: user.id,
      lastPeriodDate,
      dueDate,
      notes: notes ?? null,
      active: true,
    },
    update: {
      lastPeriodDate,
      dueDate,
      notes: notes ?? null,
      active: true,
    },
  });

  revalidatePath("/painel/gestacao");
  revalidatePath("/painel");
  return { success: true };
}

/** Encerra o acompanhamento da gestação. */
export async function endPregnancyAction() {
  const user = await requireUser();
  await db.pregnancy.deleteMany({ where: { userId: user.id } });
  revalidatePath("/painel/gestacao");
  revalidatePath("/painel");
}
