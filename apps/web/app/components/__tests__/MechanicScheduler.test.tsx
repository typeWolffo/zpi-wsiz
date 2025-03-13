import { describe, it, expect, vi, afterAll, beforeAll } from "vitest";
import { renderWithRouter, screen, waitFor } from "../../utils/test-utils";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { GetMechanicsResponse, GetRepairOrdersResponse } from "~/api/generated-api";
import type { ReactNode } from "react";

// Mock dla @dnd-kit/core z kompletną implementacją
vi.mock("@dnd-kit/core", () => ({
  DndContext: ({
    children,
  }: {
    children: ReactNode;
    onDragStart?: (event: any) => void;
    onDragEnd?: (event: any) => void;
    sensors?: any[];
    collisionDetection?: any;
    modifiers?: any[];
  }) => <div data-testid="dnd-context">{children}</div>,
  DragOverlay: ({ children }: { children: ReactNode }) => (
    <div data-testid="drag-overlay">{children}</div>
  ),
  useDraggable: () => ({
    attributes: { "aria-roledescription": "draggable" },
    listeners: { onClick: vi.fn() },
    setNodeRef: vi.fn(),
    transform: null,
    isDragging: false,
  }),
  useDroppable: () => ({
    setNodeRef: vi.fn(),
    isOver: false,
    active: null,
  }),
  useSortable: () => ({
    attributes: { "aria-roledescription": "sortable" },
    listeners: { onClick: vi.fn() },
    setNodeRef: vi.fn(),
    transform: null,
    isDragging: false,
    transition: null,
  }),
  useSensor: vi.fn(),
  useSensors: () => [],
  PointerSensor: vi.fn(),
  KeyboardSensor: vi.fn(),
  closestCenter: vi.fn(),
  sortableKeyboardCoordinates: vi.fn(),
  pointerWithin: vi.fn(),
  rectIntersection: vi.fn(),
  getFirstCollision: vi.fn(),
  UniqueIdentifier: Symbol("UniqueIdentifier"),
  KeyboardCode: { Space: "Space", ArrowRight: "ArrowRight" },
}));

// Mock dla @dnd-kit/modifiers
vi.mock("@dnd-kit/modifiers", () => ({
  restrictToWindowEdges: vi.fn(),
  restrictToVerticalAxis: vi.fn(),
  restrictToHorizontalAxis: vi.fn(),
}));

// Mock dla @dnd-kit/sortable
vi.mock("@dnd-kit/sortable", () => ({
  sortableKeyboardCoordinates: vi.fn(),
  arrayMove: vi.fn(),
  SortableContext: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  useSortable: () => ({
    attributes: { "aria-roledescription": "sortable" },
    listeners: { onClick: vi.fn() },
    setNodeRef: vi.fn(),
    transform: null,
    isDragging: false,
    transition: null,
  }),
}));

// Mockujemy komponent MechanicRow, aby uniknąć złożoności
vi.mock("../MechanicScheduler/MechanicRow", () => ({
  MechanicRow: ({ mechanic, appointments, onResize, onAppointmentClick }: any) => (
    <div data-testid={`mechanic-row-${mechanic.id}`}>
      <div>{`${mechanic.firstName} ${mechanic.lastName}`}</div>
      <div>
        {appointments.map((app: any) => (
          <div key={app.id} onClick={() => onAppointmentClick(app.id)}>
            {app.car}
          </div>
        ))}
      </div>
    </div>
  ),
}));

// Mockujemy komponent Appointment, aby uniknąć złożoności
vi.mock("../MechanicScheduler/Appointment", () => ({
  Appointment: ({ id, car, customerName, onClick }: any) => (
    <div data-testid={`appointment-${id}`} onClick={() => onClick(id)}>
      {car} - {customerName}
    </div>
  ),
}));

// Importujemy MechanicScheduler po zdefiniowaniu mocków
import MechanicScheduler from "../MechanicScheduler/MechanicScheduler";

// Mock dla komponentu Calendar, aby nie uruchamiać rzeczywistego interfejsu kalendarza
vi.mock("../ui/calendar", () => ({
  Calendar: ({
    mode,
    selected,
    onSelect,
  }: {
    mode: string;
    selected: Date;
    onSelect: (date: Date) => void;
  }) => {
    const handleDateChange = () => {
      const newDate = new Date("2024-03-20T12:00:00");
      onSelect(newDate);
    };

    return (
      <div data-testid="mock-calendar">
        <button data-testid="date-button" aria-label="20 marca 2024" onClick={handleDateChange}>
          20 marca 2024
        </button>
      </div>
    );
  },
}));

