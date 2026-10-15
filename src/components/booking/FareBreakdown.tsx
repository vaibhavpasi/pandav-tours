import type { FareBreakdown as Breakdown } from "@/lib/booking/fare";
import { cn, formatPaise } from "@/lib/utils";

function taxLabel(bps: number): string {
  const percent = bps / 100;
  return `Tax (${percent.toLocaleString("en-IN", { maximumFractionDigits: 2 })}%)`;
}

/** Itemised fare: what is paid online, and what is settled at actuals. */
export function FareBreakdown({
  fare,
  className,
  totalLabel = "Total payable online",
}: {
  fare: Breakdown;
  className?: string;
  totalLabel?: string;
}) {
  return (
    <div className={cn("space-y-4", className)}>
      <dl className="space-y-2 text-sm">
        {fare.lines.map((line) => (
          <div key={line.code} className="flex items-start justify-between gap-4">
            <dt>
              <span className="font-medium text-ink">{line.label}</span>
              {line.detail ? <span className="block text-muted">{line.detail}</span> : null}
            </dt>
            <dd className="shrink-0 tabular-nums">{formatPaise(line.amountPaise)}</dd>
          </div>
        ))}
        {fare.taxRateBps > 0 ? (
          <div className="flex justify-between gap-4">
            <dt className="font-medium text-ink">{taxLabel(fare.taxRateBps)}</dt>
            <dd className="tabular-nums">{formatPaise(fare.taxPaise)}</dd>
          </div>
        ) : null}
        <div className="flex justify-between gap-4 border-t border-line pt-3 text-base">
          <dt className="font-bold">{totalLabel}</dt>
          <dd className="font-bold tabular-nums">{formatPaise(fare.totalPaise)}</dd>
        </div>
      </dl>

      {fare.inclusions.length ? (
        <div>
          <h4 className="text-sm font-semibold">Included</h4>
          <ul className="mt-1 list-inside list-disc text-sm text-muted">
            {fare.inclusions.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      ) : null}

      {fare.payableLater.length ? (
        <div className="rounded-xl bg-surface p-3">
          <h4 className="text-sm font-semibold">Not included — paid during the trip if applicable</h4>
          <ul className="mt-1 space-y-1 text-sm text-muted">
            {fare.payableLater.map((item) => (
              <li key={item.code}>
                <span className="font-medium text-ink-muted">{item.label}:</span> {item.detail}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
