import { useQuery, useSuspenseQuery } from "@tanstack/react-query";
import { ApiClient } from "../api-client";
import type { GetMechanicsResponse } from "../generated-api";

export const mechanicQueryOptions = {
  queryKey: ["mechanics"],
  queryFn: async () => {
    const response = await ApiClient.api.mechanicControllerGetMechanics();
    return response.data;
  },
};

export const mechanicByIdQueryOptions = (id: string) => ({
  queryKey: ["mechanics", id],
  queryFn: async () => {
    const response = await ApiClient.api.mechanicControllerGetMechanicById(id);
    return response.data;
  },
});

export function useMechanics() {
  return useQuery({
    ...mechanicQueryOptions,
    select: (data: GetMechanicsResponse) => data.data,
  });
}

export function useMechanicById(id: string) {
  return useQuery({
    ...mechanicByIdQueryOptions(id),
    enabled: !!id,
  });
}

export function useMechanicsSuspense() {
  return useSuspenseQuery({
    ...mechanicQueryOptions,
    select: (data: GetMechanicsResponse) => data.data,
  });
}
