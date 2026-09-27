"use client";

import { useTheme } from "next-themes";
import { MonitorCog, MoonStar, SunMedium } from "lucide-react";
import { ToggleGroup, ToggleGroupItem } from "@qpub/qui/lite";
import { useEffect, useState } from "react";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return <div className="h-8" aria-hidden />;
  }

  return (
    <div className="flex items-center justify-between gap-2 px-2 py-1 text-sm">
      <span className="text-muted">Theme</span>
      <div className="flex items-center gap-1">
        <span className="text-[0.625rem] text-muted capitalize">{theme ?? "system"}</span>
        <ToggleGroup
          type="single"
          size="sm"
          variant="bordered"
          className="h-6 rounded-full"
          value={theme ?? "system"}
          onValueChange={(value) => {
            if (value) setTheme(value);
          }}
        >
          <ToggleGroupItem
            value="system"
            aria-label="System"
            className="-ms-[0.0625rem] h-6 w-6 rounded-full first:rounded-l-full data-[variant=bordered]:border-b data-[variant=bordered]:border-t data-[variant=bordered]:first:border-l data-[variant=bordered]:first:border-border data-[variant=bordered]:border-border"
          >
            <MonitorCog className="size-3.5" strokeWidth={2.5} />
          </ToggleGroupItem>
          <ToggleGroupItem
            value="light"
            aria-label="Light"
            className="h-6 w-6 rounded-full data-[variant=bordered]:border-b data-[variant=bordered]:border-t data-[variant=bordered]:border-border"
          >
            <SunMedium className="size-3.5" strokeWidth={2.5} />
          </ToggleGroupItem>
          <ToggleGroupItem
            value="dark"
            aria-label="Dark"
            className="-me-[0.0625rem] h-6 w-6 rounded-full last:rounded-r-full data-[variant=bordered]:border-b data-[variant=bordered]:border-r data-[variant=bordered]:border-t data-[variant=bordered]:last:border-border data-[variant=bordered]:border-border"
          >
            <MoonStar className="size-3.5" strokeWidth={2.5} />
          </ToggleGroupItem>
        </ToggleGroup>
      </div>
    </div>
  );
}
