import { describe, it, expect, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { RouterProvider, createMemoryRouter } from "react-router";
import { Link, Outlet, useNavigate } from "react-router";

// Przykładowy komponent z przyciskiem nawigacyjnym
const NavigationButton = () => {
  return (
    <Link to="/about">
      <button>Go to About</button>
    </Link>
  );
};

// Przykładowe komponenty stron
const HomePage = () => (
  <div>
    <h1>Home Page</h1>
    <NavigationButton />
  </div>
);

const AboutPage = () => <h1>About Us</h1>;
const ContactPage = () => <h1>Contact Page</h1>;

// Komponent Layout
const Layout = () => (
  <div>
    <nav>
      <Link to="/">Home</Link>
      <Link to="/about">About</Link>
      <Link to="/contact">Contact</Link>
    </nav>
    <main>
      <Outlet />
    </main>
  </div>
);

describe("React Router 7 navigation testing", () => {
  it("renders the home page initially", () => {
    // Defining routes
    const routes = [
      {
        path: "/",
        element: <Layout />,
        children: [
          { index: true, element: <HomePage /> },
          { path: "about", element: <AboutPage /> },
          { path: "contact", element: <ContactPage /> },
        ],
      },
    ];

    // Creating router with initial path "/"
    const router = createMemoryRouter(routes, {
      initialEntries: ["/"],
    });

    // Rendering the application
    render(<RouterProvider router={router} />);

    // Check if we are on the home page
    expect(screen.getByText("Home Page")).toBeInTheDocument();
  });

  it("navigates to about page when clicked on navigation button", async () => {
    const user = userEvent.setup();

    // Defining routes
    const routes = [
      {
        path: "/",
        element: <Layout />,
        children: [
          { index: true, element: <HomePage /> },
          { path: "about", element: <AboutPage /> },
          { path: "contact", element: <ContactPage /> },
        ],
      },
    ];

    // Creating router with initial path "/"
    const router = createMemoryRouter(routes, {
      initialEntries: ["/"],
    });

    // Rendering the application
    render(<RouterProvider router={router} />);

    // Click on navigation button
    const button = screen.getByText("Go to About");
    await user.click(button);

    // Check if we are on the "About" page
    await waitFor(() => {
      expect(screen.getByText("About Us")).toBeInTheDocument();
    });
  });

  it("navigates to contact page when clicked on link", async () => {
    const user = userEvent.setup();

    const routes = [
      {
        path: "/",
        element: <Layout />,
        children: [
          { index: true, element: <HomePage /> },
          { path: "about", element: <AboutPage /> },
          { path: "contact", element: <ContactPage /> },
        ],
      },
    ];

    const router = createMemoryRouter(routes, {
      initialEntries: ["/"],
    });

    render(<RouterProvider router={router} />);

    const link = screen.getByText("Contact");
    await user.click(link);

    await waitFor(() => {
      expect(screen.getByText("Contact Page")).toBeInTheDocument();
    });
  });
});
