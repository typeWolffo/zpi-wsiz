import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "~/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "~/components/ui/sheet";
import { Form } from "~/components/ui/form";
import type { AppointmentFormProps, AppointmentFormValues } from "./schema";
import { appointmentFormSchema } from "./schema";
import { BasicDetailsSection } from "./components/BasicDetailsSection";
import { CustomerSection } from "./components/CustomerSection";
import { DateTimeSection } from "./components/DateTimeSection";
import { useAppointmentData } from "./hooks/useAppointmentData";
import { useAppointmentMutations } from "./hooks/useAppointmentMutations";
import { useCustomerVehicleData } from "./hooks/useCustomerVehicleData";

export const AppointmentForm = ({
  appointmentId,
  defaultValues,
  onClose,
}: AppointmentFormProps) => {
  const [isOpen, setIsOpen] = useState(!!appointmentId);

  // Set up the form with default values
  const form = useForm<AppointmentFormValues>({
    resolver: zodResolver(appointmentFormSchema),
    defaultValues: defaultValues || {
      description: "",
      customerType: "new",
      make: "",
      model: "",
      year: "",
      vin: "",
      registrationNumber: "",
      customerFirstName: "",
      customerLastName: "",
      customerEmail: "",
      customerPhoneNumber: "",
      startDate: new Date(),
      startTime: "08:00",
      endDate: new Date(),
      endTime: "09:00",
      mechanicId: undefined,
      customerId: undefined,
      vehicleId: undefined,
    },
  });

  const handleClose = () => {
    setIsOpen(false);
    form.reset();
    onClose?.();
  };

  // Handle both open and close events
  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    // When closing by clicking outside, also call onClose
    if (!open) {
      form.reset();
      onClose?.();
    }
  };

  // Get appointment data for editing
  const { appointmentData, vehicleData, customerData, mechanics, isLoading, getFormattedTimes } =
    useAppointmentData(appointmentId);

  // Set up mutation functions
  const { submitAppointment } = useAppointmentMutations(appointmentId, handleClose);

  // Ensure sheet opens when appointmentId changes
  useEffect(() => {
    if (appointmentId) {
      setIsOpen(true);
    }
  }, [appointmentId]);

  // Update form with appointment data when editing
  useEffect(() => {
    if (appointmentId && appointmentData && vehicleData && customerData) {
      const formattedTimes = getFormattedTimes();
      if (!formattedTimes) return;

      const { startDate, endDate, startTime, endTime } = formattedTimes;

      form.reset({
        description: appointmentData.description,
        customerType: "existing",
        customerId: customerData.id,
        vehicleId: vehicleData.id,
        startDate,
        startTime,
        endDate,
        endTime,
        mechanicId: appointmentData.assignedMechanicId || undefined,
        // Fill in empty fields for completeness
        make: "",
        model: "",
        year: "",
        vin: "",
        registrationNumber: "",
        customerFirstName: "",
        customerLastName: "",
        customerEmail: "",
        customerPhoneNumber: "",
      });
    }
  }, [appointmentId, appointmentData, vehicleData, customerData, form]);

  // Handle form submission
  const onSubmit = async (data: AppointmentFormValues) => {
    try {
      await submitAppointment(data);
    } catch (error) {
      // Error handling is done in the submitAppointment function
      console.error("Form submission error:", error);
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={handleOpenChange}>
      {!appointmentId ? (
        <SheetTrigger asChild>
          <Button variant="outline">New Appointment</Button>
        </SheetTrigger>
      ) : null}
      <SheetContent className="w-[640px]">
        <SheetHeader>
          <SheetTitle>{appointmentId ? "Edit Appointment" : "New Appointment"}</SheetTitle>
          <SheetDescription>
            {appointmentId
              ? "Update the appointment details below"
              : "Fill in the appointment details below"}
          </SheetDescription>
        </SheetHeader>
        {isLoading ? (
          <div className="flex h-[200px] items-center justify-center">
            <div className="text-sm text-gray-500">Loading appointment data...</div>
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
              {/* Basic details section */}
              <BasicDetailsSection form={form} mechanics={mechanics} />

              {/* Customer and vehicle section */}
              <CustomerSection form={form} />

              {/* Date and time section */}
              <DateTimeSection form={form} />

              {/* Form actions */}
              <div className="flex justify-end space-x-2 pt-4">
                <Button type="button" variant="outline" onClick={handleClose}>
                  Cancel
                </Button>
                <Button type="submit">
                  {appointmentId ? "Update Appointment" : "Create Appointment"}
                </Button>
              </div>
            </form>
          </Form>
        )}
      </SheetContent>
    </Sheet>
  );
};
