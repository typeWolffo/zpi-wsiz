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
  car: string;
  start: ITimeStart;
  duration: number;
  color?: string;
  description?: string;
  customerName?: string;
  registrationNumber?: string;
  mechanicId: string;
  startDate?: Date;
  endDate?: Date;
}

export interface IMechanicRowProps {
  mechanic: IMechanic;
  appointments: IAppointment[];
  onResize: (id: string, newDuration: number) => void;
  onAppointmentClick: (id: string) => void;
}

export interface IAppointmentProps {
  id: string;
  car: string;
  start: ITimeStart;
  duration: number;
  color?: string;
  description?: string;
  customerName?: string;
  registrationNumber?: string;
  mechanicId: string;
  startDate?: Date;
  endDate?: Date;
  onResize: (id: string, newDuration: number) => void;
  onClick: (id: string) => void;
}

export interface MechanicSchedulerProps {
  mechanics: Array<MechanicAPI>;
  orders: Array<RepairOrderAPI>;
}
