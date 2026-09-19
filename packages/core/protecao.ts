// Pilar Proteção — regras compartilhadas entre web e app.
//
// Este arquivo é escrito partindo de uma suposição que muda tudo: **o celular
// dela pode ser conferido por quem a agride.** Cada constante daqui existe
// por causa disso, e não por elegância de arquitetura.

import type { Canal } from "./apoio";
import { CANAIS_NACIONAIS } from "./apoio";

/* ══════════════ botão SOS ══════════════ */

export type CamadaSos = "ligacao" | "rede" | "patrulha";

export interface Camada {
  value: CamadaSos;
  label: string;
  descricao: string;
  /**
   * Falso quando a camada depende de algo que o app não controla — convênio
   * assinado, plantão humano, provedor de SMS contratado. Camada indisponível
   * não aparece na tela: botão que promete e não cumpre é pior que botão
   * ausente.
   */
  disponivel: boolean;
  /** Por que está indisponível — texto para o painel administrativo, não para a usuária. */
  bloqueio?: string;
}

/**
 * As três camadas do SOS, em ordem de confiabilidade decrescente.
 *
 * A camada 1 é a única que não depende de nada: nem de internet, nem de
 * servidor nosso, nem de terceiro. É por isso que ela é o botão grande, e as
 * outras duas são complemento.
 *
 * A camada 3 está desligada de propósito e **não deve ser ligada por código**.
 * Um SOS que abre chamado num painel promete resgate; sem alguém de plantão 24
 * horas do outro lado, essa promessa mata. Ligá-la exige convênio assinado com
 * a Guarda Municipal ou com a Patrulha Maria da Penha e escala confirmada —
 * uma decisão de quem responde pelo serviço, não de quem escreve o app.
 */
export const CAMADAS_SOS: Camada[] = [
  {
    value: "ligacao",
    label: "Ligar para a polícia",
    descricao:
      "Chama o 190 direto. Funciona sem internet e sem depender do app.",
    disponivel: true,
  },
  {
    value: "rede",
    label: "Avisar minha rede",
    descricao:
      "Manda uma mensagem pronta, com sua localização, para até três pessoas que você escolheu antes.",
    disponivel: true,
  },
  {
    value: "patrulha",
    label: "Acionar a Patrulha Maria da Penha",
    descricao: "Chamado direto para a equipe de plantão do município.",
    disponivel: false,
    bloqueio:
      "Requer convênio assinado e plantão 24h confirmado. Enquanto não houver, o botão não pode existir.",
  },
];

export function camadasDisponiveis(): Camada[] {
  return CAMADAS_SOS.filter((c) => c.disponivel);
}

/** Canal chamado pela camada 1. Vem de `CANAIS_NACIONAIS` — não é literal solto. */
export function canalEmergencia(): Canal {
  const canal = CANAIS_NACIONAIS.find((c) => c.numero === "190");
  if (!canal) throw new Error("Canal 190 ausente de CANAIS_NACIONAIS.");
  return canal;
}

/* ══════════════ rede de confiança ══════════════ */

/**
 * Três, e não "quantos ela quiser".
 *
 * Uma lista longa dilui: se dez pessoas recebem o alerta, cada uma assume que
 * outra vai agir. Três é o número em que cada pessoa ainda se sente chamada
 * pelo nome.
 */
export const LIMITE_CONTATOS_CONFIANCA = 3;

export type StatusContato = "pendente" | "aceito" | "recusado";

export const STATUS_CONTATO_LABEL: Record<StatusContato, string> = {
  pendente: "Aguardando a pessoa aceitar",
  aceito: "Pronta para receber o alerta",
  recusado: "Não aceitou",
};

/**
 * Texto do alerta.
 *
 * Curto de propósito: chega como SMS, e a primeira linha é o que aparece na
 * tela de bloqueio de quem recebe. "Preciso de ajuda" precisa estar ali, não
 * depois de uma saudação.
 */
export function mensagemAlerta(nome: string, local?: string): string {
  const onde = local ? ` Estou em: ${local}.` : "";
  return (
    `${nome} precisa de ajuda agora.${onde}` +
    ` Se não conseguir falar com ela, ligue 190.` +
    ` (Mensagem enviada pelo app Canaã Delas, a pedido dela.)`
  );
}

export const AVISO_REDE_CONFIANCA =
  "Escolha pessoas que atendem o telefone de madrugada. Elas recebem uma mensagem com sua localização — e só quando você apertar o botão.";

/* ══════════════ cofre de provas ══════════════ */

export const TIPOS_PROVA = [
  { value: "foto", label: "Foto" },
  { value: "video", label: "Vídeo" },
  { value: "audio", label: "Áudio" },
  { value: "nota", label: "Anotação" },
] as const;

export type TipoProva = (typeof TIPOS_PROVA)[number]["value"];

export const AVISO_COFRE =
  "O que você guarda aqui fica cifrado neste aparelho, fora da galeria, e não é enviado para nenhum servidor. Se você perder o celular, perde o cofre — por isso exporte o PDF e guarde em outro lugar.";

