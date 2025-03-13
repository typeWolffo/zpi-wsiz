import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { toast } from "sonner";

import { ApiClient } from "../api-client";
import type { ForgotPasswordBody } from "../generated-api";

type ForgotPasswordOptions = {
  data: ForgotPasswordBody;
};

export function useForgotPassword() {
  return useMutation({
    mutationFn: async (options: ForgotPasswordOptions) => {
      const response = await ApiClient.api.authControllerForgotPassword(options.data);
      return response.data;
    },
    onSuccess: () => {
      toast.success(
        "Link do resetowania hasła został wysłany na podany adres email. Sprawdź swoją skrzynkę odbiorczą.",
      );
    },
    onError: (error) => {
      if (error instanceof AxiosError) {
        return toast.error(
          error.response?.data.message || "Wystąpił problem z wysłaniem linku resetującego hasło",
        );
      }
      toast.error(error.message || "Wystąpił problem z wysłaniem linku resetującego hasło");
    },
  });
}
