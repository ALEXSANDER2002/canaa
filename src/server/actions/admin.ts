"use server";

import { revalidatePath } from "next/cache";

import { db } from "@/lib/db";
import { exigirPermissao } from "@/lib/roles";
import { registrar } from "@/lib/audit";
import {
  supportServiceSchema,
  healthUnitSchema,
  cityActionSchema,
  campaignSchema,
  moderationSchema,
  roleSchema,
} from "@/lib/validations";
import { DIAS_SILENCIADA } from "@core/moderacao";
import type { ActionState } from "./auth";

/** Converte "" em null — `formData.get` devolve string vazia para campo em branco. */
function texto(valor: FormDataEntryValue | null): string | null {
  const s = typeof valor === "string" ? valor.trim() : "";
  return s.length ? s : null;
}

/* ══════════════ rede de apoio (SupportService) ══════════════ */

/**
 * O cadastro que destrava o pilar Proteção.
 *
 * `verifiedAt` é gravado a partir do servidor, não de um campo do formulário:
 * a data de verificação precisa ser o momento em que alguém de fato apertou
 * "salvar" depois de ligar, e não uma data que dá para digitar para trás.
 */
export async function salvarServicoAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const operadora = await exigirPermissao("servicos:escrever");
  const id = texto(formData.get("id"));

  const parsed = supportServiceSchema.safeParse({
    name: formData.get("name"),
    kind: formData.get("kind"),
    address: texto(formData.get("address")),
    phone: texto(formData.get("phone")),
    hours: texto(formData.get("hours")),
    notes: texto(formData.get("notes")),
    ordem: formData.get("ordem") || 0,
    verifiedBy: formData.get("verifiedBy"),
  });
  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const dados = {
    name: parsed.data.name,
    kind: parsed.data.kind,
    address: parsed.data.address ?? null,
    phone: parsed.data.phone ?? null,
    hours: parsed.data.hours ?? null,
    notes: parsed.data.notes ?? null,
    ordem: parsed.data.ordem,
    verifiedBy: parsed.data.verifiedBy,
    verifiedAt: new Date(),
    active: true,
  };

  if (id) {
    await db.supportService.update({ where: { id }, data: dados });
  } else {
    await db.supportService.create({ data: dados });
  }

  await registrar({
    actorId: operadora.id,
    recurso: "servico",
    recursoId: id,
    acao: id ? "editar" : "criar",
    detalhe: `${parsed.data.name} — verificado por ${parsed.data.verifiedBy}`,
  });

  revalidatePath("/admin/servicos");
  return { success: true };
}

/** Reverificação: mesma data, sem reescrever o cadastro inteiro. */
export async function reverificarServicoAction(formData: FormData) {
  const operadora = await exigirPermissao("servicos:escrever");
  const id = String(formData.get("id"));
  const por = texto(formData.get("verifiedBy"));
  if (!por) return;

  await db.supportService.update({
    where: { id },
    data: { verifiedAt: new Date(), verifiedBy: por, active: true },
  });
  await registrar({
    actorId: operadora.id,
    recurso: "servico",
    recursoId: id,
    acao: "editar",
    detalhe: `Reverificado por ${por}`,
  });
  revalidatePath("/admin/servicos");
}

export async function apagarServicoAction(formData: FormData) {
  const operadora = await exigirPermissao("servicos:escrever");
  const id = String(formData.get("id"));
  const servico = await db.supportService.findUnique({ where: { id } });
  await db.supportService.delete({ where: { id } });
  await registrar({
    actorId: operadora.id,
    recurso: "servico",
    recursoId: id,
    acao: "apagar",
    detalhe: servico?.name ?? null,
  });
  revalidatePath("/admin/servicos");
}

/* ══════════════ unidades de saúde ══════════════ */

