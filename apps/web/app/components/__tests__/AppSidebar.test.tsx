import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { AppSidebar } from "../AppSidebar/AppSidebar";
import { SidebarProvider } from "~/components/ui/sidebar";
import userEvent from "@testing-library/user-event";

const mockNavigate = vi.fn();

vi.mock("react-router", () => {
  return {
    NavLink: ({
      to,
      className,
      children,
    }: {
      to: string;
      className: ((props: { isActive: boolean }) => string) | string;
      children: React.ReactNode;
    }) => {
      const isActive = to === "/clients";
      return (
        <a
          href={to}
          className={typeof className === "function" ? className({ isActive }) : className}
          data-testid={`navlink-${to.replace(/\//g, "")}`}
          onClick={(e) => {
            e.preventDefault();
            mockNavigate(to);
          }}
        >
          {children}
        </a>
      );
    },
    useNavigate: () => mockNavigate,
  };
});

vi.mock("~/store/useCurrentUserStore", () => ({
  useCurrentUserStore: (selector: (state: any) => any) => {
    const mockStore = {
      currentUser: {
        id: "user-1",
        role: "admin",
        firstName: "Test",
        lastName: "User",
        email: "test@example.com",
      },
      setCurrentUser: vi.fn(),
    };
    return selector(mockStore);
  },
}));

vi.mock("~/api/mutations/useLogoutUser", () => ({
  useLogoutUser: () => ({
    mutate: mockNavigate,
    isPending: false,
  }),
}));

describe("AppSidebar", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders sidebar with navigation links", () => {
    render(
      <SidebarProvider>
        <AppSidebar />
      </SidebarProvider>,
    );

    expect(screen.getByText("Schedule")).toBeInTheDocument();
    expect(screen.getByText("Clients")).toBeInTheDocument();
    expect(screen.getByText("Mechanics")).toBeInTheDocument();
    expect(screen.getByText("Vehicles")).toBeInTheDocument();
  });

  it("applies active styling to current route link", () => {
    const { container } = render(
      <SidebarProvider>
        <AppSidebar />
      </SidebarProvider>,
    );

    const activeLinks = container.querySelectorAll(".bg-primary");
    expect(activeLinks.length).toBeGreaterThan(0);

    const activeLink = Array.from(activeLinks).find((el) => el.textContent?.includes("Clients"));
    expect(activeLink).toBeTruthy();
  });

  it("navigates to correct routes when links are clicked", async () => {
    const user = userEvent.setup();

    render(
      <SidebarProvider>
        <AppSidebar />
      </SidebarProvider>,
    );

    await user.click(screen.getByText("Clients"));
    expect(mockNavigate).toHaveBeenCalledWith("/clients");

    await user.click(screen.getByText("Mechanics"));
    expect(mockNavigate).toHaveBeenCalledWith("/mechanics");
  });
});
