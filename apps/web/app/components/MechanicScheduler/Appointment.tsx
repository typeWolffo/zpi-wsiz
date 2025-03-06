import { useDraggable } from "@dnd-kit/core";
import { useState, useRef } from "react";
import { calculateAppointmentStyle, isMultiDayAppointment } from "./helpers";
import type { IAppointmentProps } from "./types";

export const Appointment: React.FC<IAppointmentProps> = ({
  id,
  car,
  start,
  duration,
  color = "#3b82f6",
  description,
  customerName,
  registrationNumber,
  startDate,
  endDate,
  mechanicId,
  onResize,
  onClick,
}) => {
  const [isResizing, setIsResizing] = useState(false);
  const [startResizeX, setStartResizeX] = useState<number | null>(null);
  const [initialWidth, setInitialWidth] = useState<number | null>(null);
  const appointmentRef = useRef<HTMLDivElement>(null);

  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id,
    data: { type: "appointment", id, mechanicId },
  });

  const handleClick = (e: React.MouseEvent) => {
    // Prevent click when dragging or resizing
    if (transform || isResizing) return;
    onClick(id);
  };

  const style = {
    ...calculateAppointmentStyle(start, duration),
    backgroundColor: color,
    transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
  };

  const handleResizeStart = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent drag start

    if (appointmentRef.current) {
      setIsResizing(true);
      setStartResizeX(e.clientX);
      setInitialWidth(appointmentRef.current.getBoundingClientRect().width);

      window.addEventListener("mousemove", handleResizeMove);
      window.addEventListener("mouseup", handleResizeEnd);
    }
  };

  const handleResizeMove = (e: MouseEvent) => {
    if (isResizing && startResizeX !== null && initialWidth !== null && appointmentRef.current) {
      const deltaX = e.clientX - startResizeX;
      const containerWidth =
        appointmentRef.current.parentElement?.getBoundingClientRect().width || 1;

      // Calculate percentage of day
      const deltaPercentage = (deltaX / containerWidth) * 100;

      // Convert to minutes (assuming 11-hour day from 7:00 to 18:00 = 660 minutes)
      const deltaMinutes = Math.round((deltaPercentage / 100) * 660);

      // Round to nearest 15 minutes
      const roundedDeltaMinutes = Math.round(deltaMinutes / 15) * 15;

      // Calculate new duration (minimum 15 minutes)
      const newDuration = Math.max(15, duration + roundedDeltaMinutes);

      // Update width during drag
      const newWidth = initialWidth + deltaX;
      appointmentRef.current.style.width = `${Math.max(30, newWidth)}px`;
    }
  };

  const handleResizeEnd = (e: MouseEvent) => {
    if (isResizing && startResizeX !== null && initialWidth !== null && appointmentRef.current) {
      const deltaX = e.clientX - startResizeX;
      const containerWidth =
        appointmentRef.current.parentElement?.getBoundingClientRect().width || 1;

      const deltaPercentage = (deltaX / containerWidth) * 100;
      const deltaMinutes = Math.round((deltaPercentage / 100) * 660);
      const roundedDeltaMinutes = Math.round(deltaMinutes / 15) * 15;
      const newDuration = Math.max(15, duration + roundedDeltaMinutes);

      // Call parent's resize handler
      onResize(id, newDuration);

      // Reset styles and state
      appointmentRef.current.style.width = "";
      setIsResizing(false);
      setStartResizeX(null);
      setInitialWidth(null);

      window.removeEventListener("mousemove", handleResizeMove);
      window.removeEventListener("mouseup", handleResizeEnd);
    }
  };

  const isMultiDay =
    startDate &&
    endDate &&
    isMultiDayAppointment({
      id,
      car,
      start,
      duration,
      color,
      startDate,
      endDate,
    });

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

  const tooltipContent = [
    car,
    description,
    customerName ? `Klient: ${customerName}` : "",
    registrationNumber ? `Nr rej.: ${registrationNumber}` : "",
    startDate ? `Początek: ${formatDate(startDate)}` : "",
    endDate ? `Koniec: ${formatDate(endDate)}` : "",
    isMultiDay ? "Naprawa wielodniowa" : "",
  ]
    .filter(Boolean)
    .join("\n");

  const multiDayStyles = isMultiDay
    ? {
        borderLeft: startDate && new Date(startDate).getHours() > 7 ? "4px solid white" : "none",
        borderRight: endDate && new Date(endDate).getHours() < 18 ? "4px solid white" : "none",
        background: `repeating-linear-gradient(
          45deg,
          ${color},
          ${color} 10px,
          ${color}dd 10px,
          ${color}dd 20px
        )`,
      }
    : {};

  return (
    <div
      ref={(node) => {
        setNodeRef(node);
        // @ts-ignore - we know this is safe
        appointmentRef.current = node;
      }}
      style={{
        ...style,
        ...multiDayStyles,
        position: "absolute",
        zIndex: isResizing ? 20 : 10,
        cursor: isResizing ? "ew-resize" : "pointer",
      }}
      className="flex h-10 items-center justify-between overflow-hidden rounded px-2 text-white"
      title={tooltipContent}
      {...(isResizing ? {} : attributes)}
      {...(isResizing ? {} : listeners)}
      onClick={handleClick}
    >
      <div className="flex flex-col overflow-hidden">
        <div className="truncate text-sm font-medium">{car}</div>
        <div className="truncate text-xs">
          {customerName} - {registrationNumber}
        </div>
        {description && <div className="truncate text-xs">{description}</div>}
      </div>
      <div
        className="absolute right-0 top-0 h-full w-2 cursor-ew-resize hover:bg-white hover:bg-opacity-20"
        onMouseDown={handleResizeStart}
        onClick={(e) => e.stopPropagation()}
      />
    </div>
  );
};
