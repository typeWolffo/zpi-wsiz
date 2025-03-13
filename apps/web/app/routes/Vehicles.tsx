import { zodResolver } from "@hookform/resolvers/zod";
import { createColumnHelper, type ColumnDef } from "@tanstack/react-table";
import { Edit, Plus, Trash, User } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";

import type { GetVehiclesResponse } from "~/api/generated-api";
import {
  useCreateVehicle,
  useDeleteVehicle,
  useUpdateVehicle,
} from "~/api/mutations/useVehicleMutations";
import { useCustomerById, useCustomers } from "~/api/queries/getCustomers";
import { useVehicles } from "~/api/queries/getVehicles";
import { DataTable } from "~/components/DataTable";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "~/components/ui/sheet";

type Vehicle = GetVehiclesResponse["data"][number];

const formSchema = z.object({
  make: z.string().min(1, "Make is required"),
  model: z.string().min(1, "Model is required"),
  year: z.string().regex(/^\d{4}$/, "Year must be a 4-digit number"),
  registrationNumber: z.string().min(1, "Registration number is required"),
  vin: z.string().optional(),
  customerId: z.string().min(1, "Customer ID is required"),
});

type FormValues = z.infer<typeof formSchema>;

export default function Vehicles() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [isCustomerDialogOpen, setIsCustomerDialogOpen] = useState(false);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);

  const { data: vehicles, isLoading, isError, error: queryError } = useVehicles();
  const { data: customers } = useCustomers();
  const { data: selectedCustomer, isLoading: isCustomerLoading } = useCustomerById(
    selectedCustomerId || "",
  );
  const { mutate: deleteVehicle } = useDeleteVehicle();
  const { mutate: createVehicle } = useCreateVehicle();
  const { mutate: updateVehicle } = useUpdateVehicle();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      make: "",
      model: "",
      year: "",
      registrationNumber: "",
      vin: "",
      customerId: "",
    },
  });

  const handleEdit = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
    form.reset({
      make: vehicle.make,
      model: vehicle.model,
      year: vehicle.year,
      registrationNumber: vehicle.registrationNumber,
      vin: vehicle.vin || "",
      customerId: vehicle.customerId,
    });
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm("Are you sure you want to delete this vehicle?")) {
      deleteVehicle(id);
    }
  };

  const handleViewCustomer = (customerId: string) => {
    setSelectedCustomerId(customerId);
    setIsCustomerDialogOpen(true);
  };

  const handleAdd = () => {
    setSelectedVehicle(null);
    form.reset({
      make: "",
      model: "",
      year: "",
      registrationNumber: "",
      vin: "",
      customerId: "",
    });
    setIsModalOpen(true);
  };

  const onSubmit = (data: FormValues) => {
    if (selectedVehicle) {
      updateVehicle({
        id: selectedVehicle.id,
        data: {
          make: data.make,
          model: data.model,
          year: data.year,
          registrationNumber: data.registrationNumber,
          vin: data.vin || "",
          customerId: data.customerId,
        },
      });
    } else {
      createVehicle({
        data: {
          make: data.make,
          model: data.model,
          year: data.year,
          registrationNumber: data.registrationNumber,
          vin: data.vin || "",
          customerId: data.customerId,
        },
      });
    }
    setIsModalOpen(false);
  };

  const getColumns = () => {
    const columnHelper = createColumnHelper<Vehicle>();

    return [
      columnHelper.accessor("make", {
        header: "Make",
        cell: (info) => info.getValue(),
      }),
      columnHelper.accessor("model", {
        header: "Model",
        cell: (info) => info.getValue(),
      }),
      columnHelper.accessor("year", {
        header: "Year",
        cell: (info) => info.getValue(),
      }),
      columnHelper.accessor("registrationNumber", {
        header: "Registration",
        cell: (info) => info.getValue(),
      }),
      columnHelper.accessor((row) => `${row.firstName} ${row.lastName}`, {
        id: "customerName",
        header: "Customer",
        cell: (info) => info.getValue(),
      }),
      columnHelper.accessor("createdAt", {
        header: "Created At",
        cell: (info) => new Date(info.getValue()).toLocaleDateString(),
      }),
      columnHelper.display({
        id: "actions",
        header: "Actions",
        cell: (info) => (
          <div className="flex space-x-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleViewCustomer(info.row.original.customerId)}
              title="View Customer"
            >
              <User className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleEdit(info.row.original)}
              title="Edit Vehicle"
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleDelete(info.row.original.id)}
              title="Delete Vehicle"
            >
              <Trash className="h-4 w-4" />
            </Button>
          </div>
        ),
      }),
    ] as ColumnDef<Vehicle, any>[];
  };

  return (
    <div className="container mx-auto py-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Vehicles</CardTitle>
          <Button onClick={handleAdd}>
            <Plus className="mr-2 h-4 w-4" />
            Add Vehicle
          </Button>
        </CardHeader>
        <CardContent>
          {isError ? (
            <div className="flex flex-col items-center justify-center p-8 text-red-500">
              <div className="mb-2 text-lg font-semibold">Failed to load vehicles</div>
              <div className="text-sm">
                {queryError instanceof Error ? queryError.message : "Unknown error occurred"}
              </div>
              <Button variant="outline" className="mt-4" onClick={() => window.location.reload()}>
                Try Again
              </Button>
            </div>
          ) : isLoading ? (
            <div className="flex justify-center p-8">Loading vehicles data...</div>
          ) : (
            <DataTable columns={getColumns()} data={vehicles || []} />
          )}
        </CardContent>
      </Card>

      <Sheet open={isModalOpen} onOpenChange={setIsModalOpen}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>{selectedVehicle ? "Edit Vehicle" : "Add Vehicle"}</SheetTitle>
            <SheetDescription>
              {selectedVehicle
                ? "Make changes to the vehicle details."
                : "Enter details for a new vehicle."}
            </SheetDescription>
          </SheetHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
              <FormField
                control={form.control}
                name="make"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Make</FormLabel>
                    <FormControl>
                      <Input placeholder="Make" {...field} />
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
                      <Input placeholder="Model" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="year"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Year</FormLabel>
                    <FormControl>
                      <Input placeholder="Year" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="registrationNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Registration Number</FormLabel>
                    <FormControl>
                      <Input placeholder="Registration Number" {...field} />
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
                      <Input placeholder="VIN (optional)" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="customerId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Customer</FormLabel>
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
              <SheetFooter>
                <SheetClose asChild>
                  <Button variant="outline">Cancel</Button>
                </SheetClose>
                <Button type="submit">{selectedVehicle ? "Save Changes" : "Add Vehicle"}</Button>
              </SheetFooter>
            </form>
          </Form>
        </SheetContent>
      </Sheet>

      <Dialog open={isCustomerDialogOpen} onOpenChange={setIsCustomerDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Customer Details</DialogTitle>
            <DialogDescription>Detailed information about the vehicle owner.</DialogDescription>
          </DialogHeader>
          {isCustomerLoading ? (
            <div className="flex items-center justify-center py-8">Loading customer details...</div>
          ) : selectedCustomer ? (
            <div className="mt-4 space-y-4">
              <div className="grid grid-cols-2 gap-4 gap-x-48">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">First Name</h3>
                  <p className="mt-1">{selectedCustomer.data.firstName}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Last Name</h3>
                  <p className="mt-1">{selectedCustomer.data.lastName}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Email</h3>
                  <p className="mt-1">{selectedCustomer.data.email}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Phone Number</h3>
                  <p className="mt-1">{selectedCustomer.data.phoneNumber || "N/A"}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Customer Since</h3>
                  <p className="mt-1">
                    {new Date(selectedCustomer.data.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="pt-4">
                <Button
                  variant="outline"
                  onClick={() => setIsCustomerDialogOpen(false)}
                  className="w-full"
                >
                  Close
                </Button>
              </div>
            </div>
          ) : (
            <div className="py-8 text-center text-gray-500">Customer details not found.</div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
