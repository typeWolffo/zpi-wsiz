import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ApiClient } from "~/api/api-client";

export function useCustomerVehicleData(initialCustomerId?: string) {
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | undefined>(
    initialCustomerId,
  );

  const { data: customersResponse, isLoading: isLoadingCustomers } = useQuery({
    queryKey: ["customers"],
    queryFn: async () => {
      const response = await ApiClient.api.customerControllerGetCustomers();
      return response.data;
    },
  });

  const customers = Array.isArray(customersResponse?.data) ? customersResponse?.data : [];

  const { data: vehiclesResponse, isLoading: isLoadingVehicles } = useQuery({
    queryKey: ["vehicles", selectedCustomerId],
    queryFn: async () => {
      if (!selectedCustomerId) return null;
      const response =
        await ApiClient.api.vehicleControllerGetVehiclesByCustomerId(selectedCustomerId);
      return response.data;
    },
    enabled: !!selectedCustomerId,
  });

  const vehicles = Array.isArray(vehiclesResponse?.data) ? vehiclesResponse?.data : [];

  return {
    customers,
    vehicles,
    selectedCustomerId,
    setSelectedCustomerId,
    isLoading: isLoadingCustomers || isLoadingVehicles,
  };
}
