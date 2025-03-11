import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { toast } from "sonner";

import { ApiClient } from "../api-client";
import type { CreateMechanicBody, UpdateMechanicBody, CreateUserBody } from "../generated-api";

type CreateMechanicOptions = {
  data: CreateMechanicBody;
};

type UpdateMechanicOptions = {
  id: string;
  data: UpdateMechanicBody;
};

// Define a type for creating a user and mechanic together
type CreateUserAndMechanicOptions = {
  user: CreateUserBody;
  mechanic: Omit<CreateMechanicBody, "userId">;
};

export function useCreateMechanic() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (options: CreateMechanicOptions) => {
      const response = await ApiClient.api.mechanicControllerCreateMechanic(options.data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["mechanics"] });
      toast.success("Successfully created mechanic");
    },
    onError: (error) => {
      if (error instanceof AxiosError) {
        return toast.error(error.response?.data.message || "Error creating mechanic");
      }
      toast.error(error.message || "Error creating mechanic");
    },
  });
}

export function useCreateUserAndMechanic() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (options: CreateUserAndMechanicOptions) => {
      // Step 1: Create the user
      const userResponse = await ApiClient.api.userControllerCreateUser(options.user);
      const userId = userResponse.data.data.id;

      // Step 2: Create the mechanic with the new user ID
      const mechanicResponse = await ApiClient.api.mechanicControllerCreateMechanic({
        ...options.mechanic,
        userId,
      });

      return {
        user: userResponse.data,
        mechanic: mechanicResponse.data,
      };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["mechanics"] });
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success("Successfully created user and mechanic");
    },
    onError: (error) => {
      if (error instanceof AxiosError) {
        return toast.error(error.response?.data.message || "Error creating user and mechanic");
      }
      toast.error(error.message || "Error creating user and mechanic");
    },
  });
}

export function useUpdateMechanic() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (options: UpdateMechanicOptions) => {
      const response = await ApiClient.api.mechanicControllerUpdateMechanic(
        options.id,
        options.data,
      );
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["mechanics"] });
      queryClient.invalidateQueries({ queryKey: ["mechanics", variables.id] });
      toast.success("Successfully updated mechanic");
    },
    onError: (error) => {
      if (error instanceof AxiosError) {
        return toast.error(error.response?.data.message || "Error updating mechanic");
      }
      toast.error(error.message || "Error updating mechanic");
    },
  });
}

export function useDeleteMechanic() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await ApiClient.api.mechanicControllerDeleteMechanic(id);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["mechanics"] });
      toast.success("Successfully deleted mechanic");
    },
    onError: (error) => {
      if (error instanceof AxiosError) {
        return toast.error(error.response?.data.message || "Error deleting mechanic");
      }
      toast.error(error.message || "Error deleting mechanic");
    },
  });
}
