"use server";

import { revalidatePath } from "next/cache";

import { db } from "@/lib/db";
import { requireUser } from "@/lib/session";
import { reminderSchema } from "@/lib/validations";
import type { ActionState } from "./auth";

export async function addReminderAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await requireUser();

  const parsed = reminderSchema.safeParse({
    title: formData.get("title"),
    type: formData.get("type"),
    dueDate: formData.get("dueDate"),
    notes: formData.get("notes") || null,
  });

  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }

  await db.reminder.create({
    data: {
      userId: user.id,
      title: parsed.data.title,
      type: parsed.data.type,
      dueDate: parsed.data.dueDate,
      notes: parsed.data.notes ?? null,
    },
  });

  revalidatePath("/painel/lembretes");
  revalidatePath("/painel");
  revalidatePath("/painel/exames");
  return { success: true };
}

export async function toggleReminderAction(formData: FormData) {
  const user = await requireUser();
  const id = String(formData.get("id"));

  const reminder = await db.reminder.findFirst({
    where: { id, userId: user.id },
  });
  if (!reminder) return;

  await db.reminder.update({
    where: { id },
    data: { done: !reminder.done },
  });

  revalidatePath("/painel/lembretes");
  revalidatePath("/painel");
}

export async function deleteReminderAction(formData: FormData) {
  const user = await requireUser();
  const id = String(formData.get("id"));
  await db.reminder.deleteMany({ where: { id, userId: user.id } });
  revalidatePath("/painel/lembretes");
  revalidatePath("/painel");
}
