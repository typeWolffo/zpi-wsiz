import { type PropsWithChildren, type ReactElement } from "react";
import { createMemoryRouter, RouterProvider, type RouteObject } from "react-router";
import { render, type RenderOptions } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SidebarProvider } from "~/components/ui/sidebar";

// Konfiguracja domyślnego klienta Query dla testów
const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

// Interfejs dla opcji renderowania z React Router
interface RouterRenderOptions extends Omit<RenderOptions, "wrapper"> {
  routerOptions?: {
    initialEntries?: string[];
    initialIndex?: number;
    routes?: RouteObject[];
    basename?: string;
  };
  withSidebar?: boolean;
}

// Funkcja do renderowania komponentu w środowisku testowym z React Router 7
export function renderWithRouter(
  ui: ReactElement,
  { routerOptions = {}, withSidebar = false, ...renderOptions }: RouterRenderOptions = {},
) {
  const queryClient = createTestQueryClient();

  // Tworzenie podstawowych tras do testów jeśli nie podano tras
  const routes: RouteObject[] = routerOptions.routes || [
    {
      path: "/",
      element: ui,
    },
  ];

  // Tworzenie routera w trybie pamięci
  const router = createMemoryRouter(routes, {
    initialEntries: routerOptions.initialEntries || ["/"],
    initialIndex: routerOptions.initialIndex || 0,
    basename: routerOptions.basename,
  });

  function Wrapper({ children }: PropsWithChildren<{}>): ReactElement {
    return (
      <QueryClientProvider client={queryClient}>
        {withSidebar ? <SidebarProvider>{children}</SidebarProvider> : children}
      </QueryClientProvider>
    );
  }

  // Renderuj RouterProvider dla podanego ui
  if (ui === routes[0].element) {
    return {
      ...render(
        <QueryClientProvider client={queryClient}>
          {withSidebar ? (
            <SidebarProvider>
              <RouterProvider router={router} />
            </SidebarProvider>
          ) : (
            <RouterProvider router={router} />
          )}
        </QueryClientProvider>,
        renderOptions,
      ),
      router,
      user: userEvent.setup(),
    };
  }

  // Renderuj ui z wrapperem dla komponentów nie będących top-level route
  return {
    ...render(ui, { wrapper: Wrapper, ...renderOptions }),
    router,
    user: userEvent.setup(),
  };
}

// Eksportujemy wszystko z testing-library
export * from "@testing-library/react";
export { userEvent };
