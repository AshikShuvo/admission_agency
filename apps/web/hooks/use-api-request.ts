"use client";

import { useCallback, useState } from "react";

import {
  hasApiErrorToastBeenShown,
  markApiErrorToastShown,
  normalizeError,
  type ApiClientError
} from "@/lib/api/client";
import { useToast } from "@/components/ui/toast";

export type ApiRequestStatus = "error" | "idle" | "loading" | "success";

export interface UseApiRequestOptions {
  readonly showErrorToast?: boolean;
}

export interface UseApiRequestState<TData> {
  readonly data: TData | null;
  readonly error: ApiClientError | null;
  readonly isError: boolean;
  readonly isIdle: boolean;
  readonly isLoading: boolean;
  readonly isSuccess: boolean;
  readonly status: ApiRequestStatus;
}

export function useApiRequest<TArgs extends readonly unknown[], TData>(
  request: (...args: TArgs) => Promise<TData>,
  options: UseApiRequestOptions = {}
) {
  const { showErrorToast = true } = options;
  const toast = useToast();
  const [state, setState] = useState<UseApiRequestState<TData>>({
    data: null,
    error: null,
    isError: false,
    isIdle: true,
    isLoading: false,
    isSuccess: false,
    status: "idle"
  });

  const execute = useCallback(
    async (...args: TArgs): Promise<TData | null> => {
      setState({
        data: null,
        error: null,
        isError: false,
        isIdle: false,
        isLoading: true,
        isSuccess: false,
        status: "loading"
      });

      try {
        const data = await request(...args);

        setState({
          data,
          error: null,
          isError: false,
          isIdle: false,
          isLoading: false,
          isSuccess: true,
          status: "success"
        });

        return data;
      } catch (error) {
        const apiError = normalizeError(error);

        setState({
          data: null,
          error: apiError,
          isError: true,
          isIdle: false,
          isLoading: false,
          isSuccess: false,
          status: "error"
        });

        if (showErrorToast && !hasApiErrorToastBeenShown(apiError)) {
          toast.error(apiError.message);
          markApiErrorToastShown(apiError);
        }

        return null;
      }
    },
    [request, showErrorToast, toast]
  );

  const reset = useCallback(() => {
    setState({
      data: null,
      error: null,
      isError: false,
      isIdle: true,
      isLoading: false,
      isSuccess: false,
      status: "idle"
    });
  }, []);

  return {
    ...state,
    execute,
    reset
  };
}
