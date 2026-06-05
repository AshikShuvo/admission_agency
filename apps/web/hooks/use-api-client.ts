"use client";

import { useMemo } from "react";

import { createApiClient, markApiErrorToastShown, type ApiClientOptions } from "@/lib/api/client";
import { useToast } from "@/components/ui/toast";

export interface UseApiClientOptions extends Omit<ApiClientOptions, "onError"> {
  readonly showErrorToast?: boolean;
}

export function useApiClient({
  baseUrl,
  fetcher,
  getToken,
  showErrorToast = false
}: UseApiClientOptions = {}) {
  const toast = useToast();

  return useMemo(
    () =>
      createApiClient({
        baseUrl,
        fetcher,
        getToken,
        onError: showErrorToast
          ? (error) => {
              toast.error(error.message);
              markApiErrorToastShown(error);
            }
          : undefined
      }),
    [baseUrl, fetcher, getToken, showErrorToast, toast]
  );
}
