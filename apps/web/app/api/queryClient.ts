import { QueryClient } from "@tanstack/react-query";
import { isAxiosError, isCancel } from "axios";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
      refetchOnWindowFocus: false,
      refetchOnMount: true,
      throwOnError: true,
      retry(failureCount, error: unknown) {
        if (isCancel(error)) return false;

        if (isAxiosError(error) && error.response) return false;

        if (failureCount >= 3) return false;

        return true;
      },
    },
    mutations: {
      throwOnError: true,
      retry(failureCount, error: unknown) {
        if (isCancel(error)) return false;

        if (isAxiosError(error) && error.response) return false;

        if (failureCount >= 2) return false;

        return true;
      },
    },
  },
});
