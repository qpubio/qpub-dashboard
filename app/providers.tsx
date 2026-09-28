"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AppearanceProvider } from "@qpub/qui";
import { ThemeProvider } from "next-themes";
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
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        <AppearanceProvider appearance="terminal" density="compact">
          {children}
        </AppearanceProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
