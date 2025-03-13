import { useMutation, useQueryClient } from "@tanstack/react-query";
import { format, parse } from "date-fns";
import { toast } from "sonner";
import { AxiosError } from "axios";
import { ApiClient } from "~/api/api-client";
import type { AppointmentFormValues } from "../schema";
import { ordersQueryOptions } from "~/api/queries/getOrders";

export function useAppointmentMutations(appointmentId?: string, onSuccessCallback?: () => void) {
  const queryClient = useQueryClient();

  const { mutateAsync: createCustomer } = useMutation({
    mutationFn: async (data: AppointmentFormValues) => {
      if (!data.customerFirstName || !data.customerLastName || !data.customerEmail) return null;
      const response = await ApiClient.api.customerControllerCreateCustomer({
        firstName: data.customerFirstName,
        lastName: data.customerLastName,
        email: data.customerEmail,
        phoneNumber: data.customerPhoneNumber,
      });
      return response.data;
    },
  });

  const { mutateAsync: createVehicle } = useMutation({
    mutationFn: async ({
      data,
      customerId,
    }: {
      data: AppointmentFormValues;
      customerId: string;
    }) => {
      if (!data.make || !data.model || !data.year || !data.vin || !data.registrationNumber)
        return null;
      const response = await ApiClient.api.vehicleControllerCreateVehicle({
        customerId,
        make: data.make,
        model: data.model,
        year: data.year,
        vin: data.vin,
        registrationNumber: data.registrationNumber,
      });
      return response.data;
    },
  });

  const { mutateAsync: createRepairOrder } = useMutation({
    mutationFn: async ({ data, vehicleId }: { data: AppointmentFormValues; vehicleId: string }) => {
      const startDateTime = parse(data.startTime, "HH:mm", data.startDate);
      const endDateTime = parse(data.endTime, "HH:mm", data.endDate);

      const response = await ApiClient.api.repairOrderControllerCreateRepairOrder({
        description: data.description,
        startDate: format(startDateTime, "yyyy-MM-dd HH:mm:ss"),
        endDate: format(endDateTime, "yyyy-MM-dd HH:mm:ss"),
        vehicleId,
        assignedMechanicId: data.mechanicId,
      });
      return response.data;
    },
    onSuccess: () => {
      toast.success("Successfully created repair order");
      queryClient.invalidateQueries(ordersQueryOptions);
      onSuccessCallback?.();
    },
    onError: (error) => {
      if (error instanceof AxiosError) {
        return toast.error(error.response?.data.message);
      }
      toast.error(error.message);
    },
  });

  const { mutateAsync: updateRepairOrder } = useMutation({
    mutationFn: async (data: AppointmentFormValues) => {
      if (!appointmentId) return;

      const startDateTime = parse(data.startTime, "HH:mm", data.startDate);
      const endDateTime = parse(data.endTime, "HH:mm", data.endDate);

      const response = await ApiClient.api.repairOrderControllerUpdateRepairOrder(appointmentId, {
        description: data.description,
        startDate: format(startDateTime, "yyyy-MM-dd HH:mm:ss"),
        endDate: format(endDateTime, "yyyy-MM-dd HH:mm:ss"),
        assignedMechanicId: data.mechanicId,
      });
      return response.data;
    },
    onSuccess: () => {
      toast.success("Successfully updated repair order");
      queryClient.invalidateQueries(ordersQueryOptions);
      onSuccessCallback?.();
    },
    onError: (error) => {
      if (error instanceof AxiosError) {
        return toast.error(error.response?.data.message);
      }
      toast.error(error.message);
    },
  });

  
  const submitAppointment = async (data: AppointmentFormValues) => {
    try {
      if (appointmentId) {
        await updateRepairOrder(data);
      } else {
        let finalVehicleId: string;

        if (data.customerType === "new") {
          const customerResponse = await createCustomer(data);
          if (!customerResponse) throw new Error("Failed to create customer");

          const vehicleResponse = await createVehicle({
            data,
            customerId: customerResponse.data.id,
          });
          if (!vehicleResponse) throw new Error("Failed to create vehicle");

          finalVehicleId = vehicleResponse.data.id;
        } else {
          if (!data.vehicleId) throw new Error("No vehicle selected");
          finalVehicleId = data.vehicleId;
        }

        await createRepairOrder({ data, vehicleId: finalVehicleId });
      }
    } catch (error) {
      console.error("Error with appointment:", error);
      toast.error("Failed to save appointment");
      throw error;
    }
  };

  return {
    createCustomer,
    createVehicle,
    createRepairOrder,
    updateRepairOrder,
    submitAppointment,
  };
}
