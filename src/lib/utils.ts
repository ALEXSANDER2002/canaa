// Utilitários da web. A matemática de ciclo, gestação e datas mora em
// `packages/core` porque também é usada pelo app Expo — aqui só reexportamos,
// para que os imports `@/lib/utils` sigam funcionando sem alteração.
export * from "@core/cycle";

/**
 * Junta classes condicionalmente (versão minimalista de `clsx`).
 * Aceita strings, undefined e false; ignora valores falsy.
 * Fica fora do núcleo por ser específico de CSS/className (web).
 */
export function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(" ");
}
