import * as z from "zod";

export const timeOptions = Array.from({ length: (18 - 7) * 4 + 1 }, (_, i) => {
  const hour = Math.floor(i / 4) + 7; // Start from 7:00
  const minute = (i % 4) * 15;
  return {
    value: `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`,
    label: `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`,
  };
});

export const appointmentFormSchema = z
  .object({
    description: z.string().min(1, "Description is required"),
    // Customer selection
    customerType: z.enum(["existing", "new"]),
    customerId: z.string().optional(),
    // Vehicle selection
    vehicleId: z.string().optional(),
    // New customer details
    customerFirstName: z.string().optional(),
    customerLastName: z.string().optional(),
    customerEmail: z.string().optional(),
    customerPhoneNumber: z.string().optional(),
    // New vehicle details
    make: z.string().optional(),
    model: z.string().optional(),
    year: z.string().optional(),
    vin: z.string().optional(),
    registrationNumber: z.string().optional(),
    // Appointment details
    startDate: z.date(),
    startTime: z.string(),
    endDate: z.date(),
    endTime: z.string(),
    mechanicId: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.customerType === "new") {
      if (!data.customerFirstName) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "First name is required for new customers",
          path: ["customerFirstName"],
        });
      }
      if (!data.customerLastName) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Last name is required for new customers",
          path: ["customerLastName"],
        });
      }
      if (!data.customerEmail) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Email is required for new customers",
          path: ["customerEmail"],
        });
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.customerEmail)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Invalid email address",
          path: ["customerEmail"],
        });
      }
      if (!data.make) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Make is required for new vehicles",
          path: ["make"],
        });
      }
      if (!data.model) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Model is required for new vehicles",
          path: ["model"],
        });
      }
      if (!data.year) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Year is required for new vehicles",
          path: ["year"],
        });
      }
      if (!data.vin) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "VIN is required for new vehicles",
          path: ["vin"],
        });
      }
      if (!data.registrationNumber) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Registration number is required for new vehicles",
          path: ["registrationNumber"],
        });
      }
    } else if (data.customerType === "existing") {
      if (!data.customerId) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Please select a customer",
          path: ["customerId"],
        });
      }
      if (!data.vehicleId) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Please select a vehicle",
          path: ["vehicleId"],
        });
      }
    }

    // Validate that end date/time is after start date/time
    const startDateTime = new Date(data.startDate);
    const endDateTime = new Date(data.endDate);
    startDateTime.setHours(
      parseInt(data.startTime.split(":")[0]),
      parseInt(data.startTime.split(":")[1]),
    );
    endDateTime.setHours(
      parseInt(data.endTime.split(":")[0]),
      parseInt(data.endTime.split(":")[1]),
    );

    if (endDateTime <= startDateTime) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "End time must be after start time",
        path: ["endTime"],
      });
    }
  });

export type AppointmentFormValues = z.infer<typeof appointmentFormSchema>;

export interface AppointmentFormProps {
  appointmentId?: string;
  defaultValues?: Partial<AppointmentFormValues>;
  onClose?: () => void;
}
