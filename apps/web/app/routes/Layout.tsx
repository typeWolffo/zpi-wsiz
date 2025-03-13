import { Outlet, useLocation, useNavigate } from "react-router";
import { AppSidebar } from "~/components/AppSidebar/AppSidebar";
import { SidebarProvider, SidebarTrigger } from "~/components/ui/sidebar";
import React, { Suspense, useEffect } from "react";
import { useAuthStore } from "~/store/authStore";
import { requestManager } from "~/api/api-client";
import { useCurrentUserStore } from "~/store/useCurrentUserStore";

class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean }> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error) {
    console.error("Route error:", error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex h-screen items-center justify-center">
          <div className="rounded-md bg-red-50 p-4 text-center">
            <h3 className="text-lg font-medium text-red-800">Something went wrong</h3>
            <p className="mt-2 text-sm text-red-700">
              An error occurred while loading this page. Try refreshing or navigating back.
            </p>
            <button
              className="mt-4 rounded-md bg-red-100 px-4 py-2 text-sm font-medium text-red-800 hover:bg-red-200"
              onClick={() => this.setState({ hasError: false })}
            >
              Try again
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default function Layout() {
  const navigate = useNavigate();
  const location = useLocation();
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn);
  const currentUser = useCurrentUserStore((state) => state.currentUser);

  useEffect(() => {
    if (!isLoggedIn) {
      requestManager.abortAll();
      navigate("/login");
      return;
    }

    if (currentUser?.role === "employee") {
      const currentPath = location.pathname;

      if (currentPath !== "/" && currentPath !== "/home") {
        navigate("/");
      }
    }
  }, [isLoggedIn, currentUser, navigate, location.pathname]);

  if (!isLoggedIn) {
    return <div className="flex justify-center p-8">Redirecting to login...</div>;
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <main className="flex h-screen w-full">
        <SidebarTrigger />
        <ErrorBoundary>
          <Suspense fallback={<div className="flex justify-center p-8">Loading page...</div>}>
            <Outlet />
          </Suspense>
        </ErrorBoundary>
      </main>
    </SidebarProvider>
  );
}
