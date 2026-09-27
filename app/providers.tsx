"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AppearanceProvider } from "@qpub/qui";
import { useState } from "react";

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: { staleTime: 500, refetchOnWindowFocus: true },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      <AppearanceProvider appearance="terminal" density="compact">
        {children}
      </AppearanceProvider>
    </QueryClientProvider>
  );
}
