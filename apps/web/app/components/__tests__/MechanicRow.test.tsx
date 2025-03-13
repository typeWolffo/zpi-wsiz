import { describe, it, expect, vi } from "vitest";
import { MechanicRow } from "../MechanicScheduler/MechanicRow";
import { renderWithRouter, screen } from "../../utils/test-utils";
import type { ITimeStart, IMechanic, IAppointment } from "../MechanicScheduler/types";

describe("MechanicRow", () => {
  
  const shiftStart: ITimeStart = {
    hour: 9,
    minute: 0,
  };

  
  const shiftEnd: ITimeStart = {
    hour: 17,
    minute: 0,
  };

  
  const mechanic: IMechanic = {
    id: "1",
    firstName: "Jan",
    lastName: "Kowalski",
    shiftStart,
    shiftEnd,
  };

  
  const appointments: IAppointment[] = [
    {
      id: "1",
      car: "Toyota Corolla",
      start: {
        hour: 10,
        minute: 0,
      },
      duration: 60, 
      description: "Wymiana oleju",
      customerName: "Adam Nowak",
      registrationNumber: "ABC 1234",
      mechanicId: "1",
    },
    {
      id: "2",
      car: "Ford Focus",
      start: {
        hour: 14,
        minute: 30,
      },
      duration: 90, 
      description: "Naprawa zawieszenia",
      customerName: "Anna Wiśniewska",
      registrationNumber: "DEF 5678",
      mechanicId: "1",
    },
  ];

  
  const onResizeMock = vi.fn();
  const onAppointmentClickMock = vi.fn();

  it("renders the mechanic name", () => {
    renderWithRouter(
      <MechanicRow
        mechanic={mechanic}
        appointments={appointments}
        onResize={onResizeMock}
        onAppointmentClick={onAppointmentClickMock}
      />,
    );

    
    expect(screen.getByText("Jan Kowalski")).toBeInTheDocument();
  });

  it("renders the correct number of appointments", () => {
    renderWithRouter(
      <MechanicRow
        mechanic={mechanic}
        appointments={appointments}
        onResize={onResizeMock}
        onAppointmentClick={onAppointmentClickMock}
      />,
    );

    
    expect(screen.getByText("Toyota Corolla")).toBeInTheDocument();
    expect(screen.getByText("Ford Focus")).toBeInTheDocument();
  });

  it("calls onAppointmentClick when an appointment is clicked", async () => {
    const { user } = renderWithRouter(
      <MechanicRow
        mechanic={mechanic}
        appointments={appointments}
        onResize={onResizeMock}
        onAppointmentClick={onAppointmentClickMock}
      />,
    );

    
    const appointmentElement = screen.getByText("Toyota Corolla");
    await user.click(appointmentElement);

    
    expect(onAppointmentClickMock).toHaveBeenCalledWith("1");
  });
});
