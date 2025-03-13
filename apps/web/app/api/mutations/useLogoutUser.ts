import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";

import { requestManager, ApiClient } from "../api-client";
import { queryClient } from "../queryClient";
import { useAuthStore } from "~/store/authStore";
import { useNavigate } from "react-router";
import { currentUserQueryOptions } from "../queries/useCurrentUser";
import { useCurrentUserStore } from "~/store/useCurrentUserStore";

export function useLogoutUser() {
  const { setLoggedIn } = useAuthStore();
  const navigate = useNavigate();
  const { setCurrentUser } = useCurrentUserStore();

  return useMutation({
    mutationFn: async () => {
      requestManager.abortAll();

      const response = await ApiClient.api.authControllerLogout();
      setLoggedIn(false);
      return response.data;
    },
    onSuccess: () => {
      queryClient.cancelQueries(currentUserQueryOptions);
      queryClient.clear();
      setCurrentUser(undefined);
      navigate("/login");
    },
    onError: (error) => {
      if (error instanceof AxiosError) {
        alert(error.response?.data.message);
      }

      return alert(error.message);
    },
  });
}
