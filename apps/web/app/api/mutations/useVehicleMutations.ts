import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { toast } from "sonner";

import { ApiClient } from "../api-client";
import type { CreateVehicleBody, UpdateVehicleBody } from "../generated-api";

type CreateVehicleOptions = {
  data: CreateVehicleBody;
};

type UpdateVehicleOptions = {
  id: string;
  data: UpdateVehicleBody;
};

export function useCreateVehicle() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (options: CreateVehicleOptions) => {
      const response = await ApiClient.api.vehicleControllerCreateVehicle(options.data);
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["vehicles"] });
      if (variables.data.customerId) {
        queryClient.invalidateQueries({
          queryKey: ["vehicles", "customer", variables.data.customerId],
        });
      }
      toast.success("Successfully created vehicle");
    },
    onError: (error) => {
      if (error instanceof AxiosError) {
        return toast.error(error.response?.data.message || "Error creating vehicle");
      }
      toast.error(error.message || "Error creating vehicle");
    },
  });
}

export function useUpdateVehicle() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (options: UpdateVehicleOptions) => {
      const response = await ApiClient.api.vehicleControllerUpdateVehicle(options.id, options.data);
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["vehicles"] });
      queryClient.invalidateQueries({ queryKey: ["vehicles", variables.id] });
      if (variables.data.customerId) {
        queryClient.invalidateQueries({
          queryKey: ["vehicles", "customer", variables.data.customerId],
        });
      }
      toast.success("Successfully updated vehicle");
    },
    onError: (error) => {
      if (error instanceof AxiosError) {
        return toast.error(error.response?.data.message || "Error updating vehicle");
      }
      toast.error(error.message || "Error updating vehicle");
    },
  });
}

export function useDeleteVehicle() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await ApiClient.api.vehicleControllerDeleteVehicle(id);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vehicles"] });
      toast.success("Successfully deleted vehicle");
    },
    onError: (error) => {
      if (error instanceof AxiosError) {
        return toast.error(error.response?.data.message || "Error deleting vehicle");
      }
      toast.error(error.message || "Error deleting vehicle");
    },
  });
}
