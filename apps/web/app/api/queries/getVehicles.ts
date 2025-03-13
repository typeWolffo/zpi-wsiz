import { useQuery, useSuspenseQuery } from "@tanstack/react-query";
import { ApiClient } from "../api-client";
import type { GetVehiclesResponse } from "../generated-api";

export const vehiclesQueryOptions = {
  queryKey: ["vehicles"],
  queryFn: async () => {
    const response = await ApiClient.api.vehicleControllerGetVehicles();
    return response.data;
  },
};

export const vehicleByIdQueryOptions = (id: string) => ({
  queryKey: ["vehicles", id],
  queryFn: async () => {
    const response = await ApiClient.api.vehicleControllerGetVehicleById(id);
    return response.data;
  },
});

export const vehiclesByCustomerIdQueryOptions = (customerId: string) => ({
  queryKey: ["vehicles", "customer", customerId],
  queryFn: async () => {
    const response = await ApiClient.api.vehicleControllerGetVehiclesByCustomerId(customerId);
    return response.data;
  },
});

export function useVehicles() {
  return useQuery({
    ...vehiclesQueryOptions,
    select: (data: GetVehiclesResponse) => data.data,
  });
}

export function useVehicleById(id: string) {
  return useQuery({
    ...vehicleByIdQueryOptions(id),
    enabled: !!id,
  });
}

export function useVehiclesByCustomerId(customerId: string) {
  return useQuery({
    ...vehiclesByCustomerIdQueryOptions(customerId),
    enabled: !!customerId,
  });
}

export function useVehiclesSuspense() {
  return useSuspenseQuery({
    ...vehiclesQueryOptions,
    select: (data: GetVehiclesResponse) => data.data,
  });
}

export function useVehicleByIdSuspense(id: string) {
  if (!id) {
    throw new Error("Vehicle ID is required");
  }

  return useSuspenseQuery({
    ...vehicleByIdQueryOptions(id),
  });
}

export function useVehiclesByCustomerIdSuspense(customerId: string) {
  if (!customerId) {
    throw new Error("Customer ID is required");
  }

  return useSuspenseQuery({
    ...vehiclesByCustomerIdQueryOptions(customerId),
  });
}
