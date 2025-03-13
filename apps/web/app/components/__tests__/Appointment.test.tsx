import { describe, it, expect, vi } from "vitest";
import { Appointment } from "../MechanicScheduler/Appointment";
import { renderWithRouter, screen } from "../../utils/test-utils";
import type { ITimeStart } from "../MechanicScheduler/types";

// Mock dla react-dnd-kit
vi.mock("@dnd-kit/core", () => ({
  useDraggable: () => ({
    attributes: {},
    listeners: {},
    setNodeRef: vi.fn(),
    transform: null,
    isDragging: false,
  }),
  useSortable: () => ({
    attributes: {},
    listeners: {},
    setNodeRef: vi.fn(),
    transform: null,
    isDragging: false,
  }),
}));

describe("Appointment", () => {
  // Mock data for the Appointment component
  const appointmentProps = {
    id: "1",
    car: "Toyota Corolla",
    start: {
      hour: 10,
      minute: 0,
    } as ITimeStart,
    duration: 60,
    description: "Oil change",
    customerName: "Adam Nowak",
    registrationNumber: "ABC 1234",
    mechanicId: "1",
    color: "#f87171",
    onResize: vi.fn(),
    onClick: vi.fn(),
  };

  it("renders the appointment with car name", () => {
    const { container } = renderWithRouter(
      <div style={{ position: "relative", height: "200px" }}>
        <Appointment {...appointmentProps} />
      </div>,
    );

    // Check if the car name is displayed
    expect(container.textContent).toContain("Toyota Corolla");
  });

  it("renders the appointment with customer name", () => {
    const { container } = renderWithRouter(
      <div style={{ position: "relative", height: "200px" }}>
        <Appointment {...appointmentProps} />
      </div>,
    );

    // Check if the customer name is displayed
    expect(container.textContent).toContain("Adam Nowak");
  });

  it("renders the registration number", () => {
    const { container } = renderWithRouter(
      <div style={{ position: "relative", height: "200px" }}>
        <Appointment {...appointmentProps} />
      </div>,
    );

    // Check if the registration number is displayed
    expect(container.textContent).toContain("ABC 1234");
  });

  it("calls onClick when appointment is clicked", async () => {
    const onClickMock = vi.fn();

    const { user, container } = renderWithRouter(
      <div style={{ position: "relative", height: "200px" }}>
        <Appointment {...appointmentProps} onClick={onClickMock} />
      </div>,
    );

    // Znajdź element wizyty i kliknij go
    const appointmentElement = container.querySelector(".flex.h-24");
    if (appointmentElement) {
      await user.click(appointmentElement);

      // Sprawdź, czy funkcja onClick została wywołana z odpowiednim ID
      expect(onClickMock).toHaveBeenCalledWith("1");
    }
  });
});
