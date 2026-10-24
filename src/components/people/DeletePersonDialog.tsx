"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { LoaderCircle, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PeopleService, ServiceError } from "@/services/people.service";
import type { Person } from "@/types/person.types";

export function DeletePersonDialog({
  person,
  onClose,
  onDeleted,
}: {
  person: Person;
  onClose: () => void;
  onDeleted: () => void;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const dialog = dialogRef.current;
    dialog?.showModal();
    return () => dialog?.close();
  }, []);

  async function confirmDelete() {
    if (isDeleting) return;
    setIsDeleting(true);
    setError("");

    try {
      await PeopleService.delete(person.id);
      onDeleted();
    } catch (failure) {
      if (failure instanceof ServiceError && failure.status === 401)
        router.replace("/login");
      setError(
        failure instanceof ServiceError
          ? failure.message
          : "Não foi possível excluir a pessoa. Tente novamente.",
      );
      setIsDeleting(false);
    }
  }

  return (
    <dialog
      ref={dialogRef}
      className="delete-dialog"
      aria-labelledby="delete-title"
      aria-describedby="delete-description"
      onCancel={(event) => {
        event.preventDefault();
        if (!isDeleting) onClose();
      }}
    >
      <div className="dialog-content">
        <span className="dialog-icon">
          <Trash2 size={24} />
        </span>
        <h2 id="delete-title">Excluir pessoa?</h2>
        <p id="delete-description">
          O cadastro de <strong>{person.name}</strong> será excluído. Esta ação
          não pode ser desfeita.
        </p>
        {error && (
          <p className="dialog-error" role="alert">
            {error}
          </p>
        )}
        <div className="dialog-actions">
          <Button variant="outline" disabled={isDeleting} onClick={onClose}>
            Cancelar
          </Button>
          <Button
            variant="destructive"
            disabled={isDeleting}
            onClick={confirmDelete}
          >
            {isDeleting ? (
              <LoaderCircle size={16} className="spin" />
            ) : (
              <Trash2 size={16} />
            )}
            {isDeleting ? "Excluindo..." : "Excluir pessoa"}
          </Button>
        </div>
      </div>
    </dialog>
  );
}
