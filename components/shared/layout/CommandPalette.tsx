"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@qpub/qui/lite";
import { navItems } from "./nav";
import { useUiStore } from "@/lib/stores/uiStore";

export function CommandPalette() {
  const open = useUiStore((s) => s.commandOpen);
  const setOpen = useUiStore((s) => s.setCommandOpen);
  const router = useRouter();

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen(!open);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, setOpen]);

  function go(href: string) {
    setOpen(false);
    router.push(href);
  }

  return (
    <CommandDialog isOpen={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Jump to page or action…" />
      <CommandList>
        <CommandEmpty>No results.</CommandEmpty>
        <CommandGroup heading="Navigate">
          {navItems.map((item) => (
            <CommandItem key={item.href} onSelect={() => go(item.href)}>
              {item.label}
            </CommandItem>
          ))}
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Actions">
          <CommandItem onSelect={() => go("/tenants?create=1")}>
            Create tenant…
          </CommandItem>
          <CommandItem onSelect={() => go("/console")}>
            Open debug console
          </CommandItem>
          <CommandItem onSelect={() => go("/servers")}>
            Manage servers
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
