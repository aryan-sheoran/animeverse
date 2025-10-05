"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/utils/orpc";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}
