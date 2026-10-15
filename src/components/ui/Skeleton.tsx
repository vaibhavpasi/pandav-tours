import { cn } from "@/lib/utils";

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("animate-pulse rounded-lg bg-line/70", className)} aria-hidden="true" />;
}

/** Accessible loading placeholder: announces once, hides the shapes. */
export function LoadingBlock({ label = "Loading…", lines = 3 }: { label?: string; lines?: number }) {
  return (
    <div role="status" className="space-y-3">
      <span className="sr-only">{label}</span>
      {Array.from({ length: lines }, (_, i) => (
        <Skeleton key={i} className={cn("h-4", i === lines - 1 ? "w-2/3" : "w-full")} />
      ))}
    </div>
  );
}
