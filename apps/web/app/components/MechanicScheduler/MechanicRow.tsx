import { useDroppable } from "@dnd-kit/core";
import { Appointment } from "./Appointment";
import type { IMechanicRowProps } from "./types";

export const MechanicRow: React.FC<IMechanicRowProps> = ({ mechanic, appointments, onResize }) => {
  const { setNodeRef, isOver } = useDroppable({
    id: `mechanic-${mechanic.id}`,
    data: { type: "mechanic", mechanicId: mechanic.id },
  });

  const dropStyle: React.CSSProperties = {
    backgroundColor: isOver ? "rgba(0, 0, 0, 0.05)" : "transparent",
  };

  return (
    <div className="relative flex h-12 items-center border-b border-gray-200">
      <div className="flex h-full w-24 items-center border-r border-gray-300 px-2 font-medium capitalize text-gray-700">
        {mechanic.firstName} {mechanic.lastName}
      </div>
      <div
        ref={setNodeRef}
        className="relative h-full flex-1"
        style={dropStyle}
        data-mechanic-id={mechanic.id}
      >
        {appointments.map((appointment) => (
          <Appointment
            key={appointment.id}
            id={appointment.id}
            car={appointment.car}
            start={appointment.start}
            duration={appointment.duration}
            color={appointment.color}
            description={appointment.description}
            customerName={appointment.customerName}
            registrationNumber={appointment.registrationNumber}
            onResize={onResize}
            startDate={appointment.startDate}
            endDate={appointment.endDate}
          />
        ))}
      </div>
    </div>
  );
};
