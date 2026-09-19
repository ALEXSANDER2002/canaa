import { db } from "@/lib/db";

/**
 * Registro de auditoria — só inserção, nunca atualização.
 *
 * O que entra aqui é o lado administrativo: quem cadastrou, editou ou apagou
 * um serviço, uma unidade, uma campanha, quem decidiu uma denúncia, quem
 * atribuiu um papel.
 *
 * O que NÃO entra, e não pode entrar: qualquer coisa vinda da usuária no pilar
 * Proteção. Registrar "fulana abriu a rede de apoio" é exatamente o rastro que
 * `AVISO_RASTRO` promete que não existe — e a promessa está escrita na tela
 * dela, não num comentário.
 */
export type Recurso =
  | "servico"
  | "unidade"
  | "acao"
  | "campanha"
  | "moderacao"
  | "papel";

export type Acao =
  | "criar"
  | "editar"
  | "apagar"
  | "aprovar"
  | "recusar"
  | "decidir";

export async function registrar(entrada: {
  actorId: string;
  recurso: Recurso;
  recursoId?: string | null;
  acao: Acao;
  /** Resumo legível. Nunca dado sensível de usuária. */
  detalhe?: string | null;
}): Promise<void> {
  await db.auditLog.create({
    data: {
      actorId: entrada.actorId,
      recurso: entrada.recurso,
      recursoId: entrada.recursoId ?? null,
      acao: entrada.acao,
      detalhe: entrada.detalhe ?? null,
    },
  });
}
