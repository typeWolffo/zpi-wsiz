import { useQuery } from "@tanstack/react-query";
import { ApiClient } from "~/api/api-client";
import { format } from "date-fns";
import { timeOptions } from "../schema";
import { useMemo } from "react";

export function useAppointmentData(appointmentId?: string) {
  const { data: appointmentData, isLoading: isLoadingAppointment } = useQuery({
    queryKey: ["appointment", appointmentId],
    queryFn: async () => {
      if (!appointmentId) return null;
      const response = await ApiClient.api.repairOrderControllerGetRepairOrderById(appointmentId);
      return response.data.data;
    },
    enabled: !!appointmentId,
  });

  const { data: vehicleData, isLoading: isLoadingVehicle } = useQuery({
    queryKey: ["vehicle", appointmentData?.vehicleId],
    queryFn: async () => {
      if (!appointmentData?.vehicleId) return null;
      const response = await ApiClient.api.vehicleControllerGetVehicleById(
        appointmentData.vehicleId,
      );
      return response.data.data;
    },
    enabled: !!appointmentData?.vehicleId,
  });

  const { data: customerData, isLoading: isLoadingCustomer } = useQuery({
    queryKey: ["customer", vehicleData?.customerId],
    queryFn: async () => {
      if (!vehicleData?.customerId) return null;
      const response = await ApiClient.api.customerControllerGetCustomerById(
        vehicleData.customerId,
      );
      return response.data.data;
    },
    enabled: !!vehicleData?.customerId,
  });

  const { data: mechanics } = useQuery({
    queryKey: ["mechanics"],
    queryFn: async () => {
      const response = await ApiClient.api.mechanicControllerGetMechanics();
      return response.data.data;
    },
  });

  const isLoading = isLoadingAppointment || isLoadingVehicle || isLoadingCustomer;

  // Helper function to round time to nearest valid option
  const roundToNearestTimeSlot = (date: Date) => {
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const roundedMinutes = Math.round(minutes / 15) * 15;

    // Handle edge case where rounding minutes to 60
    let adjustedHours = hours;
    let adjustedMinutes = roundedMinutes;

    if (roundedMinutes === 60) {
      adjustedHours = hours + 1;
      adjustedMinutes = 0;
    }

    // Ensure hours are within 7-18 range
    adjustedHours = Math.max(7, Math.min(18, adjustedHours));

    return `${String(adjustedHours).padStart(2, "0")}:${String(adjustedMinutes).padStart(2, "0")}`;
  };

  // Process appointment times for form - memoize this function to prevent unnecessary rerenders
  const getFormattedTimes = useMemo(() => {
    return () => {
      if (!appointmentData) return null;

      const startDate = new Date(appointmentData.startDate);
      const endDate = new Date(appointmentData.endDate);

      const startTimeFormatted = format(startDate, "HH:mm");
      const endTimeFormatted = format(endDate, "HH:mm");

      const isValidStartTime = timeOptions.some((option) => option.value === startTimeFormatted);
      const isValidEndTime = timeOptions.some((option) => option.value === endTimeFormatted);

      const bestStartTime = isValidStartTime
        ? startTimeFormatted
        : roundToNearestTimeSlot(startDate);
      const bestEndTime = isValidEndTime ? endTimeFormatted : roundToNearestTimeSlot(endDate);

      return {
        startDate,
        endDate,
        startTime: bestStartTime,
        endTime: bestEndTime,
      };
    };
  }, [appointmentData]);

  return {
    appointmentData,
    vehicleData,
    customerData,
    mechanics,
    isLoading,
    getFormattedTimes,
  };
}
