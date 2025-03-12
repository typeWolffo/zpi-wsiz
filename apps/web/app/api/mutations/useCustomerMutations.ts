import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { toast } from "sonner";

import { ApiClient } from "../api-client";
import type { CreateCustomerBody, UpdateCustomerBody } from "../generated-api";

type CreateCustomerOptions = {
  data: CreateCustomerBody;
};

type UpdateCustomerOptions = {
  id: string;
  data: UpdateCustomerBody;
};

export function useCreateCustomer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (options: CreateCustomerOptions) => {
      const response = await ApiClient.api.customerControllerCreateCustomer(options.data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      toast.success("Successfully created customer");
    },
    onError: (error) => {
      if (error instanceof AxiosError) {
        return toast.error(error.response?.data.message || "Error creating customer");
      }
      toast.error(error.message || "Error creating customer");
    },
  });
}

export function useUpdateCustomer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (options: UpdateCustomerOptions) => {
      const response = await ApiClient.api.customerControllerUpdateCustomer(
        options.id,
        options.data,
      );
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      queryClient.invalidateQueries({ queryKey: ["customers", variables.id] });
      toast.success("Successfully updated customer");
    },
    onError: (error) => {
      if (error instanceof AxiosError) {
        return toast.error(error.response?.data.message || "Error updating customer");
      }
      toast.error(error.message || "Error updating customer");
    },
  });
}

export function useDeleteCustomer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await ApiClient.api.customerControllerDeleteCustomer(id);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      toast.success("Successfully deleted customer");
    },
    onError: (error) => {
      if (error instanceof AxiosError) {
        return toast.error(error.response?.data.message || "Error deleting customer");
      }
      toast.error(error.message || "Error deleting customer");
    },
  });
}
