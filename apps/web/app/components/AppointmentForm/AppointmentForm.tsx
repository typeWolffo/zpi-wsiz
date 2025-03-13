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
import { useCurrentUserStore } from "~/store/useCurrentUserStore";
import { Loader2 } from "lucide-react";

export const AppointmentForm = ({
  appointmentId,
  defaultValues,
  onClose,
}: AppointmentFormProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showLoadingIndicator, setShowLoadingIndicator] = useState(false);
  const currentUser = useCurrentUserStore((state) => state.currentUser);
  const isEmployee = currentUser?.role === "employee" || false;

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

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);

    if (!open) {
      form.reset();
      onClose?.();
    }
  };

  const { appointmentData, vehicleData, customerData, mechanics, isLoading, getFormattedTimes } =
    useAppointmentData(appointmentId);

  const { submitAppointment } = useAppointmentMutations(appointmentId, handleClose);

  useEffect(() => {
    if (appointmentId && isLoading) {
      setShowLoadingIndicator(true);
    } else {
      setShowLoadingIndicator(false);
    }
  }, [appointmentId, isLoading]);

  useEffect(() => {
    if (appointmentId && appointmentData && vehicleData && customerData && !isLoading) {
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

      setIsOpen(true);
    }
  }, [appointmentId, appointmentData, vehicleData, customerData, form, isLoading]);

  const onSubmit = async (data: AppointmentFormValues) => {
    try {
      await submitAppointment(data);
    } catch (error) {
      console.error("Form submission error:", error);
    }
  };

  return (
    <>
      {showLoadingIndicator && !isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20">
          <div className="rounded-md bg-white p-6 shadow-lg">
            <div className="flex flex-col items-center space-y-2">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-sm font-medium">Loading appointment data...</p>
            </div>
          </div>
        </div>
      )}

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
          {isLoading && appointmentId ? (
            <div className="flex h-[200px] items-center justify-center">
              <div className="flex flex-col items-center space-y-2">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
                <p className="text-sm text-gray-500">Loading appointment data...</p>
              </div>
            </div>
          ) : (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
                <BasicDetailsSection form={form} mechanics={mechanics} isEmployee={isEmployee} />

                <CustomerSection form={form} isEmployee={isEmployee} />

                <DateTimeSection form={form} isEmployee={isEmployee} />

                <div className="flex justify-end space-x-2 pt-4">
                  <Button type="button" variant="outline" onClick={handleClose}>
                    Cancel
                  </Button>
                  {!isEmployee && (
                    <Button type="submit">
                      {appointmentId ? "Update Appointment" : "Create Appointment"}
                    </Button>
                  )}
                </div>
              </form>
            </Form>
          )}
        </SheetContent>
      </Sheet>
    </>
  );
};
