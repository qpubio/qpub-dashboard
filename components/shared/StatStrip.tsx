import { cn } from "@/lib/utils";

type Stat = { label: string; value: string | number; hint?: string };

export function StatStrip({ stats, className }: { stats: Stat[]; className?: string }) {
  return (
    <div className={cn("grid grid-cols-2 gap-px border border-border bg-border md:grid-cols-4 lg:grid-cols-6", className)}>
      {stats.map((s) => (
        <div key={s.label} className="bg-background px-3 py-2">
          <div className="font-mono text-[10px] uppercase tracking-wide text-muted">
            {s.label}
          </div>
          <div className="font-mono text-lg tabular-nums text-foreground">{s.value}</div>
          {s.hint ? <div className="text-xs text-muted">{s.hint}</div> : null}
        </div>
      ))}
    </div>
  );
}
