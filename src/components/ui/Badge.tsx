import type { ReactNode } from "react";
import {
  BOOKING_PAYMENT_STATUS_LABELS,
  BOOKING_STATUS_LABELS,
  PAYMENT_STATUS_LABELS,
  type BookingPaymentStatus,
  type BookingStatus,
  type PaymentStatus,
} from "@/lib/booking/states";
import { cn } from "@/lib/utils";

export type BadgeTone = "neutral" | "gold" | "success" | "warning" | "danger" | "info";

const tones: Record<BadgeTone, string> = {
  neutral: "bg-surface text-ink-muted ring-line",
  gold: "bg-gold-soft text-gold-ink ring-gold/40",
  success: "bg-success-soft text-success ring-success/25",
  warning: "bg-warning-soft text-warning ring-warning/25",
  danger: "bg-danger-soft text-danger ring-danger/25",
  info: "bg-info-soft text-info ring-info/25",
};

export function Badge({
  tone = "neutral",
  className,
  children,
}: {
  tone?: BadgeTone;
  className?: string;
  children: ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold whitespace-nowrap ring-1 ring-inset",
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

const bookingTones: Record<BookingStatus, BadgeTone> = {
  pending_payment: "warning",
  confirmed: "info",
  assigned: "gold",
  in_progress: "gold",
  completed: "success",
  cancelled: "neutral",
};

const bookingPaymentTones: Record<BookingPaymentStatus, BadgeTone> = {
  unpaid: "warning",
  paid: "success",
  refund_pending: "info",
  partially_refunded: "info",
  refunded: "neutral",
};

const paymentTones: Record<PaymentStatus, BadgeTone> = {
  authorized: "info",
  captured: "success",
  failed: "danger",
  refund_pending: "info",
  partially_refunded: "info",
  refunded: "neutral",
};

/** Status is conveyed by text, not colour alone. */
export function BookingStatusBadge({ status }: { status: BookingStatus }) {
  return <Badge tone={bookingTones[status]}>{BOOKING_STATUS_LABELS[status]}</Badge>;
}

export function BookingPaymentStatusBadge({ status }: { status: BookingPaymentStatus }) {
  return <Badge tone={bookingPaymentTones[status]}>{BOOKING_PAYMENT_STATUS_LABELS[status]}</Badge>;
}

export function PaymentStatusBadge({ status }: { status: PaymentStatus }) {
  return <Badge tone={paymentTones[status]}>{PAYMENT_STATUS_LABELS[status]}</Badge>;
}
