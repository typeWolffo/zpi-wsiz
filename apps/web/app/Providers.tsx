import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./api/queryClient";


export function Providers({ children }: { children: React.ReactNode }) {
  return (
      <QueryClientProvider client={queryClient}>
          {children}
      </QueryClientProvider>
  );
}
