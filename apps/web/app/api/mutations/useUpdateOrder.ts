import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";

import { toast } from "sonner";

import { ApiClient } from "../api-client";
import type { UpdateRepairOrderBody } from "../generated-api";

type EnrollCourseOptions = {
  id: string;
  data: UpdateRepairOrderBody;
};

export function useUpdateRepairOrder() {
  return useMutation({
    mutationFn: async (options: EnrollCourseOptions) => {
      const response = await ApiClient.api.repairOrderControllerUpdateRepairOrder(
        options.id,
        options.data,
      );

      return response.data;
    },
    onSuccess: () => {
      toast.success("Successfully updated repair order");
    },
    onError: (error) => {
      if (error instanceof AxiosError) {
        return toast.error(error.response?.data.message);
      }
      toast.error(error.message);
    },
  });
}
