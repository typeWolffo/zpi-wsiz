import {
  closestCenter,
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { restrictToWindowEdges } from "@dnd-kit/modifiers";
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { ChevronDown } from "lucide-react";
import React, { useEffect, useMemo, useState } from "react";
import { useUpdateRepairOrder } from "~/api/mutations/useUpdateOrder";
import { ordersQueryOptions } from "~/api/queries/getOrders";
import { queryClient } from "~/api/queryClient";
import { AppointmentForm } from "../AppointmentForm/AppointmentForm";
import { Calendar } from "../ui/calendar";
import { Popover, PopoverAnchor, PopoverContent, PopoverTrigger } from "../ui/popover";
import { MechanicRow } from "./MechanicRow";
import {
  calculateAppointmentStyle,
  convertMechanic,
  convertOrder,
  generateTimeSlots,
  getAppointmentsForDate,
} from "./helpers";
import type { IAppointment, MechanicSchedulerProps } from "./types";
import { useCurrentUserStore } from "~/store/useCurrentUserStore";

const MechanicScheduler: React.FC<MechanicSchedulerProps> = ({ mechanics, orders }) => {
  const { mutateAsync: updateRepairOrder } = useUpdateRepairOrder();
  const currentUser = useCurrentUserStore((state) => state.currentUser);
  const isEmployee = currentUser?.role === "employee";

  const safeMechanics = Array.isArray(mechanics) ? mechanics : [];
  const safeOrders = Array.isArray(orders) ? orders : [];

  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedAppointmentId, setSelectedAppointmentId] = useState<string | null>(null);

  const timeSlots = generateTimeSlots();
  const [activeId, setActiveId] = useState<string | null>(null);
  const [activeAppointment, setActiveAppointment] = useState<IAppointment | null>(null);

  const convertedMechanics = useMemo(
    () => safeMechanics.map((mechanic) => convertMechanic(mechanic)),
    [safeMechanics],
  );

  const allAppointments = useMemo(
    () => safeOrders.map((order) => convertOrder(order)),
    [safeOrders],
  );

  const appointmentsForSelectedDay = useMemo(() => {
    return getAppointmentsForDate(allAppointments, selectedDate);
  }, [allAppointments, selectedDate]);

  const [appointments, setAppointments] = useState<IAppointment[]>(appointmentsForSelectedDay);

  useEffect(() => {
    setAppointments(appointmentsForSelectedDay);
  }, [appointmentsForSelectedDay]);

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

    const appointment = appointments.find((a) => a.id === active.id);
    if (appointment) {
      setActiveAppointment(appointment);
      console.log("Started dragging appointment:", appointment);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over, delta } = event;

    if (!over) {
      console.log("No over element, returning");
      return;
    }

    const draggedId = active.id;
    const draggedAppointment = appointments.find((a) => a.id === draggedId);
    if (!draggedAppointment) {
      console.log("Could not find appointment with id:", draggedId);
      return;
    }

    if (over.data.current) {
      setAppointments((prev) =>
        prev.map((app) =>
          app.id === draggedId ? { ...app, mechanicId: over.data.current?.mechanicId } : app,
        ),
      );

      updateRepairOrder({
        id: draggedAppointment.id,
        data: {
          assignedMechanicId: over.data.current.mechanicId,
        },
      })
        .then(() => {
          queryClient.invalidateQueries(ordersQueryOptions);
        })
        .catch((error) => {
          console.error("Error updating appointment:", error);
          setAppointments((prev) =>
            prev.map((app) =>
              app.id === draggedId ? { ...app, mechanicId: draggedAppointment.mechanicId } : app,
            ),
          );
        });
    }

    setActiveId(null);
    setActiveAppointment(null);
  };

  const handleResize = (id: string, newDuration: number) => {
    const appointment = appointments.find((a) => a.id === id);
    if (!appointment || !appointment.startDate) return;

    const startDate = new Date(appointment.startDate);
    const newEndDate = new Date(startDate);
    newEndDate.setMinutes(startDate.getMinutes() + newDuration);

    const formattedEndDate =
      newEndDate.getFullYear() +
      "-" +
      String(newEndDate.getMonth() + 1).padStart(2, "0") +
      "-" +
      String(newEndDate.getDate()).padStart(2, "0") +
      " " +
      String(newEndDate.getHours()).padStart(2, "0") +
      ":" +
      String(newEndDate.getMinutes()).padStart(2, "0") +
      ":00";

    setAppointments((prev) =>
      prev.map((app) =>
        app.id === id
          ? {
              ...app,
              duration: newDuration,
              endDate: newEndDate,
            }
          : app,
      ),
    );

    updateRepairOrder({
      id,
      data: {
        endDate: formattedEndDate,
      },
    });
  };

  const formatDate = (date: Date): string => {
    return date.toLocaleDateString(window.navigator.language, {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const handleAppointmentClick = (appointmentId: string) => {
    setSelectedAppointmentId(appointmentId);
  };

  const handleAppointmentClose = () => {
    setSelectedAppointmentId(null);
  };

  return (
    <div className="mx-auto w-full max-w-6xl overflow-x-auto p-6">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-800">Mechanic Scheduler</h2>
        <div className="flex items-center gap-4">
          {!isEmployee && (
            <AppointmentForm
              defaultValues={{
                startDate: selectedDate,
                endDate: selectedDate,
              }}
              onClose={handleAppointmentClose}
            />
          )}
        </div>
      </div>

      {selectedAppointmentId && (
        <AppointmentForm
          key={selectedAppointmentId}
          appointmentId={selectedAppointmentId}
          onClose={handleAppointmentClose}
        />
      )}

      <div className="mb-4 flex flex-col items-start">
        <Popover>
          <PopoverAnchor className="w-1/3"></PopoverAnchor>
          <PopoverTrigger>
            <h3 className="flex items-center gap-2 text-lg font-medium">
              {formatDate(selectedDate)}
              <ChevronDown />
            </h3>
          </PopoverTrigger>
          <PopoverContent>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(date) => setSelectedDate(date!)}
              className="rounded-md border"
              required
            />
          </PopoverContent>
        </Popover>
        <div className="flex gap-4 text-sm text-gray-600">
          <span>Liczba napraw: {appointmentsForSelectedDay.length}</span>
        </div>
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
              onAppointmentClick={handleAppointmentClick}
              isEmployee={isEmployee}
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
                }}
                className="h-10 rounded px-2 text-white"
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
