"use server";

import { revalidatePath } from "next/cache";

import { db } from "@/lib/db";
import { requireUser } from "@/lib/session";
import { cycleSchema } from "@/lib/validations";
import type { ActionState } from "./auth";

/** Coleta os sintomas marcados (checkboxes) em uma string. */
function collectSymptoms(formData: FormData): string {
  return formData.getAll("symptoms").map(String).filter(Boolean).join(",");
}

export async function addCycleAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await requireUser();

  const parsed = cycleSchema.safeParse({
    startDate: formData.get("startDate"),
    endDate: formData.get("endDate") || null,
    flow: formData.get("flow") || null,
    symptoms: collectSymptoms(formData) || null,
    notes: formData.get("notes") || null,
  });

  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }

  await db.cycleEntry.create({
    data: {
      userId: user.id,
      startDate: parsed.data.startDate,
      endDate: parsed.data.endDate ?? null,
      flow: parsed.data.flow ?? null,
      symptoms: parsed.data.symptoms ?? null,
      notes: parsed.data.notes ?? null,
    },
  });

  revalidatePath("/painel/ciclo");
  revalidatePath("/painel");
  return { success: true };
}

export async function deleteCycleAction(formData: FormData) {
  const user = await requireUser();
  const id = String(formData.get("id"));

  // Garante que a entrada pertence à usuária antes de excluir.
  await db.cycleEntry.deleteMany({ where: { id, userId: user.id } });

  revalidatePath("/painel/ciclo");
  revalidatePath("/painel");
}
