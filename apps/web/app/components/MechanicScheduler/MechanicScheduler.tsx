import React, { useState, useEffect, useMemo } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { restrictToWindowEdges } from "@dnd-kit/modifiers";
import { MechanicRow } from "./MechanicRow";
import {
  appointmentsOverlap,
  calculateAppointmentStyle,
  findNearestFreeSlot,
  generateTimeSlots,
  convertMechanic,
  convertOrder,
  distributeOrders,
  updateOrderDates,
} from "./helpers";
import type { MechanicSchedulerProps, IAppointment } from "./types";

const MechanicScheduler: React.FC<MechanicSchedulerProps> = ({ mechanics, orders }) => {
  const timeSlots = generateTimeSlots();
  const [activeId, setActiveId] = useState<string | null>(null);
  const [activeAppointment, setActiveAppointment] = useState<IAppointment | null>(null);

  console.log({ mechanics, orders });

  // Konwertuj mechaników z API do formatu komponentu
  const convertedMechanics = useMemo(
    () => mechanics.map((mechanic) => convertMechanic(mechanic)),
    [mechanics],
  );

  // Początkowo przydziel zamówienia do mechaników
  const initialAppointments = useMemo(
    () => distributeOrders(orders, mechanics),
    [orders, mechanics],
  );

  // Stan komponentu - naprawy
  const [appointments, setAppointments] = useState<IAppointment[]>(initialAppointments);

  // Aktualizuj naprawy gdy zmieniają się dane wejściowe
  useEffect(() => {
    setAppointments(distributeOrders(orders, mechanics));
  }, [orders, mechanics]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    setActiveId(active.id as string);

    // Zapisujemy aktywne zadanie do późniejszego użycia
    const appointment = appointments.find((a) => a.id === active.id);
    if (appointment) {
      setActiveAppointment(appointment);
      console.log("Started dragging appointment:", appointment);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over, delta } = event;

    console.log("Drag end event:", event);
    console.log("Active:", active);
    console.log("Over:", over);
    console.log("Delta:", delta);

    // Zawsze resetujemy stany na koniec
    setActiveId(null);
    setActiveAppointment(null);

    // Jeśli nie ma over, przerywamy
    if (!over) {
      console.log("No over element, returning");
      return;
    }

    // Pobieramy przeciągane zadanie
    const draggedId = active.id;
    const draggedAppointment = appointments.find((a) => a.id === draggedId);
    if (!draggedAppointment) {
      console.log("Could not find appointment with id:", draggedId);
      return;
    }

    // Pobieramy dane o miejscu upuszczenia
    const overId = over.id as string;
    console.log("Over ID:", overId);

    // Sprawdzamy, czy upuszczono na obszarze mechanika
    if (overId.startsWith("mechanic-")) {
      const mechanicId = overId.split("-")[1];
      console.log("Mechanic ID:", mechanicId);

      // Pobieramy obiekt rect strefy upuszczania
      if (!over.rect) {
        console.log("No rect available");
        return;
      }

      const rect = over.rect;
      console.log("Rect:", rect);

      // Obliczamy liczbę pikseli na minutę na podstawie szerokości kontenera
      const pixelsPerMinute = rect.width / 660; // 11 godzin * 60 minut
      console.log("Pixels per minute:", pixelsPerMinute);

      // Konwertujemy przesunięcie (delta.x) na minuty
      const deltaMinutes = Math.round(delta.x / pixelsPerMinute);
      console.log("Delta minutes:", deltaMinutes);

      // Pobieramy oryginalny czas i dodajemy przesunięcie
      const originalTimeInMinutes =
        (draggedAppointment.start.hour - 7) * 60 + draggedAppointment.start.minute;
      const newTimeInMinutes = Math.max(0, Math.min(660, originalTimeInMinutes + deltaMinutes));

      // Zaokrąglamy do najbliższych 15 minut
      const roundedMinutes = Math.round(newTimeInMinutes / 15) * 15;

      // Konwertujemy z powrotem na godziny i minuty
      const hour = Math.floor(roundedMinutes / 60) + 7;
      const minute = roundedMinutes % 60;

      console.log("Original time:", draggedAppointment.start);
      console.log("New calculated time:", { hour, minute });

      // Tworzymy tymczasowy obiekt z nowym czasem i mechanikiem
      const tempAppointment: IAppointment = {
        ...draggedAppointment,
        start: { hour, minute },
        mechanicId,
      };

      // Pobieramy inne naprawy tego mechanika
      const otherAppointmentsForThisMechanic = appointments.filter(
        (a) => a.mechanicId === mechanicId && a.id !== draggedId,
      );

      // Sprawdzamy, czy nowa pozycja koliduje z innymi naprawami
      const hasCollision = otherAppointmentsForThisMechanic.some((otherAppt) =>
        appointmentsOverlap(tempAppointment, otherAppt),
      );

      if (hasCollision) {
        console.log("Collision detected, finding nearest free slot");

        // Znajdujemy najbliższy wolny slot
        const freeSlot = findNearestFreeSlot(draggedAppointment, otherAppointmentsForThisMechanic, {
          hour,
          minute,
        });

        console.log("Found free slot:", freeSlot);

        // Aktualizujemy daty rozpoczęcia i zakończenia
        const updatedAppointment = {
          ...draggedAppointment,
          mechanicId,
          start: freeSlot,
        };

        // Oblicz nowe daty
        const { startDate, endDate } = updateOrderDates(updatedAppointment);

        // Aktualizujemy naprawę z nowym wolnym slotem i datami
        setAppointments((prev) =>
          prev.map((app) =>
            app.id === draggedId
              ? {
                  ...updatedAppointment,
                  startDate,
                  endDate,
                }
              : app,
          ),
        );
      } else {
        // Aktualizujemy daty rozpoczęcia i zakończenia
        const updatedAppointment = {
          ...draggedAppointment,
          mechanicId,
          start: { hour, minute },
        };

        // Oblicz nowe daty
        const { startDate, endDate } = updateOrderDates(updatedAppointment);

        // Jeśli nie ma kolizji, aktualizujemy naprawę z obliczonym czasem i datami
        setAppointments((prev) =>
          prev.map((app) =>
            app.id === draggedId
              ? {
                  ...updatedAppointment,
                  startDate,
                  endDate,
                }
              : app,
          ),
        );
      }
    } else {
      console.log("Not dropped on a mechanic row");
    }
  };

  // Obsługa zmiany rozmiaru naprawy z zapobieganiem nakładaniu się
  const handleResize = (id: string, newDuration: number) => {
    console.log(`Resizing appointment ${id} to ${newDuration} minutes`);

    // Pobieramy naprawę, której rozmiar jest zmieniany
    const appointment = appointments.find((a) => a.id === id);
    if (!appointment) return;

    // Tworzymy tymczasowy obiekt z nowym czasem trwania
    const tempAppointment: IAppointment = {
      ...appointment,
      duration: newDuration,
    };

    // Pobieramy inne naprawy tego mechanika
    const otherAppointmentsForThisMechanic = appointments.filter(
      (a) => a.mechanicId === appointment.mechanicId && a.id !== id,
    );

    // Sprawdzamy, czy nowy rozmiar koliduje z innymi naprawami
    const hasCollision = otherAppointmentsForThisMechanic.some((otherAppt) =>
      appointmentsOverlap(tempAppointment, otherAppt),
    );

    if (hasCollision) {
      console.log("Resize would cause collision, limiting duration");

      // Znajdujemy maksymalną możliwą długość bez kolizji
      let maxDuration = newDuration;

      // Sortujemy naprawy po czasie rozpoczęcia
      const sortedAppointments = [...otherAppointmentsForThisMechanic].sort((a, b) => {
        const aStart = (a.start.hour - 7) * 60 + a.start.minute;
        const bStart = (b.start.hour - 7) * 60 + b.start.minute;
        return aStart - bStart;
      });

      // Szukamy pierwszej naprawy, która zaczyna się po naszej
      const appointmentStartMinutes = (appointment.start.hour - 7) * 60 + appointment.start.minute;

      for (const otherAppt of sortedAppointments) {
        const otherStartMinutes = (otherAppt.start.hour - 7) * 60 + otherAppt.start.minute;

        if (otherStartMinutes > appointmentStartMinutes) {
          // Znaleźliśmy naprawę, która zaczyna się po naszej
          // Obliczamy maksymalną dozwoloną długość
          const maxAllowedDuration = otherStartMinutes - appointmentStartMinutes;

          if (maxAllowedDuration < maxDuration) {
            maxDuration = maxAllowedDuration;
          }

          break; // Wystarczy znaleźć pierwszą kolidującą naprawę
        }
      }

      // Zaokrąglamy do najbliższych 15 minut w dół
      const roundedMaxDuration = Math.floor(maxDuration / 15) * 15;
      const limitedDuration = Math.max(15, roundedMaxDuration);

      // Aktualizujemy daty
      const updatedAppointment = {
        ...appointment,
        duration: limitedDuration,
      };

      // Oblicz nowe daty
      const { startDate, endDate } = updateOrderDates(updatedAppointment);

      // Aktualizujemy naprawę z ograniczoną długością (minimum 15 minut)
      setAppointments((prev) =>
        prev.map((app) =>
          app.id === id
            ? {
                ...updatedAppointment,
                startDate,
                endDate,
              }
            : app,
        ),
      );
    } else {
      // Aktualizujemy daty
      const updatedAppointment = {
        ...appointment,
        duration: newDuration,
      };

      // Oblicz nowe daty
      const { startDate, endDate } = updateOrderDates(updatedAppointment);

      // Jeśli nie ma kolizji, aktualizujemy naprawę z nową długością i datami
      setAppointments((prev) =>
        prev.map((app) =>
          app.id === id
            ? {
                ...updatedAppointment,
                startDate,
                endDate,
              }
            : app,
        ),
      );
    }
  };

  const addNewAppointment = () => {
    // Function to add a new appointment (would be triggered by a form/modal in real app)
    const newId = `appt${appointments.length + 1}`;

    // Znajdujemy mechanika z najmniejszą liczbą napraw
    const mechanicCounts = convertedMechanics.map((mechanic) => ({
      mechanicId: mechanic.id,
      count: appointments.filter((a) => a.mechanicId === mechanic.id).length,
    }));

    const leastBusyMechanic = mechanicCounts.sort((a, b) => a.count - b.count)[0];

    // Znajdujemy pierwszy wolny slot dla tego mechanika
    const mechanicAppointments = appointments.filter(
      (a) => a.mechanicId === leastBusyMechanic.mechanicId,
    );

    // Sortujemy istniejące naprawy mechanika według czasu rozpoczęcia
    const sortedAppointments = [...mechanicAppointments].sort((a, b) => {
      const aStart = (a.start.hour - 7) * 60 + a.start.minute;
      const bStart = (b.start.hour - 7) * 60 + b.start.minute;
      return aStart - bStart;
    });

    // Szukamy pierwszego wolnego slotu
    let availableStartMinutes = 0; // Początek dnia (7:00)
    const newAppointmentDuration = 60; // 1 godzina

    for (const appointment of sortedAppointments) {
      const appointmentStartMinutes = (appointment.start.hour - 7) * 60 + appointment.start.minute;

      // Sprawdzamy, czy mamy wystarczająco miejsca przed tą naprawą
      if (appointmentStartMinutes - availableStartMinutes >= newAppointmentDuration) {
        // Znaleźliśmy wolne miejsce
        break;
      }

      // Aktualizujemy dostępny początek na koniec bieżącej naprawy
      availableStartMinutes = appointmentStartMinutes + appointment.duration;
    }

    // Zaokrąglamy do najbliższych 15 minut
    const roundedStartMinutes = Math.round(availableStartMinutes / 15) * 15;

    // Konwertujemy z powrotem na godziny i minuty
    const hour = Math.floor(roundedStartMinutes / 60) + 7;
    const minute = roundedStartMinutes % 60;

    const newAppointmentBase: IAppointment = {
      id: newId,
      mechanicId: leastBusyMechanic.mechanicId,
      car: "Nowy samochód",
      start: { hour, minute },
      duration: newAppointmentDuration,
      color: "#10b981",
    };

    const { startDate, endDate } = updateOrderDates(newAppointmentBase);
    const newAppointment = {
      ...newAppointmentBase,
      startDate,
      endDate,
    };

    setAppointments([...appointments, newAppointment]);
  };

  return (
    <div className="mx-auto w-full max-w-6xl overflow-x-auto">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-800">Harmonogram mechaników</h2>
        <button
          onClick={addNewAppointment}
          className="rounded bg-blue-500 px-4 py-2 font-bold text-white hover:bg-blue-700"
        >
          Dodaj naprawę
        </button>
      </div>

      <div className="overflow-hidden rounded-lg border border-gray-300">
        <div className="flex border-b border-gray-300">
          <div className="w-24 border-r border-gray-300"></div>
          <div className="relative flex-1">
            <div className="flex">
              {timeSlots
                .filter((slot) => slot.isHour)
                .map((slot, index) => (
                  <div
                    key={index}
                    className="flex-1 border-r border-gray-300 py-2 text-center font-medium text-gray-700"
                  >
                    {slot.time}
                  </div>
                ))}
            </div>

            <div className="absolute bottom-0 left-0 right-0 flex">
              {timeSlots.map((slot, index) => (
                <div
                  key={index}
                  className={`h-1 ${index % 4 === 0 ? "bg-gray-400" : "bg-gray-200"}`}
                  style={{ width: `${100 / timeSlots.length}%` }}
                ></div>
              ))}
            </div>
          </div>
        </div>

        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          modifiers={[restrictToWindowEdges]}
        >
          {convertedMechanics.map((mechanic) => (
            <MechanicRow
              key={mechanic.id}
              mechanic={mechanic}
              appointments={appointments.filter((a) => a.mechanicId === mechanic.id)}
              onResize={handleResize}
            />
          ))}

          <DragOverlay>
            {activeId && activeAppointment ? (
              <div
                style={{
                  backgroundColor: activeAppointment.color || "#3b82f6",
                  width: calculateAppointmentStyle(
                    activeAppointment.start,
                    activeAppointment.duration,
                  ).width,
                  height: "100%",
                }}
                className="h-10 overflow-hidden rounded-md border border-gray-300 p-1 text-sm font-medium text-white shadow-sm"
              >
                {activeAppointment.car}
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>
    </div>
  );
};

export default MechanicScheduler;
