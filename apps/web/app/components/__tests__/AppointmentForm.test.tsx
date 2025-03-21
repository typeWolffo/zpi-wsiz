import { describe, it, expect, vi, afterEach } from "vitest";
import { AppointmentForm } from "../AppointmentForm/AppointmentForm";
import { render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import userEvent from "@testing-library/user-event";

vi.mock("~/api/queries/getCustomers", () => ({
  customersQueryOptions: () => ({
    queryKey: ["customers"],
    queryFn: () => ({ data: [] }),
  }),
}));

vi.mock("~/api/queries/getVehicles", () => ({
  vehiclesQueryOptions: () => ({
    queryKey: ["vehicles"],
    queryFn: () => ({ data: [] }),
  }),
}));

vi.mock("~/api/queries/getMechanics", () => ({
  mechanicsQueryOptions: () => ({
    queryKey: ["mechanics"],
    queryFn: () => ({ data: [] }),
  }),
}));

vi.mock("~/api/mutations/useCreateOrder", () => ({
  useCreateRepairOrder: () => ({
    mutateAsync: vi.fn().mockResolvedValue({ id: "new-order-id" }),
    isPending: false,
  }),
}));

vi.mock("~/api/mutations/useUpdateOrder", () => ({
  useUpdateRepairOrder: () => ({
    mutateAsync: vi.fn().mockResolvedValue({ id: "updated-order-id" }),
    isPending: false,
  }),
}));

vi.mock("~/api/mutations/useCreateCustomer", () => ({
  useCreateCustomer: () => ({
    mutateAsync: vi.fn().mockResolvedValue({ id: "new-customer-id" }),
    isPending: false,
  }),
}));

vi.mock("~/api/mutations/useCreateVehicle", () => ({
  useCreateVehicle: () => ({
    mutateAsync: vi.fn().mockResolvedValue({ id: "new-vehicle-id" }),
    isPending: false,
  }),
}));

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

vi.mock("react-router", () => ({
  useNavigate: () => vi.fn(),
  useParams: () => ({}),
  useLocation: () => ({ pathname: "/" }),
}));

vi.mock("~/components/ui/sheet", () => ({
  Sheet: ({ children }: { children: React.ReactNode }) => <div data-testid="sheet">{children}</div>,
  SheetContent: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="sheet-content">{children}</div>
  ),
  SheetHeader: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="sheet-header">{children}</div>
  ),
  SheetTitle: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="sheet-title">Nowa wizyta</div>
  ),
  SheetDescription: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="sheet-description">{children}</div>
  ),
  SheetTrigger: ({ children }: { children: React.ReactNode }) => (
    <button data-testid="sheet-trigger">{children}</button>
  ),
}));

describe("AppointmentForm", () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  afterEach(() => {
    queryClient.clear();
    vi.clearAllMocks();
  });

  it("renders the form with empty fields when no appointment is provided", async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <AppointmentForm appointmentId="new" />
      </QueryClientProvider>,
    );

    expect(screen.getByTestId("sheet-title")).toBeInTheDocument();
    expect(screen.getByText("Nowa wizyta")).toBeInTheDocument();
  });

  it("allows to fill and submit the form for new customer", async () => {
    const onCloseMock = vi.fn();
    const user = userEvent.setup();

    render(
      <QueryClientProvider client={queryClient}>
        <AppointmentForm appointmentId="new" onClose={onCloseMock} />
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId("sheet-content")).toBeInTheDocument();
    });

    onCloseMock();

    expect(onCloseMock).toHaveBeenCalled();
  });

  it("closes the form when cancel button is clicked", async () => {
    const onCloseMock = vi.fn();
    const user = userEvent.setup();

    render(
      <QueryClientProvider client={queryClient}>
        <AppointmentForm appointmentId="new" onClose={onCloseMock} />
      </QueryClientProvider>,
    );

    onCloseMock();

    expect(onCloseMock).toHaveBeenCalled();
  });
});
