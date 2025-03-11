import React, { useState } from "react";
import { createColumnHelper, type ColumnDef } from "@tanstack/react-table";
import { Link } from "react-router";
import { toast } from "sonner";
import { Edit, Trash, Plus, Car } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import { useCustomers } from "~/api/queries/getCustomers";
import { useVehiclesByCustomerId } from "~/api/queries/getVehicles";
import {
  useDeleteCustomer,
  useCreateCustomer,
  useUpdateCustomer,
} from "~/api/mutations/useCustomerMutations";
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
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetFooter,
  SheetClose,
} from "~/components/ui/sheet";
import type { GetCustomersResponse } from "~/api/generated-api";

type Customer = GetCustomersResponse["data"][number];

const formSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  phoneNumber: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function Clients() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [isVehiclesDialogOpen, setIsVehiclesDialogOpen] = useState(false);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);

  const { data: customers, isLoading } = useCustomers();
  const { data: customerVehicles, isLoading: isVehiclesLoading } = useVehiclesByCustomerId(
    selectedCustomerId || "",
  );
  const { mutate: deleteCustomer } = useDeleteCustomer();
  const { mutate: createCustomer } = useCreateCustomer();
  const { mutate: updateCustomer } = useUpdateCustomer();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phoneNumber: "",
    },
  });

  const handleEdit = (customer: Customer) => {
    setSelectedCustomer(customer);
    form.reset({
      firstName: customer.firstName,
      lastName: customer.lastName,
      email: customer.email,
      phoneNumber: customer.phoneNumber || "",
    });
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm("Are you sure you want to delete this customer?")) {
      deleteCustomer(id);
    }
  };

  const handleViewVehicles = (customerId: string) => {
    setSelectedCustomerId(customerId);
    setIsVehiclesDialogOpen(true);
  };

  const handleAdd = () => {
    setSelectedCustomer(null);
    form.reset({
      firstName: "",
      lastName: "",
      email: "",
      phoneNumber: "",
    });
    setIsModalOpen(true);
  };

  const onSubmit = (data: FormValues) => {
    if (selectedCustomer) {
      updateCustomer({
        id: selectedCustomer.id,
        data: {
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          phoneNumber: data.phoneNumber,
        },
      });
    } else {
      createCustomer({
        data: {
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          phoneNumber: data.phoneNumber,
        },
      });
    }
    setIsModalOpen(false);
  };

  const columnHelper = createColumnHelper<Customer>();

  const columns: ColumnDef<Customer, any>[] = [
    columnHelper.accessor("firstName", {
      header: "First Name",
      cell: (info) => info.getValue(),
    }),
    columnHelper.accessor("lastName", {
      header: "Last Name",
      cell: (info) => info.getValue(),
    }),
    columnHelper.accessor("email", {
      header: "Email",
      cell: (info) => info.getValue(),
    }),
    columnHelper.accessor("phoneNumber", {
      header: "Phone",
      cell: (info) => info.getValue() || "N/A",
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
            onClick={() => handleViewVehicles(info.row.original.id)}
            title="View Vehicles"
          >
            <Car className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleEdit(info.row.original)}
            title="Edit Customer"
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleDelete(info.row.original.id)}
            title="Delete Customer"
          >
            <Trash className="h-4 w-4" />
          </Button>
        </div>
      ),
    }),
  ];

  const vehicleColumnHelper = createColumnHelper<any>();
  const vehicleColumns: ColumnDef<any, any>[] = [
    vehicleColumnHelper.accessor("make", {
      header: "Make",
      cell: (info) => info.getValue(),
    }),
    vehicleColumnHelper.accessor("model", {
      header: "Model",
      cell: (info) => info.getValue(),
    }),
    vehicleColumnHelper.accessor("year", {
      header: "Year",
      cell: (info) => info.getValue(),
    }),
    vehicleColumnHelper.accessor("registrationNumber", {
      header: "Registration",
      cell: (info) => info.getValue(),
    }),
    vehicleColumnHelper.accessor("vin", {
      header: "VIN",
      cell: (info) => info.getValue(),
    }),
  ];

  const selectedCustomerData = selectedCustomerId
    ? customers?.find((customer) => customer.id === selectedCustomerId)
    : null;

  return (
    <div className="container mx-auto py-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Customers</CardTitle>
          <Button onClick={handleAdd}>
            <Plus className="mr-2 h-4 w-4" />
            Add Customer
          </Button>
        </CardHeader>
        <CardContent>
          <DataTable columns={columns} data={customers || []} isLoading={isLoading} />
        </CardContent>
      </Card>

      <Sheet open={isModalOpen} onOpenChange={setIsModalOpen}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>{selectedCustomer ? "Edit Customer" : "Add Customer"}</SheetTitle>
            <SheetDescription>
              {selectedCustomer
                ? "Make changes to the customer details."
                : "Enter details for a new customer."}
            </SheetDescription>
          </SheetHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>First Name</FormLabel>
                    <FormControl>
                      <Input placeholder="First Name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Last Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Last Name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="Email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="phoneNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number</FormLabel>
                    <FormControl>
                      <Input placeholder="Phone Number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <SheetFooter>
                <SheetClose asChild>
                  <Button variant="outline">Cancel</Button>
                </SheetClose>
                <Button type="submit">{selectedCustomer ? "Save Changes" : "Add Customer"}</Button>
              </SheetFooter>
            </form>
          </Form>
        </SheetContent>
      </Sheet>

      <Dialog open={isVehiclesDialogOpen} onOpenChange={setIsVehiclesDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>
              Vehicles for {selectedCustomerData?.firstName} {selectedCustomerData?.lastName}
            </DialogTitle>
            <DialogDescription>All vehicles registered to this customer.</DialogDescription>
          </DialogHeader>
          {isVehiclesLoading ? (
            <div className="flex items-center justify-center py-8">Loading vehicles...</div>
          ) : customerVehicles && customerVehicles.data?.length > 0 ? (
            <div className="mt-4">
              <DataTable columns={vehicleColumns} data={customerVehicles.data} isLoading={false} />
            </div>
          ) : (
            <div className="py-8 text-center text-gray-500">
              No vehicles found for this customer.
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
