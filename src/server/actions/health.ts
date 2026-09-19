"use server";

import { revalidatePath } from "next/cache";

import { db } from "@/lib/db";
import { requireUser } from "@/lib/session";
import { startOfDay } from "@/lib/utils";
import { healthMetricSchema } from "@/lib/validations";
import type { ActionState } from "./auth";

// --- Medidas de saúde -----------------------------------------------------

export async function addMetricAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await requireUser();
  const parsed = healthMetricSchema.safeParse({
    type: formData.get("type"),
    value: formData.get("value"),
    value2: formData.get("value2") || null,
    date: formData.get("date") || undefined,
    note: formData.get("note") || null,
  });
  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }
  await db.healthMetric.create({
    data: {
      userId: user.id,
      type: parsed.data.type,
      value: parsed.data.value,
      value2: parsed.data.value2 ?? null,
      date: parsed.data.date ?? new Date(),
      note: parsed.data.note ?? null,
    },
  });
  revalidatePath("/painel/medidas");
  return { success: true };
}

export async function deleteMetricAction(formData: FormData) {
  const user = await requireUser();
  const id = String(formData.get("id"));
  await db.healthMetric.deleteMany({ where: { id, userId: user.id } });
  revalidatePath("/painel/medidas");
}

// --- Anticoncepcional -----------------------------------------------------

/** Marca/desmarca o anticoncepcional de hoje (upsert por dia). */
export async function togglePillTodayAction() {
  const user = await requireUser();
  const today = startOfDay();
  const existing = await db.pillLog.findUnique({
    where: { userId_date: { userId: user.id, date: today } },
  });
  if (existing) {
    await db.pillLog.update({
      where: { id: existing.id },
      data: { taken: !existing.taken },
    });
  } else {
    await db.pillLog.create({
      data: { userId: user.id, date: today, taken: true },
    });
  }
  revalidatePath("/painel/pilula");
  revalidatePath("/painel");
}

// --- Autoexame das mamas --------------------------------------------------

export async function logSelfExamAction(formData: FormData) {
  const user = await requireUser();
  const note = String(formData.get("note") || "") || null;
  await db.selfExamLog.create({
    data: { userId: user.id, date: new Date(), note },
  });
  revalidatePath("/painel/autoexame");
  revalidatePath("/painel");
}
