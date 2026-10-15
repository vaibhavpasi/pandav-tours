/**
 * Booking & payment state machines.
 *
 * The database is the enforcing authority (see
 * supabase/migrations/*_state_machines.sql). This module mirrors the same
 * transition table so server code can check a transition *before* attempting
 * it and so the UI can show only valid actions. A test asserts the two
 * tables are identical.
 */

export const BOOKING_STATUSES = [
  "pending_payment",
  "confirmed",
  "assigned",
  "in_progress",
  "completed",
  "cancelled",
] as const;
export type BookingStatus = (typeof BOOKING_STATUSES)[number];

export const BOOKING_PAYMENT_STATUSES = [
  "unpaid",
  "paid",
  "refund_pending",
  "partially_refunded",
  "refunded",
] as const;
export type BookingPaymentStatus = (typeof BOOKING_PAYMENT_STATUSES)[number];

export const PAYMENT_STATUSES = [
  "authorized",
  "captured",
  "failed",
  "refund_pending",
  "partially_refunded",
  "refunded",
] as const;
export type PaymentStatus = (typeof PAYMENT_STATUSES)[number];

export const PAYMENT_ORDER_STATUSES = ["created", "paid", "expired"] as const;
export type PaymentOrderStatus = (typeof PAYMENT_ORDER_STATUSES)[number];

export const REFUND_STATUSES = ["pending", "processed", "failed"] as const;
export type RefundStatus = (typeof REFUND_STATUSES)[number];

export const CANCELLATION_REASONS = [
  "customer_request",
  "payment_expired",
  "admin",
  "no_vehicle",
  "other",
] as const;
export type CancellationReason = (typeof CANCELLATION_REASONS)[number];

type TransitionMap<S extends string> = Readonly<Record<S, readonly S[]>>;

export const BOOKING_TRANSITIONS: TransitionMap<BookingStatus> = {
  pending_payment: ["confirmed", "cancelled"],
  confirmed: ["assigned", "cancelled"],
  assigned: ["confirmed", "in_progress", "cancelled"],
  in_progress: ["completed"],
  completed: [],
  // Only for bookings cancelled with reason "payment_expired" whose late
  // payment was captured; guarded further in the database.
  cancelled: ["confirmed"],
};

export const BOOKING_PAYMENT_TRANSITIONS: TransitionMap<BookingPaymentStatus> = {
  unpaid: ["paid"],
  paid: ["refund_pending", "partially_refunded", "refunded"],
  refund_pending: ["paid", "partially_refunded", "refunded"],
  partially_refunded: ["refund_pending", "refunded"],
  refunded: [],
};

export const PAYMENT_TRANSITIONS: TransitionMap<PaymentStatus> = {
  authorized: ["captured", "failed", "refunded"],
  captured: ["refund_pending", "partially_refunded", "refunded"],
  failed: [],
  refund_pending: ["captured", "partially_refunded", "refunded"],
  partially_refunded: ["refund_pending", "refunded"],
  refunded: [],
};

export const PAYMENT_ORDER_TRANSITIONS: TransitionMap<PaymentOrderStatus> = {
  created: ["paid", "expired"],
  paid: [],
  expired: ["paid"],
};

export const REFUND_TRANSITIONS: TransitionMap<RefundStatus> = {
  pending: ["processed", "failed"],
  processed: [],
  failed: [],
};

/** Machine names match the first argument of SQL `is_valid_transition`. */
export const STATE_MACHINES = {
  booking: BOOKING_TRANSITIONS,
  booking_payment: BOOKING_PAYMENT_TRANSITIONS,
  payment: PAYMENT_TRANSITIONS,
  payment_order: PAYMENT_ORDER_TRANSITIONS,
  refund: REFUND_TRANSITIONS,
} as const;

export type StateMachineName = keyof typeof STATE_MACHINES;

function allowed<S extends string>(map: TransitionMap<S>, from: S, to: S): boolean {
  return from === to || map[from].includes(to);
}

export function canTransitionBooking(from: BookingStatus, to: BookingStatus): boolean {
  return allowed(BOOKING_TRANSITIONS, from, to);
}

export function canTransitionBookingPayment(
  from: BookingPaymentStatus,
  to: BookingPaymentStatus,
): boolean {
  return allowed(BOOKING_PAYMENT_TRANSITIONS, from, to);
}

export function canTransitionPayment(from: PaymentStatus, to: PaymentStatus): boolean {
  return allowed(PAYMENT_TRANSITIONS, from, to);
}

export function canTransitionPaymentOrder(
  from: PaymentOrderStatus,
  to: PaymentOrderStatus,
): boolean {
  return allowed(PAYMENT_ORDER_TRANSITIONS, from, to);
}

export function canTransitionRefund(from: RefundStatus, to: RefundStatus): boolean {
  return allowed(REFUND_TRANSITIONS, from, to);
}

export const BOOKING_STATUS_LABELS: Record<BookingStatus, string> = {
  pending_payment: "Awaiting payment",
  confirmed: "Confirmed",
  assigned: "Driver assigned",
  in_progress: "Trip in progress",
  completed: "Completed",
  cancelled: "Cancelled",
};

export const BOOKING_PAYMENT_STATUS_LABELS: Record<BookingPaymentStatus, string> = {
  unpaid: "Unpaid",
  paid: "Paid",
  refund_pending: "Refund pending",
  partially_refunded: "Partially refunded",
  refunded: "Refunded",
};

export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  authorized: "Authorised",
  captured: "Captured",
  failed: "Failed",
  refund_pending: "Refund pending",
  partially_refunded: "Partially refunded",
  refunded: "Refunded",
};
