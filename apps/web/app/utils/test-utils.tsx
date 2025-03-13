import { type PropsWithChildren, type ReactElement } from "react";
import { createMemoryRouter, RouterProvider, type RouteObject } from "react-router";
import { render, type RenderOptions } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SidebarProvider } from "~/components/ui/sidebar";


const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });


interface RouterRenderOptions extends Omit<RenderOptions, "wrapper"> {
  routerOptions?: {
    initialEntries?: string[];
    initialIndex?: number;
    routes?: RouteObject[];
    basename?: string;
  };
  withSidebar?: boolean;
}


export function renderWithRouter(
  ui: ReactElement,
  { routerOptions = {}, withSidebar = false, ...renderOptions }: RouterRenderOptions = {},
) {
  const queryClient = createTestQueryClient();

  
  const routes: RouteObject[] = routerOptions.routes || [
    {
      path: "/",
      element: ui,
    },
  ];

  
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

  
  return {
    ...render(ui, { wrapper: Wrapper, ...renderOptions }),
    router,
    user: userEvent.setup(),
  };
}


export * from "@testing-library/react";
export { userEvent };
