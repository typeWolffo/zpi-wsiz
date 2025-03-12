import { useQuery, useSuspenseQuery } from "@tanstack/react-query";
import { ApiClient } from "../api-client";
import type { GetRepairOrdersResponse } from "../generated-api";

export const ordersQueryOptions = {
  queryKey: ["orders"],
  queryFn: async () => {
    const response = await ApiClient.api.repairOrderControllerGetRepairOrders();
    return response.data;
  },
  select: (data: GetRepairOrdersResponse) => data.data,
};

export function useOrders() {
  return useQuery(ordersQueryOptions);
}

export function useOrdersSuspense() {
  return useSuspenseQuery(ordersQueryOptions);
}
