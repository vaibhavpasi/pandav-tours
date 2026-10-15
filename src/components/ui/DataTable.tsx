import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export type Column<Row> = {
  key: string;
  header: string;
  cell: (row: Row) => ReactNode;
  className?: string;
  /** Hidden in the stacked mobile view (keep the essentials only). */
  hideOnMobile?: boolean;
  align?: "left" | "right";
};

type DataTableProps<Row> = {
  caption: string;
  columns: Column<Row>[];
  rows: Row[];
  rowKey: (row: Row) => string;
  empty?: ReactNode;
  className?: string;
};

/**
 * Responsive table: a real <table> from md upwards, stacked cards on small
 * screens (no horizontal scrolling on phones). Server-renderable.
 */
export function DataTable<Row>({ caption, columns, rows, rowKey, empty, className }: DataTableProps<Row>) {
  if (rows.length === 0 && empty) return <>{empty}</>;

  return (
    <div className={className}>
      <div className="hidden overflow-x-auto rounded-card border border-line md:block">
        <table className="w-full border-collapse text-left text-sm">
          <caption className="sr-only">{caption}</caption>
          <thead className="bg-surface">
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  scope="col"
                  className={cn(
                    "px-4 py-3 font-semibold whitespace-nowrap text-ink-muted",
                    col.align === "right" && "text-right",
                    col.className,
                  )}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={rowKey(row)} className="border-t border-line hover:bg-surface/60">
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className={cn("px-4 py-3 align-top", col.align === "right" && "text-right", col.className)}
                  >
                    {col.cell(row)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ul className="space-y-3 md:hidden" aria-label={caption}>
        {rows.map((row) => (
          <li key={rowKey(row)} className="rounded-card border border-line bg-paper p-4">
            <dl className="grid grid-cols-[minmax(0,2fr)_minmax(0,3fr)] gap-x-3 gap-y-2 text-sm">
              {columns
                .filter((col) => !col.hideOnMobile)
                .map((col) => (
                  <div key={col.key} className="contents">
                    <dt className="font-medium text-muted">{col.header}</dt>
                    <dd className="min-w-0 break-words">{col.cell(row)}</dd>
                  </div>
                ))}
            </dl>
          </li>
        ))}
      </ul>
    </div>
  );
}
