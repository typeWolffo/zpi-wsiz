import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { toast } from "sonner";

import { ApiClient } from "../api-client";
import type { CreatePasswordBody, ResetPasswordBody } from "../generated-api";

type CreatePasswordOptions = {
  data: CreatePasswordBody;
};

type ResetPasswordOptions = {
  data: ResetPasswordBody;
};

export function useCreatePassword() {
  return useMutation({
    mutationFn: async (options: CreatePasswordOptions) => {
      const response = await ApiClient.api.authControllerCreatePassword(options.data);
      return response.data;
    },
    onSuccess: () => {
      toast.success("Hasło zostało utworzone pomyślnie. Możesz się teraz zalogować.");
    },
    onError: (error) => {
      if (error instanceof AxiosError) {
        return toast.error(
          error.response?.data.message || "Wystąpił problem podczas tworzenia hasła",
        );
      }
      toast.error(error.message || "Wystąpił problem podczas tworzenia hasła");
    },
  });
}

export function useResetPassword() {
  return useMutation({
    mutationFn: async (options: ResetPasswordOptions) => {
      const response = await ApiClient.api.authControllerResetPassword(options.data);
      return response.data;
    },
    onSuccess: () => {
      toast.success("Hasło zostało zresetowane pomyślnie. Możesz się teraz zalogować.");
    },
    onError: (error) => {
      if (error instanceof AxiosError) {
        return toast.error(
          error.response?.data.message || "Wystąpił problem podczas resetowania hasła",
        );
      }
      toast.error(error.message || "Wystąpił problem podczas resetowania hasła");
    },
  });
}
