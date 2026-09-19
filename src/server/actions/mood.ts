"use server";

import { revalidatePath } from "next/cache";

import { db } from "@/lib/db";
import { requireUser } from "@/lib/session";
import { moodSchema } from "@/lib/validations";
import type { ActionState } from "./auth";

export async function addMoodAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await requireUser();

  const parsed = moodSchema.safeParse({
    date: formData.get("date") || undefined,
    mood: formData.get("mood"),
    intensity: formData.get("intensity"),
    note: formData.get("note") || null,
  });

  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }

  await db.moodEntry.create({
    data: {
      userId: user.id,
      date: parsed.data.date ?? new Date(),
      mood: parsed.data.mood,
      intensity: parsed.data.intensity,
      note: parsed.data.note ?? null,
    },
  });

  revalidatePath("/painel/bem-estar");
  revalidatePath("/painel");
  return { success: true };
}

export async function deleteMoodAction(formData: FormData) {
  const user = await requireUser();
  const id = String(formData.get("id"));
  await db.moodEntry.deleteMany({ where: { id, userId: user.id } });
  revalidatePath("/painel/bem-estar");
  revalidatePath("/painel");
}
