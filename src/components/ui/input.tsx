import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * ============================================================================
 * COMPONENTE UI: Input (shadcn/ui pattern)
 * ============================================================================
 * 
 * Conceitos importantes para a aula:
 * 1. Interface HTMLInputElement: Herda todas as propriedades nativas de um input
 *    (type, value, onChange, placeholder, required, etc.).
 * 2. Estilização Tailwind: Fundo branco, borda suave, foco com anel visível
 *    para acessibilidade e tratamento do placeholder.
 */

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        ref={ref}
        type={type}
        className={cn(
          "flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 ring-offset-white placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export { Input };
