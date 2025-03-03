import { useDraggable } from "@dnd-kit/core";
import { useState, useRef } from "react";
import { calculateAppointmentStyle } from "./helpers";
import type { IAppointmentProps } from "./types";

export const Appointment: React.FC<IAppointmentProps> = ({
  id,
  car,
  start,
  duration,
  color,
  description,
  customerName,
  registrationNumber,
  startDate,
  endDate,
  onResize,
}) => {
  const style = calculateAppointmentStyle(start, duration);
  const [isResizing, setIsResizing] = useState(false);
  const [startResizeX, setStartResizeX] = useState<number | null>(null);
  const [initialWidth, setInitialWidth] = useState<number | null>(null);
  const appointmentRef = useRef<HTMLDivElement>(null);

  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: id,
    data: { type: "appointment", id },
  });

  const transformStyle = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
      }
    : {};

  // Rozpoczynamy zmianę rozmiaru
  const handleResizeStart = (e: React.MouseEvent) => {
    e.stopPropagation(); // Zapobiegamy propagacji do DnD

    if (appointmentRef.current) {
      setIsResizing(true);
      setStartResizeX(e.clientX);
      setInitialWidth(appointmentRef.current.getBoundingClientRect().width);

      // Dodajemy event listenery do window
      window.addEventListener("mousemove", handleResizeMove);
      window.addEventListener("mouseup", handleResizeEnd);
    }
  };

  // Obsługujemy ruch podczas zmiany rozmiaru
  const handleResizeMove = (e: MouseEvent) => {
    if (isResizing && startResizeX !== null && initialWidth !== null) {
      const deltaX = e.clientX - startResizeX;
      const containerWidth =
        appointmentRef.current?.parentElement?.getBoundingClientRect().width || 1;

      // Obliczamy jaki procent dnia reprezentuje zmiana w pikselach
      const deltaPercentage = (deltaX / containerWidth) * 100;

      // Obliczamy, ile minut to zmiana
      const deltaMinutes = Math.round((deltaPercentage / 100) * 660);

      // Zaokrąglamy do najbliższych 15 minut
      const roundedDeltaMinutes = Math.round(deltaMinutes / 15) * 15;

      // Obliczamy nową długość (minimalnie 15 minut)
      const newDuration = Math.max(15, duration + roundedDeltaMinutes);

      // Aktualizujemy tylko styl lokalnie podczas przeciągania
      if (appointmentRef.current) {
        const newWidth = initialWidth + deltaX;
        appointmentRef.current.style.width = `${Math.max(30, newWidth)}px`;
      }
    }
  };

  // Kończymy zmianę rozmiaru i zapisujemy zmiany
  const handleResizeEnd = (e: MouseEvent) => {
    if (isResizing && startResizeX !== null && initialWidth !== null && appointmentRef.current) {
      const deltaX = e.clientX - startResizeX;
      const containerWidth =
        appointmentRef.current.parentElement?.getBoundingClientRect().width || 1;

      // Obliczamy jaki procent dnia reprezentuje zmiana w pikselach
      const deltaPercentage = (deltaX / containerWidth) * 100;

      // Obliczamy, ile minut to zmiana
      const deltaMinutes = Math.round((deltaPercentage / 100) * 660);

      // Zaokrąglamy do najbliższych 15 minut
      const roundedDeltaMinutes = Math.round(deltaMinutes / 15) * 15;

      // Obliczamy nową długość (minimalnie 15 minut)
      const newDuration = Math.max(15, duration + roundedDeltaMinutes);

      // Informujemy rodzica o zmianie rozmiaru
      onResize(id, newDuration);

      // Resetujemy style i stan
      appointmentRef.current.style.width = "";
      setIsResizing(false);
      setStartResizeX(null);
      setInitialWidth(null);

      // Usuwamy event listenery
      window.removeEventListener("mousemove", handleResizeMove);
      window.removeEventListener("mouseup", handleResizeEnd);
    }
  };

  // Formatujemy daty dla tooltipa
  const formatDate = (date?: Date): string => {
    if (!date) return "";
    return date.toLocaleString("pl-PL", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Formatujemy dane do wyświetlenia jako tooltip
  const tooltipContent = [
    car,
    description,
    customerName ? `Klient: ${customerName}` : "",
    registrationNumber ? `Nr rej.: ${registrationNumber}` : "",
    startDate ? `Początek: ${formatDate(startDate)}` : "",
    endDate ? `Koniec: ${formatDate(endDate)}` : "",
  ]
    .filter(Boolean)
    .join("\n");

  return (
    <div
      ref={(node) => {
        setNodeRef(node);
        // @ts-ignore
        appointmentRef.current = node;
      }}
      style={{
        ...style,
        ...transformStyle,
        position: "absolute",
        backgroundColor: color || "#3b82f6",
        zIndex: isResizing ? 20 : 10,
        cursor: isResizing ? "ew-resize" : "move",
      }}
      className="flex h-full items-center justify-between overflow-hidden rounded-md border border-gray-300 p-1 text-sm font-medium text-white shadow-sm"
      title={tooltipContent}
      {...(isResizing ? {} : attributes)}
      {...(isResizing ? {} : listeners)}
    >
      <span className="truncate">{car}</span>
      <div
        className="absolute right-0 top-0 h-full w-2 cursor-ew-resize hover:bg-white hover:bg-opacity-20"
        onMouseDown={handleResizeStart}
        onClick={(e) => e.stopPropagation()}
      />
    </div>
  );
};
