import type { MechanicAPI, RepairOrderAPI, ITimeStart, IAppointment, IMechanic } from "./types";
import React from "react";

export const parseTimeString = (timeString: string): ITimeStart => {
  const [hours, minutes] = timeString.split(":").map(Number);
  return { hour: hours, minute: minutes };
};

export const parseISODate = (dateString: string): ITimeStart => {
  const date = new Date(dateString);
  return {
    hour: date.getHours(),
    minute: date.getMinutes(),
  };
};

export const isSameDay = (date1?: Date | string, date2?: Date | string): boolean => {
  if (!date1 || !date2) return false;

  const d1 = date1 instanceof Date ? date1 : new Date(date1);
  const d2 = date2 instanceof Date ? date2 : new Date(date2);

  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  );
};

export const isMultiDayAppointment = (appointment: Omit<IAppointment, "mechanicId">): boolean => {
  if (!appointment.startDate || !appointment.endDate) return false;

  return !isSameDay(appointment.startDate, appointment.endDate);
};

export const calculateDurationForDay = (appointment: IAppointment, day: Date): number => {
  if (!appointment.startDate || !appointment.endDate) {
    return appointment.duration || 60;
  }

  const startDate = new Date(appointment.startDate);
  const endDate = new Date(appointment.endDate);

  if (isSameDay(startDate, endDate) && isSameDay(startDate, day)) {
    const durationMs = endDate.getTime() - startDate.getTime();
    return Math.round(durationMs / (1000 * 60));
  }

  if (isSameDay(startDate, day)) {
    const endOfDay = new Date(day);
    endOfDay.setHours(23, 59, 59, 999);

    const durationMs = endOfDay.getTime() - startDate.getTime();
    return Math.round(durationMs / (1000 * 60));
  }

  if (isSameDay(endDate, day)) {
    const startOfDay = new Date(day);
    startOfDay.setHours(0, 0, 0, 0);

    const durationMs = endDate.getTime() - startOfDay.getTime();
    return Math.round(durationMs / (1000 * 60));
  }

  return 1440; // 24 hours = 1440 minutes
};

export const getStartTimeForDay = (appointment: IAppointment, day: Date): ITimeStart => {
  if (!appointment.startDate) {
    return appointment.start;
  }

  const startDate = new Date(appointment.startDate);

  if (isSameDay(startDate, day)) {
    return {
      hour: startDate.getHours(),
      minute: startDate.getMinutes(),
    };
  }

  return { hour: 8, minute: 0 };
};

export const calculateDuration = (startDate: string, endDate: string): number => {
  const start = new Date(startDate);
  const end = new Date(endDate);

  if (end < start) {
    alert("Invalid date range. End date is earlier than start date.");
    console.warn("Invalid date range. End date is earlier than start date:", {
      startDate,
      endDate,
    });
    return 60; // default to 1 hour
  }

  const durationMs = end.getTime() - start.getTime();
  return Math.round(durationMs / (1000 * 60));
};

export const convertMechanic = (mechanicFromAPI: MechanicAPI): IMechanic => {
  return {
    id: mechanicFromAPI.id,
    firstName: mechanicFromAPI.firstName,
    lastName: mechanicFromAPI.lastName,
    shiftStart: parseTimeString(mechanicFromAPI.shiftStart),
    shiftEnd: parseTimeString(mechanicFromAPI.shiftEnd),
  };
};

export const convertOrder = (orderFromAPI: RepairOrderAPI): IAppointment => {
  let start: ITimeStart = { hour: 8, minute: 0 };
  let duration = 60;
  let startDate: Date | undefined;
  let endDate: Date | undefined;

  if (orderFromAPI.startDate && orderFromAPI.endDate) {
    try {
      startDate = new Date(orderFromAPI.startDate);
      endDate = new Date(orderFromAPI.endDate);

      if (endDate < startDate) {
        const endHour = endDate.getHours();
        const endMinute = endDate.getMinutes();

        endDate = new Date(startDate);
        endDate.setHours(endHour, endMinute);

        if (endDate < startDate) {
          endDate.setDate(endDate.getDate() + 1);
        }
      }

      start = {
        hour: startDate.getHours(),
        minute: startDate.getMinutes(),
      };

      duration = calculateDuration(startDate.toISOString(), endDate.toISOString());

      duration = Math.max(15, duration);
    } catch (error) {
      console.error("Error parsing dates:", error);
    }
  }

  const colors = ["#3b82f680", "#8b5cf680", "#ef444480", "#10b98180", "#f59e0b80", "#6366f180"];
  const color = colors[Math.floor(Math.random() * colors.length)];

  return {
    id: orderFromAPI.id,
    mechanicId: orderFromAPI.assignedMechanicId || "",
    car: `${orderFromAPI.make} ${orderFromAPI.model} (${orderFromAPI.year})`,
    start,
    duration,
    color,
    description: orderFromAPI.description,
    customerName: `${orderFromAPI.customerFirstName} ${orderFromAPI.customerLastName}`,
    registrationNumber: orderFromAPI.registrationNumber,
    startDate: startDate,
    endDate: endDate,
  };
};

