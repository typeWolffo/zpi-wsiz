import { zodResolver } from "@hookform/resolvers/zod";
import { createColumnHelper, type ColumnDef } from "@tanstack/react-table";
import { Edit, Plus, Trash } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";

import type { GetMechanicsResponse } from "~/api/generated-api";
import {
  useCreateUserAndMechanic,
  useDeleteMechanic,
  useUpdateMechanic,
} from "~/api/mutations/useMechanicMutations";
import { useMechanics } from "~/api/queries/getMechanics";
import { DataTable } from "~/components/DataTable";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
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
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "~/components/ui/sheet";

type Mechanic = GetMechanicsResponse["data"][number];

const editFormSchema = z.object({
  userId: z.string().min(1, "User ID is required"),
  shiftStart: z.string().min(1, "Shift start time is required"),
  shiftEnd: z.string().min(1, "Shift end time is required"),
});

const createFormSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Valid email is required"),
  shiftStart: z.string().min(1, "Shift start time is required"),
  shiftEnd: z.string().min(1, "Shift end time is required"),
});

type EditFormValues = z.infer<typeof editFormSchema>;
type CreateFormValues = z.infer<typeof createFormSchema>;

export default function Mechanics() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMechanic, setSelectedMechanic] = useState<Mechanic | null>(null);

  const { data: mechanics, isLoading, isError, error: queryError } = useMechanics();

  const { mutate: deleteMechanic } = useDeleteMechanic();
  const { mutate: updateMechanic } = useUpdateMechanic();
  const { mutate: createUserAndMechanic } = useCreateUserAndMechanic();

  const editForm = useForm<EditFormValues>({
    resolver: zodResolver(editFormSchema),
    defaultValues: {
      userId: "",
      shiftStart: "09:00",
      shiftEnd: "17:00",
    },
  });

  const createForm = useForm<CreateFormValues>({
    resolver: zodResolver(createFormSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      shiftStart: "09:00",
      shiftEnd: "17:00",
    },
  });

  const form = selectedMechanic ? editForm : createForm;

  const handleEdit = (mechanic: Mechanic) => {
    setSelectedMechanic(mechanic);
    editForm.reset({
      userId: mechanic.userId,
      shiftStart: mechanic.shiftStart,
      shiftEnd: mechanic.shiftEnd,
    });
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm("Are you sure you want to delete this mechanic?")) {
      deleteMechanic(id);
    }
  };

  const handleAdd = () => {
    setSelectedMechanic(null);
    createForm.reset({
      firstName: "",
      lastName: "",
      email: "",
      shiftStart: "09:00",
      shiftEnd: "17:00",
    });
    setIsModalOpen(true);
  };

  const onSubmitEdit = (data: EditFormValues) => {
    if (selectedMechanic) {
      updateMechanic({
        id: selectedMechanic.id,
        data: {
          userId: data.userId,
          shiftStart: data.shiftStart,
          shiftEnd: data.shiftEnd,
        },
      });
      setIsModalOpen(false);
    }
  };

  const onSubmitCreate = (data: CreateFormValues) => {
    createUserAndMechanic({
      user: {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        role: "employee",
      },
      mechanic: {
        shiftStart: data.shiftStart,
        shiftEnd: data.shiftEnd,
      },
    });
    setIsModalOpen(false);
  };

  const onSubmit = selectedMechanic
    ? editForm.handleSubmit(onSubmitEdit)
    : createForm.handleSubmit(onSubmitCreate);

  const getColumns = () => {
    const columnHelper = createColumnHelper<Mechanic>();

    return [
      columnHelper.accessor("firstName", {
        header: "First Name",
        cell: (info) => info.getValue(),
      }),
      columnHelper.accessor("lastName", {
        header: "Last Name",
        cell: (info) => info.getValue(),
      }),
      columnHelper.accessor("shiftStart", {
        header: "Shift Start",
        cell: (info) => info.getValue(),
      }),
      columnHelper.accessor("shiftEnd", {
        header: "Shift End",
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
            <Button variant="ghost" size="icon" onClick={() => handleEdit(info.row.original)}>
              <Edit className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => handleDelete(info.row.original.id)}>
              <Trash className="h-4 w-4" />
            </Button>
          </div>
        ),
      }),
    ] as ColumnDef<Mechanic, any>[];
  };

  return (
    <div className="container mx-auto py-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Mechanics</CardTitle>
          <Button onClick={handleAdd}>
            <Plus className="mr-2 h-4 w-4" />
            Add Mechanic
          </Button>
        </CardHeader>
        <CardContent>
          {isError ? (
            <div className="flex flex-col items-center justify-center p-8 text-red-500">
              <div className="mb-2 text-lg font-semibold">Failed to load mechanics</div>
              <div className="text-sm">
                {queryError instanceof Error ? queryError.message : "Unknown error occurred"}
              </div>
              <Button variant="outline" className="mt-4" onClick={() => window.location.reload()}>
                Try Again
              </Button>
            </div>
          ) : isLoading ? (
            <div className="flex justify-center p-8">Loading mechanics data...</div>
          ) : (
            <DataTable columns={getColumns()} data={mechanics || []} />
          )}
        </CardContent>
      </Card>

      <Sheet open={isModalOpen} onOpenChange={setIsModalOpen}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>{selectedMechanic ? "Edit Mechanic" : "Add Mechanic"}</SheetTitle>
            <SheetDescription>
              {selectedMechanic
                ? "Make changes to the mechanic details."
                : "Enter details for a new mechanic."}
            </SheetDescription>
          </SheetHeader>
          {selectedMechanic ? (
            <Form {...editForm}>
              <form onSubmit={onSubmit} className="space-y-4 py-4">
                <FormField
                  control={editForm.control}
                  name="userId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>User ID</FormLabel>
                      <FormControl>
                        <Input placeholder="User ID" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={editForm.control}
                  name="shiftStart"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Shift Start Time</FormLabel>
                      <FormControl>
                        <Input type="time" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={editForm.control}
                  name="shiftEnd"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Shift End Time</FormLabel>
                      <FormControl>
                        <Input type="time" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <SheetFooter>
                  <SheetClose asChild>
                    <Button variant="outline">Cancel</Button>
                  </SheetClose>
                  <Button type="submit">Save</Button>
                </SheetFooter>
              </form>
            </Form>
          ) : (
            <Form {...createForm}>
              <form onSubmit={onSubmit} className="space-y-4 py-4">
                <FormField
                  control={createForm.control}
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
                  control={createForm.control}
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
                  control={createForm.control}
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
                  control={createForm.control}
                  name="shiftStart"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Shift Start Time</FormLabel>
                      <FormControl>
                        <Input type="time" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={createForm.control}
                  name="shiftEnd"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Shift End Time</FormLabel>
                      <FormControl>
                        <Input type="time" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <SheetFooter>
                  <SheetClose asChild>
                    <Button variant="outline">Cancel</Button>
                  </SheetClose>
                  <Button type="submit">Add Mechanic</Button>
                </SheetFooter>
              </form>
            </Form>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
