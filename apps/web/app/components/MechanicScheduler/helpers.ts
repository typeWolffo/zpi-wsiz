import type { MechanicAPI, RepairOrderAPI, ITimeStart, IAppointment, IMechanic } from "./types";
import React from "react";

// Konwertuje string "HH:MM:SS" na obiekt ITimeStart
export const parseTimeString = (timeString: string): ITimeStart => {
  const [hours, minutes] = timeString.split(":").map(Number);
  return { hour: hours, minute: minutes };
};

// Konwertuje datę ISO na obiekt ITimeStart
export const parseISODate = (dateString: string): ITimeStart => {
  const date = new Date(dateString);
  return {
    hour: date.getHours(),
    minute: date.getMinutes(),
  };
};

// Oblicza czas trwania w minutach między dwoma datami ISO
export const calculateDuration = (startDate: string, endDate: string): number => {
  const start = new Date(startDate);
  const end = new Date(endDate);

  // W przypadku błędnej daty końcowej (np. rok 2022 zamiast 2025)
  // przyjmujemy, że naprawa trwa 1 godzinę
  if (end < start) {
    console.warn("Nieprawidłowy zakres dat. Data końcowa wcześniejsza niż początkowa:", {
      startDate,
      endDate,
    });
    return 60; // domyślnie 1 godzina
  }

  const durationMs = end.getTime() - start.getTime();
  return Math.round(durationMs / (1000 * 60)); // konwersja milisekund na minuty
};

// Konwertuje mechanika z API na format używany w komponencie
export const convertMechanic = (mechanicFromAPI: MechanicAPI): IMechanic => {
  return {
    id: mechanicFromAPI.id,
    firstName: mechanicFromAPI.firstName,
    lastName: mechanicFromAPI.lastName,
    shiftStart: parseTimeString(mechanicFromAPI.shiftStart),
    shiftEnd: parseTimeString(mechanicFromAPI.shiftEnd),
  };
};