/**
 * Texto que abre o PDF exportado.
 *
 * O hash existe para que o arquivo tenha valor: com ele dá para demonstrar que
 * a foto não foi alterada depois de guardada. Sem essa explicação na primeira
 * página, o PDF chega na delegacia como um álbum de fotos qualquer.
 */
export const EXPLICACAO_HASH =
  "Cada arquivo abaixo foi registrado no momento da captura com um código de verificação (SHA-256) e a data e hora do aparelho. Conferindo o arquivo original com o código, é possível demonstrar que ele não foi alterado depois de guardado.";

/* ══════════════ serviços da rede local ══════════════ */

export const TIPOS_SERVICO_APOIO = [
  {
    value: "violencia",
    label: "Enfrentamento à violência",
    exemplo: "Delegacia, Patrulha Maria da Penha, casa-abrigo",
  },
  {
    value: "assistencia",
    label: "Assistência social",
    exemplo: "CRAS, CREAS, Centro de Referência da Mulher",
  },
  {
    value: "juridico",
    label: "Jurídico",
    exemplo: "Defensoria Pública, Ministério Público",
  },
  {
    value: "saude",
    label: "Saúde",
    exemplo: "Hospital de referência, CAPS",
  },
] as const;

export type TipoServicoApoio = (typeof TIPOS_SERVICO_APOIO)[number]["value"];

export function tipoServicoLabel(value: string): string {
  return TIPOS_SERVICO_APOIO.find((t) => t.value === value)?.label ?? value;
}

/* ══════════════ verificação dos contatos locais ══════════════ */

/**
 * Prazo de validade da verificação de um serviço de apoio.
 *
 * Telefone de delegacia e de casa-abrigo muda, e ninguém avisa. Passados 90
 * dias sem alguém confirmar que o número atende, o registro sai da tela e
 * sobram os canais nacionais — que valem em qualquer município do país e não
 * ficam desatualizados.
 */
export const VALIDADE_VERIFICACAO_DIAS = 90;

export function verificacaoVencida(
  verificadoEm: Date | string | null | undefined,
  agora: Date = new Date(),
): boolean {
  if (!verificadoEm) return true;
  const data = new Date(verificadoEm);
  const dias = (agora.getTime() - data.getTime()) / 86_400_000;
  return dias > VALIDADE_VERIFICACAO_DIAS;
}

export function diasParaVencer(
  verificadoEm: Date | string | null | undefined,
  agora: Date = new Date(),
): number {
  if (!verificadoEm) return 0;
  const data = new Date(verificadoEm);
  const dias = (agora.getTime() - data.getTime()) / 86_400_000;
  return Math.max(0, Math.ceil(VALIDADE_VERIFICACAO_DIAS - dias));
}

/* ══════════════ modo acolhimento da assistente ══════════════ */

/**
 * Prompt do modo acolhimento.
 *
 * Mora no núcleo, e não junto do resto dos prompts na web, porque é a única
 * parte do produto em que o texto do prompt *é* a regra de segurança. Quem
 * for alterá-lo precisa esbarrar neste comentário.
 *
 * Duas proibições que parecem excesso de zelo e não são:
 *
 * - **Não aconselhar a sair.** O momento da saída é estatisticamente o de
 *   maior risco. Um modelo que não conhece o caso não tem como saber se hoje
 *   é a hora.
 * - **Não perguntar sobre o agressor.** Nome, rotina e endereço dele não
 *   ajudam em nada que a assistente possa fazer, e transformam a conversa num
 *   dossiê que é prova contra ela se o aparelho for acessado.
 */
export const PROMPT_ACOLHIMENTO = `Você é uma assistente de acolhimento do app Canaã Delas, falando com uma mulher que pode estar vivendo violência.

Como você responde:
- Frases curtas. Português simples. Nunca linguagem jurídica sem explicar.
- Acredite nela. Não peça prova, não questione a versão, não procure contradição.
- Não julgue nenhuma escolha dela, inclusive a de ficar.

O que você NUNCA faz:
- Nunca diga para ela sair da relação, terminar, fugir ou denunciar. A decisão é dela e o momento é dela.
- Nunca pergunte nome, rotina, endereço ou qualquer dado do agressor.
- Nunca diagnostique, nunca prescreva, nunca avalie risco com números.
- Nunca prometa que alguém vai até ela. Você não aciona ninguém.

O que você oferece, quando fizer sentido na conversa:
- 180 (Central de Atendimento à Mulher): gratuito, 24 horas, orienta sem exigir denúncia.
- 190: se o perigo é agora.
- CREAS, CRAS e Centro de Referência da Mulher do município, para atendimento presencial.
- Que ela pode pedir medida protetiva em qualquer delegacia, sem advogado e sem custo.

Se ela contar que há arma em casa, ameaça de morte, ou violência contra criança, diga com clareza que isso é grave e ofereça o 190 e o 180 — sem dramatizar e sem dar ultimato.

Esta conversa não fica salva. Não diga que vai "lembrar" de nada.`;

export const AVISO_ACOLHIMENTO_SEM_MEMORIA =
  "Esta conversa não fica salva. Quando você fechar, ela some — nem a assistente nem o app guardam o que foi dito aqui.";
