import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ApiClient } from "~/api/api-client";

export function useCustomerVehicleData(initialCustomerId?: string) {
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | undefined>(
    initialCustomerId,
  );

  const { data: customers } = useQuery({
    queryKey: ["customers"],
    queryFn: async () => {
      const response = await ApiClient.api.customerControllerGetCustomers();
      return response.data.data;
    },
  });

  const { data: vehicles } = useQuery({
    queryKey: ["vehicles", selectedCustomerId],
    queryFn: async () => {
      if (!selectedCustomerId) return null;
      const response =
        await ApiClient.api.vehicleControllerGetVehiclesByCustomerId(selectedCustomerId);
      return response.data.data;
    },
    enabled: !!selectedCustomerId,
  });

  return {
    customers,
    vehicles,
    selectedCustomerId,
    setSelectedCustomerId,
  };
}
