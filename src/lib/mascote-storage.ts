// Estado do mascote — só neste aparelho, nunca no servidor.
//
// Guarda: se ela desligou, quais mensagens já foram mostradas (por HASH do id,
// ver `chaveDaMensagem`), quantas apareceram hoje e quando foi a última.
// Nenhuma leitura ou escrita passa pelo banco — nem contagem, nem métrica.
//
// Todo acesso é protegido por try/catch: navegação privativa e armazenamento
// bloqueado lançam exceção, e o mascote é um extra que não pode quebrar a página.

export interface EstadoMascote {
  desligado: boolean;
  /** chaveDaMensagem(id) → instante em que foi mostrada. */
  vistas: Record<string, number>;
  /** "2026-9-19" — o dia a que `hoje` se refere. */
  dia: string;
  /** Quantas mensagens já apareceram sozinhas neste dia. */
  hoje: number;
  /** Instante da última que apareceu sozinha. */
  ultima: number;
}

/** Disparado quando o estado muda na mesma aba (ex.: interruptor em Configurações). */
export const EVENTO_MASCOTE = "canaa:mascote";

/** Um pouco mais que a maior repetição (30 dias): depois disso, é lixo. */
const RETENCAO_MS = 35 * 24 * 60 * 60 * 1000;

const chave = (userId: string) => `canaa:mascote:v1:${userId}`;

export function diaLocal(ms: number): string {
  const d = new Date(ms);
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}

function vazio(): EstadoMascote {
  return { desligado: false, vistas: {}, dia: "", hoje: 0, ultima: 0 };
}

export function lerEstado(userId: string): EstadoMascote {
  const estado = vazio();

  try {
    const bruto = window.localStorage.getItem(chave(userId));
    if (bruto) {
      const dados: unknown = JSON.parse(bruto);
      if (dados && typeof dados === "object") {
        const d = dados as Record<string, unknown>;
        const agora = Date.now();

        estado.desligado = d.desligado === true;
        if (typeof d.dia === "string") estado.dia = d.dia;
        if (typeof d.hoje === "number") estado.hoje = d.hoje;
        if (typeof d.ultima === "number") estado.ultima = d.ultima;

        if (d.vistas && typeof d.vistas === "object") {
          for (const [k, v] of Object.entries(d.vistas)) {
            if (typeof v === "number" && agora - v < RETENCAO_MS) {
              estado.vistas[k] = v;
            }
          }
        }
      }
    }
  } catch {
    // JSON corrompido ou armazenamento indisponível: começa do zero.
  }

  const hoje = diaLocal(Date.now());
  if (estado.dia !== hoje) {
    estado.dia = hoje;
    estado.hoje = 0;
  }

  return estado;
}

export function salvarEstado(userId: string, estado: EstadoMascote): void {
  try {
    window.localStorage.setItem(chave(userId), JSON.stringify(estado));
  } catch {
    // Sem armazenamento, o mascote só perde a memória do que já mostrou.
  }
}

/** Liga ou desliga o mascote neste aparelho e avisa a aba atual. */
export function definirDesligado(userId: string, desligado: boolean): void {
  const estado = lerEstado(userId);
  estado.desligado = desligado;
  salvarEstado(userId, estado);
  window.dispatchEvent(new Event(EVENTO_MASCOTE));
}
