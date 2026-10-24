"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { PeopleService, ServiceError } from "@/services/people.service";
import type { PeoplePage, PersonStatus } from "@/types/person.types";

export function usePeople(
  initialData: PeoplePage | null,
  initialError?: string,
) {
  const router = useRouter();
  const [data, setData] = useState(initialData);
  const [error, setError] = useState(initialError || "");
  const [isLoading, setIsLoading] = useState(false);
  const [filters, setFilters] = useState<{
    search: string;
    status: PersonStatus | "all";
    page: number;
  }>({ search: "", status: "all", page: 1 });
  const [revision, setRevision] = useState(0);
  const firstRequest = useRef(true);

  useEffect(() => {
    if (firstRequest.current) {
      firstRequest.current = false;
      return;
    }

    const controller = new AbortController();
    const timer = setTimeout(async () => {
      setIsLoading(true);
      setError("");

      try {
        const result = await PeopleService.list(filters, controller.signal);
        if (controller.signal.aborted) return;
        const lastPage = Math.max(1, Math.ceil(result.total / result.pageSize));

        if (filters.page > lastPage) {
          setFilters((current) => ({ ...current, page: lastPage }));
        } else {
          setData(result);
        }
      } catch (failure) {
        if (controller.signal.aborted) return;
        if (failure instanceof ServiceError && failure.status === 401) {
          router.replace("/login");
          return;
        }
        setError(
          failure instanceof ServiceError
            ? failure.message
            : "Não foi possível conectar ao servidor. Tente novamente.",
        );
      } finally {
        if (!controller.signal.aborted) setIsLoading(false);
      }
    }, 250);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [filters, revision, router]);

  function updateFilters(change: Partial<typeof filters>) {
    setIsLoading(true);
    setFilters((current) => ({ ...current, ...change }));
  }

  function reload() {
    setIsLoading(true);
    setRevision((current) => current + 1);
  }

  return { data, error, isLoading, filters, updateFilters, reload };
}
