import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * ============================================================================
 * COMPONENTE UI: Label (shadcn/ui pattern)
 * ============================================================================
 * 
 * Conceitos importantes para a aula:
 * 1. Semântica HTML: O uso da tag <label> associada via `htmlFor` ao `id`
 *    do <input> melhora a acessibilidade (leitores de tela) e usabilidade.
 */

const Label = React.forwardRef<
  HTMLLabelElement,
  React.LabelHTMLAttributes<HTMLLabelElement>
>(({ className, ...props }, ref) => (
  <label
    ref={ref}
    className={cn(
      "text-sm font-medium leading-none text-slate-900 peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
      className
    )}
    {...props}
  />
));
Label.displayName = "Label";

export { Label };
