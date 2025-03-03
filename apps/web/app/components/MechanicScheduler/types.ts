import type { GetMechanicsResponse, GetRepairOrdersResponse } from "~/api/generated-api";

// Typy z API
export type MechanicAPI = GetMechanicsResponse["data"][number];
export type RepairOrderAPI = GetRepairOrdersResponse["data"][number];

// Typy komponentów
export interface ITimeStart {
  hour: number;
  minute: number;
}

export interface IMechanic {
  id: string;
  firstName: string;
  lastName: string;
  shiftStart: ITimeStart;
  shiftEnd: ITimeStart;
}

export interface IAppointment {
  id: string;
  mechanicId: string;
  car: string;
  start: ITimeStart;
  duration: number;
  color: string;
  // Dodatkowe informacje o naprawie
  description?: string;
  customerName?: string;
  registrationNumber?: string;
  startDate?: Date;
  endDate?: Date;
}

export interface IAppointmentProps {
  id: string;
  car: string;
  start: ITimeStart;
  duration: number;
  color: string;
  description?: string;
  customerName?: string;
  registrationNumber?: string;
  startDate?: Date;
  endDate?: Date;
  onResize: (id: string, newDuration: number) => void;
}

export interface IMechanicRowProps {
  mechanic: IMechanic;
  appointments: IAppointment[];
  onResize: (id: string, newDuration: number) => void;
}

export interface MechanicSchedulerProps {
  mechanics: MechanicAPI[];
  orders: RepairOrderAPI[];
}
