import { useQuery, useSuspenseQuery } from "@tanstack/react-query";
import { ApiClient } from "../api-client";
import type { GetCustomersResponse } from "../generated-api";

export const customersQueryOptions = {
  queryKey: ["customers"],
  queryFn: async () => {
    const response = await ApiClient.api.customerControllerGetCustomers();
    return response.data;
  },
};

export const customerByIdQueryOptions = (id: string) => ({
  queryKey: ["customers", id],
  queryFn: async () => {
    const response = await ApiClient.api.customerControllerGetCustomerById(id);
    return response.data;
  },
});

export function useCustomers() {
  return useQuery({
    ...customersQueryOptions,
    select: (data: GetCustomersResponse) => data.data,
  });
}

export function useCustomerById(id: string) {
  return useQuery({
    ...customerByIdQueryOptions(id),
    enabled: !!id,
  });
}

export function useCustomersSuspense() {
  return useSuspenseQuery({
    ...customersQueryOptions,
    select: (data: GetCustomersResponse) => data.data,
  });
}
