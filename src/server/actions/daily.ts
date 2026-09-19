"use server";

import { revalidatePath } from "next/cache";

import { db } from "@/lib/db";
import { requireUser } from "@/lib/session";
import { dailyLogSchema } from "@/lib/validations";
import type { ActionState } from "./auth";

function collectSymptoms(formData: FormData): string {
  return formData.getAll("symptoms").map(String).filter(Boolean).join(",");
}

export async function addDailyLogAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await requireUser();

  const parsed = dailyLogSchema.safeParse({
    date: formData.get("date") || undefined,
    energy: formData.get("energy") || null,
    sleepHours: formData.get("sleepHours") || null,
    pain: formData.get("pain") || null,
    symptoms: collectSymptoms(formData) || null,
    note: formData.get("note") || null,
  });

  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }

  await db.dailyLog.create({
    data: {
      userId: user.id,
      date: parsed.data.date ?? new Date(),
      energy: parsed.data.energy ?? null,
      sleepHours: parsed.data.sleepHours ?? null,
      pain: parsed.data.pain ?? null,
      symptoms: parsed.data.symptoms ?? null,
      note: parsed.data.note ?? null,
    },
  });

  revalidatePath("/painel/diario");
  revalidatePath("/painel");
  return { success: true };
}

export async function deleteDailyLogAction(formData: FormData) {
  const user = await requireUser();
  const id = String(formData.get("id"));
  await db.dailyLog.deleteMany({ where: { id, userId: user.id } });
  revalidatePath("/painel/diario");
  revalidatePath("/painel");
}
