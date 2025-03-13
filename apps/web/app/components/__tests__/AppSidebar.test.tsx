import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { AppSidebar } from "../AppSidebar/AppSidebar";
import { SidebarProvider } from "~/components/ui/sidebar";
import userEvent from "@testing-library/user-event";

// Tworzymy mock dla funkcji nawigacji
const mockNavigate = vi.fn();

// Mock dla react-router
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
      const isActive = to === "/clients"; // Symulujemy, że "/clients" jest aktywną ścieżką
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
  };
});

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

    // Sprawdź, czy wszystkie linki nawigacyjne są renderowane
    expect(screen.getByText("Home")).toBeInTheDocument();
    expect(screen.getByText("Clients")).toBeInTheDocument();
    expect(screen.getByText("Mechanics")).toBeInTheDocument();
    expect(screen.getByText("Vehicles")).toBeInTheDocument();
    expect(screen.getByText("Settings")).toBeInTheDocument();
  });

  it("applies active styling to current route link", () => {
    const { container } = render(
      <SidebarProvider>
        <AppSidebar />
      </SidebarProvider>,
    );

    // Znajdź aktywny link (z klasą bg-primary)
    const activeLinks = container.querySelectorAll(".bg-primary");
    expect(activeLinks.length).toBe(1);

    // Sprawdź, czy aktywny link ma tekst "Clients"
    const activeLink = Array.from(activeLinks).find((el) => el.textContent?.includes("Clients"));
    expect(activeLink).toBeTruthy();

    // Sprawdź, czy inne linki nie mają klasy active
    const homeLink = Array.from(container.querySelectorAll("a")).find(
      (el) => el.textContent === "Home",
    );
    expect(homeLink).not.toHaveClass("bg-primary");
  });

  it("navigates to correct routes when links are clicked", async () => {
    const user = userEvent.setup();

    render(
      <SidebarProvider>
        <AppSidebar />
      </SidebarProvider>,
    );

    // Kliknij link "Clients"
    await user.click(screen.getByText("Clients"));
    expect(mockNavigate).toHaveBeenCalledWith("/clients");

    // Kliknij link "Mechanics"
    await user.click(screen.getByText("Mechanics"));
    expect(mockNavigate).toHaveBeenCalledWith("/mechanics");
  });
});
