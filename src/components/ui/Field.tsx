import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/utils";

const control =
  "block w-full rounded-xl border border-line-strong bg-paper px-3.5 text-base text-ink " +
  "placeholder:text-muted transition-colors duration-150 " +
  "hover:border-ink focus-visible:border-ink focus-visible:outline-offset-0 " +
  "disabled:cursor-not-allowed disabled:bg-surface disabled:text-muted " +
  "aria-invalid:border-danger aria-invalid:hover:border-danger";

type FieldProps = {
  /** id of the control; label, hint and error are wired to it. */
  id: string;
  label: ReactNode;
  hint?: ReactNode;
  error?: string;
  required?: boolean;
  className?: string;
  children: ReactNode;
};

/**
 * Label + control + hint + error. Controls must set
 * aria-describedby={describedBy(id, { hint, error })} and aria-invalid.
 */
export function Field({ id, label, hint, error, required, className, children }: FieldProps) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <label htmlFor={id} className="text-sm font-semibold text-ink">
        {label}
        {required ? (
          <span className="text-danger" aria-hidden="true">
            {" "}*
          </span>
        ) : null}
      </label>
      {children}
      {hint && !error ? (
        <p id={`${id}-hint`} className="text-sm text-muted">
          {hint}
        </p>
      ) : null}
      {error ? (
        <p id={`${id}-error`} className="text-sm font-medium text-danger" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}

export function describedBy(id: string, { hint, error }: { hint?: unknown; error?: unknown }) {
  if (error) return `${id}-error`;
  if (hint) return `${id}-hint`;
  return undefined;
}

type ControlState = { invalid?: boolean };

export function Input({ className, invalid, ...props }: ComponentProps<"input"> & ControlState) {
  return <input className={cn(control, "h-12", className)} aria-invalid={invalid || undefined} {...props} />;
}

export function Textarea({ className, invalid, ...props }: ComponentProps<"textarea"> & ControlState) {
  return (
    <textarea
      className={cn(control, "min-h-24 py-3", className)}
      aria-invalid={invalid || undefined}
      {...props}
    />
  );
}

export function Select({ className, invalid, children, ...props }: ComponentProps<"select"> & ControlState) {
  return (
    <div className="relative">
      <select
        className={cn(control, "h-12 appearance-none pr-10", className)}
        aria-invalid={invalid || undefined}
        {...props}
      >
        {children}
      </select>
      <svg
        className="pointer-events-none absolute top-1/2 right-3.5 size-4 -translate-y-1/2 text-ink"
        viewBox="0 0 16 16"
        fill="none"
        aria-hidden="true"
      >
        <path d="m4 6 4 4 4-4" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );
}

export function Checkbox({ className, invalid, ...props }: Omit<ComponentProps<"input">, "type"> & ControlState) {
  return (
    <input
      type="checkbox"
      className={cn("size-5 shrink-0 cursor-pointer rounded border-line-strong accent-ink", className)}
      aria-invalid={invalid || undefined}
      {...props}
    />
  );
}