export async function salvarUnidadeAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const operadora = await exigirPermissao("unidades:escrever");
  const id = texto(formData.get("id"));

  // Os serviços chegam como vários campos com o mesmo nome (checkboxes).
  const servicos = formData.getAll("servicos").map(String).join(",");

  const parsed = healthUnitSchema.safeParse({
    nome: formData.get("nome"),
    tipo: formData.get("tipo"),
    endereco: texto(formData.get("endereco")),
    bairro: texto(formData.get("bairro")),
    telefone: texto(formData.get("telefone")),
    horario: texto(formData.get("horario")),
    servicos,
    observacao: texto(formData.get("observacao")),
    latitude: texto(formData.get("latitude")),
    longitude: texto(formData.get("longitude")),
  });
  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const dados = {
    nome: parsed.data.nome,
    tipo: parsed.data.tipo,
    endereco: parsed.data.endereco ?? null,
    bairro: parsed.data.bairro ?? null,
    telefone: parsed.data.telefone ?? null,
    horario: parsed.data.horario ?? null,
    servicos: parsed.data.servicos,
    observacao: parsed.data.observacao ?? null,
    latitude: parsed.data.latitude ?? null,
    longitude: parsed.data.longitude ?? null,
    ativa: true,
  };

  if (id) {
    await db.healthUnit.update({ where: { id }, data: dados });
  } else {
    await db.healthUnit.create({ data: dados });
  }

  await registrar({
    actorId: operadora.id,
    recurso: "unidade",
    recursoId: id,
    acao: id ? "editar" : "criar",
    detalhe: parsed.data.nome,
  });

  revalidatePath("/admin/unidades");
  return { success: true };
}

export async function alternarUnidadeAction(formData: FormData) {
  const operadora = await exigirPermissao("unidades:escrever");
  const id = String(formData.get("id"));
  const unidade = await db.healthUnit.findUnique({ where: { id } });
  if (!unidade) return;

  await db.healthUnit.update({
    where: { id },
    data: { ativa: !unidade.ativa },
  });
  await registrar({
    actorId: operadora.id,
    recurso: "unidade",
    recursoId: id,
    acao: "editar",
    detalhe: `${unidade.nome} — ${unidade.ativa ? "desativada" : "reativada"}`,
  });
  revalidatePath("/admin/unidades");
}

/* ══════════════ campanhas da cidade ══════════════ */

export async function salvarAcaoAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const operadora = await exigirPermissao("acoes:escrever");
  const id = texto(formData.get("id"));

  const parsed = cityActionSchema.safeParse({
    title: formData.get("title"),
    summary: formData.get("summary"),
    category: formData.get("category"),
    location: texto(formData.get("location")),
    startsAt: texto(formData.get("startsAt")),
    endsAt: texto(formData.get("endsAt")),
    contact: texto(formData.get("contact")),
    url: texto(formData.get("url")),
    pinned: formData.get("pinned") === "on",
  });
  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const dados = {
    title: parsed.data.title,
    summary: parsed.data.summary,
    category: parsed.data.category,
    location: parsed.data.location ?? null,
    startsAt: parsed.data.startsAt ?? null,
    endsAt: parsed.data.endsAt ?? null,
    contact: parsed.data.contact ?? null,
    url: parsed.data.url || null,
    pinned: parsed.data.pinned,
    active: true,
  };

  if (id) {
    await db.cityAction.update({ where: { id }, data: dados });
  } else {
    await db.cityAction.create({ data: dados });
  }

  await registrar({
    actorId: operadora.id,
    recurso: "acao",
    recursoId: id,
    acao: id ? "editar" : "criar",
    detalhe: parsed.data.title,
  });

  revalidatePath("/admin/acoes");
  return { success: true };
}

export async function arquivarAcaoAction(formData: FormData) {
  const operadora = await exigirPermissao("acoes:escrever");
  const id = String(formData.get("id"));
  const acao = await db.cityAction.findUnique({ where: { id } });
  if (!acao) return;

  // Arquiva em vez de apagar: a ação já foi divulgada, e um histórico do que
  // o município anunciou vale mais do que uma lista limpa.
  await db.cityAction.update({
    where: { id },
    data: { active: !acao.active },
  });
  await registrar({
    actorId: operadora.id,
    recurso: "acao",
    recursoId: id,
    acao: "editar",
    detalhe: `${acao.title} — ${acao.active ? "arquivada" : "republicada"}`,
  });
  revalidatePath("/admin/acoes");
}

/* ══════════════ moderação ══════════════ */

