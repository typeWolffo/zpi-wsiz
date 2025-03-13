import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";

import { requestManager, ApiClient } from "../api-client";
import { queryClient } from "../queryClient";
import { useAuthStore } from "~/store/authStore";
import { useNavigate } from "react-router";
import { currentUserQueryOptions } from "../queries/useCurrentUser";

export function useLogoutUser() {
  const { setLoggedIn } = useAuthStore();
  const navigate = useNavigate();

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
      navigate("/auth/login");
    },
    onError: (error) => {
      if (error instanceof AxiosError) {
        
        
        
        
        alert(error.response?.data.message);
      }
      
      
      
      
      return alert(error.message);
    },
  });
}
