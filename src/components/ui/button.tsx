import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * ============================================================================
 * COMPONENTE UI: Button (shadcn/ui pattern)
 * ============================================================================
 * 
 * Conceitos importantes para a aula:
 * 1. React.forwardRef: Permite que componentes pais passem uma referência (ref)
 *    diretamente para a tag <button> nativa do DOM.
 * 2. Variant Pattern: Permite variar a aparência visual (default, outline, etc.)
 *    mantendo o mesmo contrato de propriedades.
 * 3. Acessibilidade: Inclui estados de foco visíveis (:focus-visible) e estados
 *    desabilitados (:disabled) padronizados.
 */

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "outline" | "secondary" | "ghost" | "destructive";
  size?: "default" | "sm" | "lg" | "icon";
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", ...props }, ref) => {
    // Classes base compartilhadas por todas as variantes
    const baseStyles =
      "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 cursor-pointer select-none";

    // Mapeamento de variantes visuais
    const variants = {
      default:
        "bg-slate-900 text-white shadow hover:bg-slate-800 active:scale-[0.99]",
      outline:
        "border border-slate-200 bg-white shadow-sm hover:bg-slate-100 hover:text-slate-900",
      secondary:
        "bg-slate-100 text-slate-900 shadow-sm hover:bg-slate-200",
      ghost: "hover:bg-slate-100 hover:text-slate-900",
      destructive:
        "bg-red-500 text-white shadow-sm hover:bg-red-600",
    };

    // Mapeamento de tamanhos
    const sizes = {
      default: "h-10 px-4 py-2",
      sm: "h-8 rounded-md px-3 text-xs",
      lg: "h-11 rounded-md px-8 text-base",
      icon: "h-10 w-10",
    };

    return (
      <button
        ref={ref}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button };