export async function decidirModeracaoAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const operadora = await exigirPermissao("moderacao:decidir");
  const postId = texto(formData.get("postId"));
  if (!postId) return { error: "Relato não informado." };

  const parsed = moderationSchema.safeParse({
    decisao: formData.get("decisao"),
    nota: texto(formData.get("nota")),
  });
  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const post = await db.communityPost.findUnique({ where: { id: postId } });
  if (!post) return { error: "Relato não encontrado." };

  if (parsed.data.decisao === "restaurar") {
    // Zera o contador junto: sem isso, a próxima denúncia sozinha oculta de
    // novo o relato que acabou de ser considerado legítimo.
    await db.communityPost.update({
      where: { id: postId },
      data: { hidden: false, reports: 0 },
    });
  } else {
    await db.communityPost.update({
      where: { id: postId },
      data: { hidden: true },
    });
  }

  if (parsed.data.decisao === "silenciar") {
    const ate = new Date();
    ate.setDate(ate.getDate() + DIAS_SILENCIADA);
    await db.user.update({
      where: { id: post.userId },
      data: { silencedUntil: ate },
    });
  }

  await db.moderationAction.create({
    data: {
      postId,
      decisao: parsed.data.decisao,
      nota: parsed.data.nota ?? null,
      moderatorId: operadora.id,
    },
  });

  await registrar({
    actorId: operadora.id,
    recurso: "moderacao",
    recursoId: postId,
    acao: "decidir",
    // Sem o texto do relato e sem o apelido: a auditoria registra a decisão,
    // não o conteúdo denunciado.
    detalhe: parsed.data.decisao,
  });

  revalidatePath("/admin/moderacao");
  return { success: true };
}

/* ══════════════ parcerias ══════════════ */

export async function enviarCampanhaAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const operadora = await exigirPermissao("parcerias:enviar");
  const id = texto(formData.get("id"));
  const partnerId = texto(formData.get("partnerId"));
  if (!partnerId) return { error: "Selecione o parceiro." };

  const parsed = campaignSchema.safeParse({
    titulo: formData.get("titulo"),
    texto: formData.get("texto"),
    pilar: formData.get("pilar"),
    url: texto(formData.get("url")),
    cidade: texto(formData.get("cidade")),
    bairro: texto(formData.get("bairro")),
    inicioEm: texto(formData.get("inicioEm")),
    fimEm: texto(formData.get("fimEm")),
  });
  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const dados = {
    partnerId,
    titulo: parsed.data.titulo,
    texto: parsed.data.texto,
    pilar: parsed.data.pilar,
    url: parsed.data.url || null,
    cidade: parsed.data.cidade ?? null,
    bairro: parsed.data.bairro ?? null,
    inicioEm: parsed.data.inicioEm ?? null,
    fimEm: parsed.data.fimEm ?? null,
    // Enviar não é publicar. Toda edição volta para a fila.
    status: "enviada",
    motivoRecusa: null,
  };

  if (id) {
    await db.campaign.update({ where: { id }, data: dados });
  } else {
    await db.campaign.create({ data: dados });
  }

  await registrar({
    actorId: operadora.id,
    recurso: "campanha",
    recursoId: id,
    acao: id ? "editar" : "criar",
    detalhe: parsed.data.titulo,
  });

  revalidatePath("/admin/parcerias");
  return { success: true };
}

export async function decidirCampanhaAction(formData: FormData) {
  const operadora = await exigirPermissao("parcerias:aprovar");
  const id = String(formData.get("id"));
  const aprovar = formData.get("decisao") === "aprovar";
  const motivo = texto(formData.get("motivo"));

  await db.campaign.update({
    where: { id },
    data: {
      status: aprovar ? "aprovada" : "recusada",
      motivoRecusa: aprovar ? null : motivo,
      aprovadaPorId: aprovar ? operadora.id : null,
    },
  });

  await registrar({
    actorId: operadora.id,
    recurso: "campanha",
    recursoId: id,
    acao: aprovar ? "aprovar" : "recusar",
    detalhe: motivo,
  });

  revalidatePath("/admin/parcerias");
}

/* ══════════════ papéis ══════════════ */

export async function atribuirPapelAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const operadora = await exigirPermissao("papeis:atribuir");

  const parsed = roleSchema.safeParse({
    userId: formData.get("userId"),
    role: formData.get("role"),
    organizationId: texto(formData.get("organizationId")),
  });
  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }

  // Ninguém rebaixa a si mesma por engano e tranca a porta da área inteira.
  if (parsed.data.userId === operadora.id && parsed.data.role !== "equipe") {
    return {
      error:
        "Você não pode remover o seu próprio acesso. Peça a outra pessoa da equipe.",
    };
  }

  const alvo = await db.user.findUnique({
    where: { id: parsed.data.userId },
    select: { email: true },
  });
  if (!alvo) return { error: "Conta não encontrada." };

  await db.user.update({
    where: { id: parsed.data.userId },
    data: {
      role: parsed.data.role,
      organizationId: parsed.data.organizationId ?? null,
    },
  });

  await registrar({
    actorId: operadora.id,
    recurso: "papel",
    recursoId: parsed.data.userId,
    acao: "editar",
    detalhe: `${alvo.email} → ${parsed.data.role}`,
  });

  revalidatePath("/admin/papeis");
  return { success: true };
}