// Konwertuje zamówienie z API na obiekt naprawy
export const convertOrder = (orderFromAPI: RepairOrderAPI): IAppointment => {
  // Domyślne wartości
  let start: ITimeStart = { hour: 8, minute: 0 };
  let duration = 60; // 1 godzina w minutach
  let startDate: Date | undefined;
  let endDate: Date | undefined;

  // Jeśli są daty, użyj ich do obliczenia czasu i długości
  if (orderFromAPI.startDate && orderFromAPI.endDate) {
    try {
      startDate = new Date(orderFromAPI.startDate);
      endDate = new Date(orderFromAPI.endDate);

      // Pobierz czas rozpoczęcia z daty
      start = {
        hour: startDate.getHours(),
        minute: startDate.getMinutes(),
      };

      // Oblicz długość na podstawie różnicy dat
      duration = calculateDuration(orderFromAPI.startDate, orderFromAPI.endDate);

      // Minimalna długość to 15 minut
      duration = Math.max(15, duration);
    } catch (error) {
      console.error("Błąd podczas parsowania dat:", error);
    }
  }

  // Generujemy losowy kolor dla naprawy
  const colors = ["#3b82f6", "#8b5cf6", "#ef4444", "#10b981", "#f59e0b", "#6366f1"];
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

// Funkcja sprawdzająca, czy czas pracy mechanika pasuje do czasu naprawy
export const isWithinMechanicShift = (mechanic: IMechanic, appointment: IAppointment): boolean => {
  // Konwertujemy czasy na minuty od początku dnia
  const shiftStartMinutes = mechanic.shiftStart.hour * 60 + mechanic.shiftStart.minute;
  const shiftEndMinutes = mechanic.shiftEnd.hour * 60 + mechanic.shiftEnd.minute;

  const appointmentStartMinutes = appointment.start.hour * 60 + appointment.start.minute;
  const appointmentEndMinutes = appointmentStartMinutes + appointment.duration;

  // Sprawdzamy, czy naprawa mieści się w czasie pracy mechanika
  return appointmentStartMinutes >= shiftStartMinutes && appointmentEndMinutes <= shiftEndMinutes;
};

export const calculateAppointmentStyle = (
  start: ITimeStart,
  duration: number,
): React.CSSProperties => {
  // Calculate start position as percentage of day (7am-6pm = 11 hours = 660 minutes)
  const dayStart = 7 * 60; // 7am in minutes
  const startInMinutes = start.hour * 60 + start.minute;
  const startPercentage = ((startInMinutes - dayStart) / (11 * 60)) * 100;

  // Calculate width as percentage of day
  const widthPercentage = (duration / (11 * 60)) * 100;

  return {
    left: `${startPercentage}%`,
    width: `${widthPercentage}%`,
  };
};

// Funkcja sprawdzająca, czy dwie naprawy nakładają się czasowo
export const appointmentsOverlap = (appt1: IAppointment, appt2: IAppointment): boolean => {
  // Konwertujemy czasy na minuty od początku dnia (7:00)
  const appt1Start = (appt1.start.hour - 7) * 60 + appt1.start.minute;
  const appt1End = appt1Start + appt1.duration;

  const appt2Start = (appt2.start.hour - 7) * 60 + appt2.start.minute;
  const appt2End = appt2Start + appt2.duration;

  // Sprawdzamy, czy zakresy czasowe się nakładają
  return appt1Start < appt2End && appt1End > appt2Start;
};

// Funkcja znajdująca najbliższy wolny slot czasowy
export const findNearestFreeSlot = (
  draggedAppointment: IAppointment,
  otherAppointments: IAppointment[],
  preferredStartTime: ITimeStart,
): ITimeStart => {
  // Konwertujemy preferowany czas na minuty od początku dnia
  const preferredStartMinutes = (preferredStartTime.hour - 7) * 60 + preferredStartTime.minute;

  // Jeśli nie ma innych napraw, możemy użyć preferowanego czasu
  if (otherAppointments.length === 0) {
    return preferredStartTime;
  }

  // Sortujemy istniejące naprawy według czasu rozpoczęcia
  const sortedAppointments = [...otherAppointments].sort((a, b) => {
    const aStart = (a.start.hour - 7) * 60 + a.start.minute;
    const bStart = (b.start.hour - 7) * 60 + b.start.minute;
    return aStart - bStart;
  });

  // Szukamy pierwszego wolnego slotu
  let availableStart = 0; // Początek dnia (7:00)

  for (const appointment of sortedAppointments) {
    const appointmentStart = (appointment.start.hour - 7) * 60 + appointment.start.minute;
    const appointmentEnd = appointmentStart + appointment.duration;

    // Sprawdzamy, czy mamy wystarczająco miejsca przed tą naprawą
    if (appointmentStart - availableStart >= draggedAppointment.duration) {
      // Znaleźliśmy wolne miejsce
      // Wybieramy slot, który jest bliżej preferowanego czasu
      if (
        Math.abs(availableStart - preferredStartMinutes) <=
        Math.abs(appointmentEnd - preferredStartMinutes)
      ) {
        // Wybieramy slot przed bieżącą naprawą
        const hour = Math.floor(availableStart / 60) + 7;
        const minute = availableStart % 60;
        return { hour, minute };
      }
    }

    // Aktualizujemy dostępny początek na koniec bieżącej naprawy
    availableStart = appointmentEnd;
  }

  // Sprawdzamy, czy jest miejsce po ostatniej naprawie
  const dayEndMinutes = 660; // 18:00 - 7:00 = 11 godzin * 60 minut

  if (dayEndMinutes - availableStart >= draggedAppointment.duration) {
    const hour = Math.floor(availableStart / 60) + 7;
    const minute = availableStart % 60;
    return { hour, minute };
  }

  // Jeśli nie znaleźliśmy wolnego miejsca, zwracamy początek dnia
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

// Funkcja aktualizująca daty po zmianach w harmonogramie
export const updateOrderDates = (appointment: IAppointment): { startDate: Date; endDate: Date } => {
  // Pobierz datę bieżącego dnia
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Ustaw na początek dnia

  // Utwórz datę rozpoczęcia
  const startDate = new Date(today);
  startDate.setHours(appointment.start.hour, appointment.start.minute, 0, 0);

  // Utwórz datę zakończenia
  const endDate = new Date(startDate);
  endDate.setTime(startDate.getTime() + appointment.duration * 60 * 1000);

  return { startDate, endDate };
};

// Funkcja przydzielająca zamówienia do mechaników
export const distributeOrders = (
  orders: RepairOrderAPI[],
  mechanics: MechanicAPI[],
): IAppointment[] => {
  const convertedOrders = orders.map((order) => convertOrder(order));

  // Jeśli wszystkie zamówienia mają przypisanych mechaników i daty, zwróć je
  if (convertedOrders.every((order) => order.mechanicId && order.startDate && order.endDate)) {
    return convertedOrders;
  }

  // Przydziel każde zamówienie bez przypisanego mechanika
  let result = [...convertedOrders];

  // Dla każdego zamówienia bez przypisanego mechanika
  convertedOrders.forEach((order, index) => {
    if (!order.mechanicId) {
      // Znajdź mechanika z najmniejszą liczbą przypisanych zamówień
      const mechanicCounts = mechanics.map((mechanic) => ({
        id: mechanic.id,
        count: result.filter((o) => o.mechanicId === mechanic.id).length,
      }));

      const leastBusyMechanic = mechanicCounts.sort((a, b) => a.count - b.count)[0];

      // Przypisz zamówienie do najmniej obciążonego mechanika
      result[index] = {
        ...order,
        mechanicId: leastBusyMechanic.id,
      };
    }
  });

  // Przydziel sensowne czasy rozpoczęcia, aby uniknąć nakładania się
  return result.map((order, index) => {
    // Jeśli naprawy mają już daty, nie zmieniaj ich
    if (order.startDate && order.endDate && order.start && order.duration > 0) {
      return order;
    }

    // Znajdź istniejące naprawy tego mechanika
    const mechanicAppointments = result.filter(
      (o) => o.mechanicId === order.mechanicId && o.id !== order.id,
    );

    // Jeśli to pierwsza naprawa mechanika, zacznij od 8:00
    if (mechanicAppointments.length === 0) {
      return {
        ...order,
        start: { hour: 8, minute: 0 },
      };
    }

    // Sortuj naprawy według czasu rozpoczęcia
    const sortedAppointments = [...mechanicAppointments].sort((a, b) => {
      const aStart = a.start.hour * 60 + a.start.minute;
      const bStart = b.start.hour * 60 + b.start.minute;
      return aStart - bStart;
    });

    // Znajdź pierwszy wolny slot (od 8:00)
    let availableStartMinutes = 8 * 60; // 8:00

    for (const appointment of sortedAppointments) {
      const appointmentStart = appointment.start.hour * 60 + appointment.start.minute;
      const appointmentEnd = appointmentStart + appointment.duration;

      // Jeśli jest miejsce przed tym spotkaniem, użyj go
      if (appointmentStart - availableStartMinutes >= order.duration) {
        break;
      }

      // W przeciwnym razie przesuń dostępny czas na koniec tego spotkania
      availableStartMinutes = appointmentEnd;
    }

    // Konwertuj minuty z powrotem na godziny i minuty
    const hour = Math.floor(availableStartMinutes / 60);
    const minute = availableStartMinutes % 60;

    return {
      ...order,
      start: { hour, minute },
    };
  });
};