export const getAppointmentsForDate = (
  appointments: IAppointment[],
  date: Date,
): IAppointment[] => {
  return appointments
    .filter((appointment) => {
      if (!appointment.startDate || !appointment.endDate) return true;

      const startDate = new Date(appointment.startDate);
      const endDate = new Date(appointment.endDate);

      const dayStart = new Date(date);
      dayStart.setHours(0, 0, 0, 0);

      const dayEnd = new Date(date);
      dayEnd.setHours(23, 59, 59, 999);

      return (
        (startDate >= dayStart && startDate <= dayEnd) || // starts on this day
        (endDate >= dayStart && endDate <= dayEnd) || // ends on this day
        (startDate <= dayStart && endDate >= dayEnd) // runs through the whole day
      );
    })
    .map((appointment) => {
      const adjustedAppointment = { ...appointment };
      adjustedAppointment.start = getStartTimeForDay(appointment, date);
      adjustedAppointment.duration = calculateDurationForDay(appointment, date);

      return adjustedAppointment;
    });
};

export const isWithinMechanicShift = (mechanic: IMechanic, appointment: IAppointment): boolean => {
  const shiftStartMinutes = mechanic.shiftStart.hour * 60 + mechanic.shiftStart.minute;
  const shiftEndMinutes = mechanic.shiftEnd.hour * 60 + mechanic.shiftEnd.minute;

  const appointmentStartMinutes = appointment.start.hour * 60 + appointment.start.minute;
  const appointmentEndMinutes = appointmentStartMinutes + appointment.duration;

  return appointmentStartMinutes >= shiftStartMinutes && appointmentEndMinutes <= shiftEndMinutes;
};

export const calculateAppointmentStyle = (
  start: ITimeStart,
  duration: number,
): React.CSSProperties => {
  const dayStart = 7 * 60; // 7am in minutes
  const startInMinutes = start.hour * 60 + start.minute;
  const startPercentage = ((startInMinutes - dayStart) / (11 * 60)) * 100;

  const widthPercentage = (duration / (11 * 60)) * 100;

  return {
    left: `${startPercentage}%`,
    width: `${widthPercentage}%`,
  };
};

export const appointmentsOverlap = (appt1: IAppointment, appt2: IAppointment): boolean => {
  const appt1Start = (appt1.start.hour - 7) * 60 + appt1.start.minute;
  const appt1End = appt1Start + appt1.duration;

  const appt2Start = (appt2.start.hour - 7) * 60 + appt2.start.minute;
  const appt2End = appt2Start + appt2.duration;

  return appt1Start < appt2End && appt1End > appt2Start;
};

export const findNearestFreeSlot = (
  draggedAppointment: IAppointment,
  otherAppointments: IAppointment[],
  preferredStartTime: ITimeStart,
): ITimeStart => {
  const preferredStartMinutes = (preferredStartTime.hour - 7) * 60 + preferredStartTime.minute;

  if (otherAppointments.length === 0) {
    return preferredStartTime;
  }

  const sortedAppointments = [...otherAppointments].sort((a, b) => {
    const aStart = (a.start.hour - 7) * 60 + a.start.minute;
    const bStart = (b.start.hour - 7) * 60 + b.start.minute;
    return aStart - bStart;
  });

  let availableStart = 0; // Start of the day (7:00)

  for (const appointment of sortedAppointments) {
    const appointmentStart = (appointment.start.hour - 7) * 60 + appointment.start.minute;
    const appointmentEnd = appointmentStart + appointment.duration;

    if (appointmentStart - availableStart >= draggedAppointment.duration) {
      if (
        Math.abs(availableStart - preferredStartMinutes) <=
        Math.abs(appointmentEnd - preferredStartMinutes)
      ) {
        const hour = Math.floor(availableStart / 60) + 7;
        const minute = availableStart % 60;
        return { hour, minute };
      }
    }

    availableStart = appointmentEnd;
  }

  const dayEndMinutes = 660; // 18:00 - 7:00 = 11 hours * 60 minutes

  if (dayEndMinutes - availableStart >= draggedAppointment.duration) {
    const hour = Math.floor(availableStart / 60) + 7;
    const minute = availableStart % 60;
    return { hour, minute };
  }

  return { hour: 7, minute: 0 };
};

export const generateTimeSlots = () => {
  const slots = [];
  for (let hour = 7; hour <= 18; hour++) {
    const displayHour = hour > 12 ? hour - 12 : hour;
    const amPm = hour >= 12 ? "PM" : "AM";

    slots.push({
      time: `${displayHour} ${amPm}`,
      hour,
      minute: 0,
      isHour: true,
    });

    [15, 30, 45].forEach((minute) => {
      slots.push({
        time: "",
        hour,
        minute,
        isHour: false,
      });
    });
  }
  return slots;
};
