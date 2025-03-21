import { useDraggable } from "@dnd-kit/core";
import { useState, useRef } from "react";
import { calculateAppointmentStyle, isMultiDayAppointment } from "./helpers";
import type { IAppointmentProps } from "./types";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "~/components/ui/tooltip";

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
  isEmployee,
}) => {
  const [isResizing, setIsResizing] = useState(false);
  const [startResizeX, setStartResizeX] = useState<number | null>(null);
  const [initialWidth, setInitialWidth] = useState<number | null>(null);
  const appointmentRef = useRef<HTMLDivElement>(null);

  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id,
    data: { type: "appointment", id, mechanicId },
    disabled: isEmployee,
  });

  const handleClick = (e: React.MouseEvent) => {
    if (transform || isResizing) return;
    onClick(id);
  };

  const style = {
    ...calculateAppointmentStyle(start, duration),
    backgroundColor: color,
    transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
  };

  const handleResizeStart = (e: React.MouseEvent) => {
    if (isEmployee) return;
    e.stopPropagation();

    if (appointmentRef.current) {
      setIsResizing(true);
      setStartResizeX(e.clientX);
      setInitialWidth(appointmentRef.current.getBoundingClientRect().width);

      window.addEventListener("mousemove", handleResizeMove);
      window.addEventListener("mouseup", handleResizeEnd);
    }
  };

  const handleResizeMove = (e: MouseEvent) => {
    if (isEmployee) return;
    if (isResizing && startResizeX !== null && initialWidth !== null && appointmentRef.current) {
      const deltaX = e.clientX - startResizeX;

      const newWidth = initialWidth + deltaX;
      appointmentRef.current.style.width = `${Math.max(30, newWidth)}px`;
    }
  };

  const handleResizeEnd = (e: MouseEvent) => {
    if (isEmployee) return;
    if (isResizing && startResizeX !== null && initialWidth !== null && appointmentRef.current) {
      const deltaX = e.clientX - startResizeX;
      const containerWidth =
        appointmentRef.current.parentElement?.getBoundingClientRect().width || 1;

      const deltaPercentage = (deltaX / containerWidth) * 100;
      const deltaMinutes = Math.round((deltaPercentage / 100) * 660);
      const roundedDeltaMinutes = Math.round(deltaMinutes / 15) * 15;
      const newDuration = Math.max(15, duration + roundedDeltaMinutes);

      onResize(id, newDuration);

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
    return date.toLocaleString("en-US", {
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
    customerName ? `Client: ${customerName}` : "",
    registrationNumber ? `Reg. No.: ${registrationNumber}` : "",
    startDate ? `Start: ${formatDate(startDate)}` : "",
    endDate ? `End: ${formatDate(endDate)}` : "",
    isMultiDay ? "Multi-day repair" : "",
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
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            ref={(node) => {
              setNodeRef(node);
              appointmentRef.current = node;
            }}
            style={{
              ...style,
              ...multiDayStyles,
              position: "absolute",
              zIndex: isResizing ? 20 : 10,
              cursor: isResizing ? "ew-resize" : "pointer",
            }}
            className="flex h-24 items-center justify-between overflow-hidden rounded px-2 text-white"
            {...(isResizing ? {} : attributes)}
            {...(isResizing ? {} : listeners)}
            onClick={handleClick}
          >
            <div className="flex flex-col overflow-hidden">
              <div className="truncate text-sm font-medium">{car}</div>
              <div className="truncate text-xs">
                {customerName} - {registrationNumber}
              </div>
            </div>
            {!isEmployee && (
              <div
                className="absolute right-0 top-0 h-full w-2 cursor-ew-resize hover:bg-white hover:bg-opacity-20"
                onMouseDown={handleResizeStart}
                onClick={(e) => e.stopPropagation()}
              />
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-xs whitespace-pre-line">
          {tooltipContent}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
