import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";

import { ApiClient } from "../api-client";

import type { LoginBody } from "../generated-api";
import { useAuthStore } from "~/store/authStore";
import { useCurrentUserStore } from "~/store/useCurrentUserStore";

type LoginUserOptions = {
  data: LoginBody;
};

export function useLoginUser() {
  const setLoggedIn = useAuthStore((state) => state.setLoggedIn);
  const setCurrentUser = useCurrentUserStore(({ setCurrentUser }) => setCurrentUser);

  return useMutation({
    mutationFn: async (options: LoginUserOptions) => {
      const response = await ApiClient.api.authControllerLogin(options.data);

      return response.data;
    },
    onSuccess: ({ data }) => {
      setLoggedIn(true);
      setCurrentUser(data);
    },
    onError: (error) => {
      if (error instanceof AxiosError) {
        if (error.response?.status === 401) {
          alert("Invalid credentials");
        }
        alert(error.response?.data.message);
      }
      return alert(error.message);
    },
  });
}
