"use client";

import { AlertCircle, RotateCw } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "./button";

export function DataError({
  message,
  onRetry,
}: {
  message: string;
  onRetry?: () => void;
}) {
  const router = useRouter();

  return (
    <div className="data-state data-state--error" role="alert">
      <span className="data-state-icon">
        <AlertCircle size={25} />
      </span>
      <h2>Não foi possível carregar os dados</h2>
      <p>{message}</p>
      <Button variant="outline" onClick={onRetry ?? (() => router.refresh())}>
        <RotateCw size={16} />
        Tentar novamente
      </Button>
    </div>
  );
}
