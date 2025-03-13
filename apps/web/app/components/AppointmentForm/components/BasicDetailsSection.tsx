import type { UseFormReturn } from "react-hook-form";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "~/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Textarea } from "~/components/ui/textarea";
import type { AppointmentFormValues } from "../schema";

interface BasicDetailsSectionProps {
  form: UseFormReturn<AppointmentFormValues>;
  mechanics?: Array<{ id: string; firstName: string; lastName: string }>;
}

export function BasicDetailsSection({ form, mechanics = [] }: BasicDetailsSectionProps) {
  return (
    <>
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
    </>
  );
}
