import { useAuthStore } from "~/store/authStore";
import { useCurrentUserStore } from "~/store/useCurrentUserStore";
import { API } from "./generated-api";
import { queryClient } from "./queryClient";

export const requestManager = {
  controller: new AbortController(),

  abortAll() {
    this.controller.abort();
  },
};

export const ApiClient = new API({
  baseURL: import.meta.env.MODE === "test" ? "http://localhost:3000" : import.meta.env.VITE_APP_URL,
  secure: true,
  withCredentials: true,
});

ApiClient.instance.interceptors.request.use((config) => {
  const isAuthEndpoint =
    config.url?.includes("/login") ||
    config.url?.includes("/refresh") ||
    config.url?.includes("/forgot-password") ||
    config.url?.includes("/register");

  if (!isAuthEndpoint && !useAuthStore.getState().isLoggedIn) {
    config.signal = requestManager.controller.signal;
  }

  return config;
});

ApiClient.instance.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.config?.url?.includes("/logout")) {
      return Promise.reject(error);
    }

    if (error.config?.url?.includes("/refresh") && error.response?.status === 403) {
      useAuthStore.getState().setLoggedIn(false);

      useCurrentUserStore.getState().setCurrentUser(undefined);

      queryClient.clear();

      requestManager.abortAll();

      window.location.href = "/login";

      return Promise.reject(error);
    }

    if (
      error.response?.status === 401 &&
      !error.config._retry &&
      useAuthStore.getState().isLoggedIn
    ) {
      error.config._retry = true;
      try {
        await ApiClient.api.authControllerRefreshTokens();
        return ApiClient.instance(error.config);
      } catch {
        requestManager.abortAll();
        return Promise.reject(error);
      }
    }
    return Promise.reject(error);
  },
);
