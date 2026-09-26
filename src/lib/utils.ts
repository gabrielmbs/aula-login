import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * ============================================================================
 * UTILITÁRIO: cn (Classnames Merger)
 * ============================================================================
 * 
 * Função padrão do ecossistema shadcn/ui.
 * 
 * Por que usamos `clsx` e `tailwind-merge` juntos?
 * 1. clsx: Permite passar classes condicionais (objetos, arrays, ternários, booleanos).
 * 2. twMerge: Resolve conflitos entre classes do Tailwind CSS de forma inteligente.
 *    Exemplo: cn("p-4", "p-2") -> resulta em "p-2" (evitando sobreposição de CSS indesejada).
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
