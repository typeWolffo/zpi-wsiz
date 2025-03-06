import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ApiClient } from "~/api/api-client";
import { ordersQueryOptions } from "~/api/queries/getOrders";
import { Button } from "../ui/button";
import { Calendar } from "../ui/calendar";
import { Input } from "../ui/input";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "~/components/ui/sheet";
import { Textarea } from "~/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format, parse, setHours, setMinutes } from "date-fns";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { RadioGroup, RadioGroupItem } from "~/components/ui/radio-group";

const timeOptions = Array.from({ length: 24 * 4 }, (_, i) => {
  const hour = Math.floor(i / 4);
  const minute = (i % 4) * 15;
  return {
    value: `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`,
    label: `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`,
  };
});

const appointmentFormSchema = z
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
    const startDateTime = parse(data.startTime, "HH:mm", data.startDate);
    const endDateTime = parse(data.endTime, "HH:mm", data.endDate);
    if (endDateTime <= startDateTime) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "End time must be after start time",
        path: ["endTime"],
      });
    }
  });

type AppointmentFormValues = z.infer<typeof appointmentFormSchema>;

interface AppointmentFormProps {
  appointmentId?: string;
  defaultValues?: Partial<AppointmentFormValues>;
  onClose?: () => void;
}

export const AppointmentForm = ({
  appointmentId,
  defaultValues,
  onClose,
}: AppointmentFormProps) => {
  const [isOpen, setIsOpen] = useState(!!appointmentId);
  const queryClient = useQueryClient();
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>();

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
    },
  });

  const customerType = form.watch("customerType");
  const customerId = form.watch("customerId");

  // Fetch mechanics for the dropdown
  const { data: mechanics } = useQuery({
    queryKey: ["mechanics"],
    queryFn: async () => {
      const response = await ApiClient.api.mechanicControllerGetMechanics();
      return response.data.data;
    },
  });

  // Fetch customers for the dropdown
  const { data: customers } = useQuery({
    queryKey: ["customers"],
    queryFn: async () => {
      const response = await ApiClient.api.customerControllerGetCustomers();
      return response.data.data;
    },
  });

  // Fetch vehicles for the selected customer
  const { data: vehicles } = useQuery({
    queryKey: ["vehicles", selectedCustomerId],
    queryFn: async () => {
      if (!selectedCustomerId) return null;
      const response =
        await ApiClient.api.vehicleControllerGetVehiclesByCustomerId(selectedCustomerId);
      return response.data.data;
    },
    enabled: !!selectedCustomerId,
  });

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
      handleClose();
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
      handleClose();
    },
    onError: (error) => {
      if (error instanceof AxiosError) {
        return toast.error(error.response?.data.message);
      }
      toast.error(error.message);
    },
  });

  useEffect(() => {
    if (appointmentId) {
      setIsOpen(true);
      // Load appointment data if editing
      ApiClient.api
        .repairOrderControllerGetRepairOrderById(appointmentId)
        .then(async (response) => {
          const data = response.data.data;
          if (!data.vehicleId) {
            throw new Error("No vehicle ID found for appointment");
          }

          const startDate = new Date(data.startDate);
          const endDate = new Date(data.endDate);

          // Get vehicle details
          const vehicleResponse = await ApiClient.api.vehicleControllerGetVehicleById(
            data.vehicleId,
          );
          const vehicle = vehicleResponse.data.data;

          if (!vehicle.customerId) {
            throw new Error("No customer ID found for vehicle");
          }

          // Get customer details
          const customerResponse = await ApiClient.api.customerControllerGetCustomerById(
            vehicle.customerId,
          );
          const customer = customerResponse.data.data;

          setSelectedCustomerId(customer.id);

          form.reset({
            description: data.description,
            customerType: "existing",
            customerId: customer.id,
            vehicleId: vehicle.id,
            startDate,
            startTime: format(startDate, "HH:mm"),
            endDate,
            endTime: format(endDate, "HH:mm"),
            mechanicId: data.assignedMechanicId || undefined,
          });
        })
        .catch((error) => {
          toast.error("Failed to load appointment data");
          console.error(error);
          handleClose();
        });
    }
  }, [appointmentId, form]);

  // Update vehicles when customer changes
  useEffect(() => {
    if (customerId) {
      setSelectedCustomerId(customerId);
    }
  }, [customerId]);

  const onSubmit = async (data: AppointmentFormValues) => {
    try {
      if (appointmentId) {
        await updateRepairOrder(data);
      } else {
        let finalVehicleId: string;

        if (data.customerType === "new") {
          // 1. Create customer
          const customerResponse = await createCustomer(data);
          if (!customerResponse) throw new Error("Failed to create customer");

          // 2. Create vehicle
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

        // 3. Create repair order
        await createRepairOrder({ data, vehicleId: finalVehicleId });
      }
    } catch (error) {
      console.error("Error creating appointment:", error);
      toast.error("Failed to create appointment");
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    form.reset();
    onClose?.();
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
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
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea {...field} placeholder="Enter repair description" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="mechanicId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Assign Mechanic</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a mechanic" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {mechanics?.map((mechanic) => (
                        <SelectItem key={mechanic.id} value={mechanic.id}>
                          {mechanic.firstName} {mechanic.lastName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="customerType"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>Customer</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex flex-col space-y-1"
                    >
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="existing" />
                        </FormControl>
                        <FormLabel className="font-normal">Select Existing Customer</FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="new" />
                        </FormControl>
                        <FormLabel className="font-normal">Create New Customer</FormLabel>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {customerType === "existing" ? (
              <>
                <FormField
                  control={form.control}
                  name="customerId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Select Customer</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a customer" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {customers?.map((customer) => (
                            <SelectItem key={customer.id} value={customer.id}>
                              {customer.firstName} {customer.lastName} ({customer.email})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="vehicleId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Select Vehicle</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a vehicle" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {vehicles?.map((vehicle) => (
                            <SelectItem key={vehicle.id} value={vehicle.id}>
                              {vehicle.make} {vehicle.model} ({vehicle.year}) -{" "}
                              {vehicle.registrationNumber}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="customerFirstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>First Name</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Customer first name" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="customerLastName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Last Name</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Customer last name" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="customerEmail"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input {...field} type="email" placeholder="Customer email" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="customerPhoneNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Customer phone number" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="make"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Make</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Vehicle make" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="model"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Model</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Vehicle model" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="year"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Year</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Vehicle year" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="vin"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>VIN</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Vehicle VIN" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="registrationNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Registration Number</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Vehicle registration number" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="startDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Start Date</FormLabel>
                      <FormControl>
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          initialFocus
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="startTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Start Time</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select time" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {timeOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="endDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>End Date</FormLabel>
                      <FormControl>
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          initialFocus
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="endTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>End Time</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select time" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {timeOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

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
      </SheetContent>
    </Sheet>
  );
};
