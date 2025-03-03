import { useQuery, useSuspenseQuery } from "@tanstack/react-query";
import { ApiClient } from "../api-client";
import type { GetMechanicsResponse } from "../generated-api";

export const mechanicQueryOptions = {
  queryKey: ["mechanics"],
  queryFn: async () => {
    const response = await ApiClient.api.mechanicControllerGetMechanics();
    return response.data;
  },
  select: (data: GetMechanicsResponse) => data.data,
};

export function useMechanic() {
  return useQuery(mechanicQueryOptions);
}

export function useMechanicSuspense() {
  return useSuspenseQuery(mechanicQueryOptions);
}
