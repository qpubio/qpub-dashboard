import { cn } from "@/lib/utils";

export function DataPanel({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("border border-border text-foreground", className)}>{children}</div>
  );
}