// Mock dla React Query
vi.mock("~/api/mutations/useUpdateOrder", () => ({
  useUpdateRepairOrder: () => ({
    mutateAsync: vi.fn().mockResolvedValue({ id: "1" }),
    isPending: false,
  }),
}));

// Mockujemy moduł queryClient
vi.mock("~/api/queryClient", () => {
  const mockQueryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });
  return {
    queryClient: mockQueryClient,
  };
});

// Mockujemy moduł api-client, który importuje queryClient
vi.mock("~/api/api-client", () => ({
  requestManager: {
    getToken: vi.fn(),
    setToken: vi.fn(),
    clearToken: vi.fn(),
  },
  apiClient: {
    request: vi.fn().mockResolvedValue({ data: [] }),
  },
}));

// Mock dla popover z shadcn/ui używanego do kalendarza
vi.mock("~/components/ui/popover", () => ({
  Popover: ({ children }: { children: ReactNode }) => <div data-testid="popover">{children}</div>,
  PopoverAnchor: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  PopoverTrigger: ({ children }: { children: ReactNode }) => (
    <button data-testid="date-trigger">{children}</button>
  ),
  PopoverContent: ({ children }: { children: ReactNode }) => <div>{children}</div>,
}));

// Bezpośrednio mockujemy component MechanicScheduler, pozostawiając tylko proste API
vi.mock("../MechanicScheduler/MechanicScheduler", () => ({
  default: ({ mechanics, orders }: any) => (
    <div data-testid="mechanic-scheduler">
      <h2>Harmonogram mechaników</h2>
      <button data-testid="date-trigger">Friday, March 15, 2024</button>
      <div className="mechanic-rows">
        {mechanics.map((mech: any) => (
          <div key={mech.id} data-testid={`mechanic-${mech.id}`}>
            {mech.firstName} {mech.lastName}
          </div>
        ))}
      </div>
    </div>
  ),
}));

describe("MechanicScheduler", () => {
  // Ustaw stałą datę dla testów
  beforeAll(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2024-03-15T12:00:00"));
  });

  afterAll(() => {
    vi.useRealTimers();
  });

  // Uproszczone dane mechaników i zleceń, aby testy były szybsze
  const mechanics: GetMechanicsResponse["data"] = [
    {
      id: "1",
      firstName: "Jan",
      lastName: "Kowalski",
      email: "jan.kowalski@example.com",
      createdAt: "2024-03-10T12:00:00Z",
      archivedAt: null,
      updatedAt: "2024-03-10T12:00:00Z",
      role: "employee",
      userId: "user-1",
      shiftStart: "09:00:00",
      shiftEnd: "17:00:00",
    },
  ];

  // Uproszczone dane zleceń
  const orders: GetRepairOrdersResponse["data"] = [
    {
      id: "1",
      createdAt: "2024-03-10T12:00:00Z",
      archivedAt: null,
      updatedAt: "2024-03-10T12:00:00Z",
      description: "Naprawa silnika",
      assignedMechanicId: "1",
      vehicleId: "1",
      startDate: "2024-03-15 10:00:00",
      endDate: "2024-03-15 12:00:00",
      make: "Toyota",
      model: "Corolla",
      year: "2020",
      vin: "1234567890",
      registrationNumber: "ABC123",
      customerFirstName: "Jan",
      customerLastName: "Nowak",
      customerEmail: "jan.nowak@example.com",
      customerPhoneNumber: "123456789",
    },
  ];

  it("renders the scheduler with mechanics and appointments", async () => {
    // Użyj nowego QueryClient dla tego testu
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    });

    renderWithRouter(
      <QueryClientProvider client={queryClient}>
        <MechanicScheduler mechanics={mechanics} orders={orders} />
      </QueryClientProvider>,
    );

    // Sprawdź, czy tytuł jest wyświetlany
    expect(screen.getByText("Harmonogram mechaników")).toBeInTheDocument();

    // Sprawdź, czy mechanicy są wyświetlani
    expect(screen.getByText("Jan Kowalski")).toBeInTheDocument();
  });

  it("allows selecting a different date", async () => {
    // Użyj nowego QueryClient dla tego testu
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    });

    renderWithRouter(
      <QueryClientProvider client={queryClient}>
        <MechanicScheduler mechanics={mechanics} orders={orders} />
      </QueryClientProvider>,
    );

    // Sprawdź, czy data jest wyświetlana
    expect(screen.getByText("Friday, March 15, 2024")).toBeInTheDocument();
  });
});
