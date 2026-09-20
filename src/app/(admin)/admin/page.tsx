import { requireAdmin } from "@/lib/roles";
import { permissoesDe, papelLabel } from "@core/papeis";
import { ADMIN_SECTIONS } from "@/components/admin/admin-nav";
import { PainelPrefeitura } from "@/components/admin/painel-prefeitura";
import {
  PainelRedeApoio,
  PainelModeracao,
  PainelParceiro,
  PainelEquipe,
  PainelGenerico,
} from "@/components/admin/painel-outros";

/**
 * A porta da área administrativa — uma por perfil, não uma para todos.
 *
 * Antes esta tela era a mesma grade de cartões de seção para qualquer papel,
 * filtrada por permissão. Filtrar é o mínimo: some o que a pessoa não pode
 * abrir, mas o que sobra continua sendo um índice do sistema, não uma resposta
 * à pergunta que ela veio fazer.
 *
 * A pergunta é a mesma para todos os papéis — "o que precisa de mim agora?" —
 * e a resposta não tem nada em comum entre eles. A Secretaria de Saúde quer
 * saber onde a rede tem buraco; a moderadora quer o tamanho da fila; o
 * parceiro quer saber se a peça dele subiu. Cada painel responde só isso.
 */
export default async function AdminHome() {
  const operadora = await requireAdmin();
  const permissoes = permissoesDe(operadora.role);

  // A organização só entra quando acrescenta alguma coisa. Para a equipe, o
  // papel e a organização são a mesma palavra, e "Equipe Elas IA · Equipe
  // Elas IA" só faz a tela parecer montada por engano.
  const papel = papelLabel(operadora.role);
  const subtitulo =
    operadora.organizationName && operadora.organizationName !== papel
      ? `${papel} · ${operadora.organizationName}`
      : papel;

  return (
    <>
      <div className="mb-8 border-b border-line/70 pb-6">
        <h1 className="text-3xl text-ink">
          Olá, {operadora.name.split(" ")[0]}
        </h1>
        <p className="mt-2 text-muted">{subtitulo}</p>
      </div>

      {operadora.role === "prefeitura" ? (
        <PainelPrefeitura />
      ) : operadora.role === "rede_apoio" ? (
        <PainelRedeApoio />
      ) : operadora.role === "moderadora" ? (
        <PainelModeracao />
      ) : operadora.role === "parceiro" ? (
        <PainelParceiro organizationId={operadora.organizationId} />
      ) : operadora.role === "equipe" ? (
        <PainelEquipe />
      ) : (
        <PainelGenerico
          secoes={ADMIN_SECTIONS.filter((s) => permissoes.includes(s.exige)).map(
            (s) => ({ href: s.href, label: s.label, descricao: s.descricao }),
          )}
        />
      )}
    </>
  );
}
