/**
 * Supabase database types.
 *
 * Hand-written to match supabase/migrations for Phase 1 (no Supabase project
 * exists yet). Once the project is linked, regenerate with
 * `npm run db:types` and diff against this file; the generated output should
 * be equivalent. Keep this file in sync with every new migration.
 */
import type {
  BookingPaymentStatus,
  BookingStatus,
  CancellationReason,
  PaymentOrderStatus,
  PaymentStatus,
  RefundStatus,
} from "@/lib/booking/states";

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type TripType = "one_way" | "round_trip" | "local" | "airport_transfer" | "railway_transfer";
export type BookingTripType = TripType | "package";
export type BookingKind = "cab" | "package";
export type TollParkingPolicy = "included" | "fixed" | "payable_at_actuals";
export type PriceBasis = "per_person" | "per_vehicle" | "per_group";
export type StaffRole = "admin" | "staff";
export type EnquiryType = "cab" | "package" | "hotel" | "flight_train" | "general";
export type EnquiryStatus = "new" | "contacted" | "converted" | "closed";
export type AssignmentStatus = "active" | "replaced" | "cancelled";
export type ActorType = "system" | "admin" | "customer" | "gateway";

type Simplify<T> = { [K in keyof T]: T[K] } & {};

type Relationship = {
  foreignKeyName: string;
  columns: string[];
  isOneToOne: boolean;
  referencedRelation: string;
  referencedColumns: string[];
};

/** Insert makes columns with database defaults optional; Update makes all optional. */
type TableDef<Row, Optional extends keyof Row, Rel extends Relationship[] = []> = {
  Row: Row;
  Insert: Simplify<Omit<Row, Optional> & Partial<Pick<Row, Optional>>>;
  Update: Partial<Row>;
  Relationships: Rel;
};

type FK<Name extends string, Column extends string, Table extends string> = {
  foreignKeyName: Name;
  columns: [Column];
  isOneToOne: false;
  referencedRelation: Table;
  referencedColumns: ["id"];
};

type Timestamps = { created_at: string; updated_at: string };

export type ProfileRow = Timestamps & {
  id: string;
  full_name: string;
  role: StaffRole;
  is_active: boolean;
};

export type CustomerRow = Timestamps & {
  id: string;
  full_name: string;
  phone: string;
  email: string | null;
};

export type VehicleCategoryRow = Timestamps & {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  example_models: string | null;
  seating_capacity: number;
  luggage_capacity: number;
  image_url: string | null;
  sort_order: number;
  is_active: boolean;
};

export type VehicleRow = Timestamps & {
  id: string;
  category_id: string;
  registration_number: string;
  make_model: string;
  colour: string | null;
  is_active: boolean;
  notes: string | null;
};

export type DriverRow = Timestamps & {
  id: string;
  full_name: string;
  phone: string;
  license_number: string | null;
  license_expiry: string | null;
  is_active: boolean;
  notes: string | null;
};

export type RouteRow = Timestamps & {
  id: string;
  slug: string;
  name: string;
  trip_type: TripType;
  origin: string;
  destination: string | null;
  distance_km: number | null;
  description: string | null;
  is_featured: boolean;
  sort_order: number;
  is_active: boolean;
};

export type RouteFareRow = Timestamps & {
  id: string;
  route_id: string;
  vehicle_category_id: string;
  base_fare_paise: number;
  min_fare_paise: number;
  included_km: number;
  included_hours: number | null;
  included_days: number;
  extra_km_rate_paise: number;
  extra_hour_rate_paise: number;
  extra_day_rate_paise: number;
  driver_allowance_paise: number;
  night_charge_paise: number;
  toll_parking_policy: TollParkingPolicy;
  toll_parking_paise: number;
  free_waiting_minutes: number;
  waiting_rate_per_hour_paise: number;
  tax_rate_bps: number;
  notes: string | null;
  is_active: boolean;
};

export type TourPackageRow = Timestamps & {
  id: string;
  slug: string;
  title: string;
  summary: string | null;
  description: string | null;
  highlights: string[];
  itinerary: Json;
  inclusions: string[];
  exclusions: string[];
  duration_days: number;
  duration_nights: number;
  price_paise: number | null;
  price_basis: PriceBasis;
  tax_rate_bps: number;
  image_url: string | null;
  seo_title: string | null;
  seo_description: string | null;
  is_featured: boolean;
  sort_order: number;
  is_published: boolean;
  published_at: string | null;
};

export type BookingRow = Timestamps & {
  id: string;
  booking_reference: string;
  customer_id: string;
  contact_name: string;
  contact_email: string | null;
  booking_kind: BookingKind;
  trip_type: BookingTripType;
  route_id: string | null;
  route_fare_id: string | null;
  vehicle_category_id: string | null;
  package_id: string | null;
  pickup_location: string;
  destination: string | null;
  pickup_at: string;
  return_at: string | null;
  passenger_count: number;
  special_instructions: string | null;
  fare_snapshot: Json;
  total_amount_paise: number;
  currency: "INR";
  booking_status: BookingStatus;
  payment_status: BookingPaymentStatus;
  terms_version: string;
  terms_accepted_at: string;
  payment_expires_at: string | null;
  needs_reconciliation: boolean;
  reconciliation_note: string | null;
  cancellation_reason: CancellationReason | null;
  cancelled_at: string | null;
};

export type EnquiryRow = Timestamps & {
  id: string;
  customer_id: string;
  contact_name: string;
  contact_email: string | null;
  enquiry_type: EnquiryType;
  route_id: string | null;
  vehicle_category_id: string | null;
  package_id: string | null;
  pickup_location: string | null;
  destination: string | null;
  travel_date: string | null;
  passenger_count: number | null;
  message: string | null;
  status: EnquiryStatus;
};

export type PaymentOrderRow = Timestamps & {
  id: string;
  booking_id: string;
  gateway: "razorpay";
  gateway_order_id: string;
  amount_paise: number;
  currency: "INR";
  receipt: string;
  status: PaymentOrderStatus;
};

export type PaymentRow = Timestamps & {
  id: string;
  payment_order_id: string;
  booking_id: string;
  gateway_payment_id: string;
  amount_paise: number;
  amount_refunded_paise: number;
  currency: "INR";
  status: PaymentStatus;
  method: string | null;
  signature_verified: boolean;
  error_code: string | null;
  error_description: string | null;
  gateway_response: Json;
  authorized_at: string | null;
  captured_at: string | null;
  failed_at: string | null;
};

export type RefundRow = Timestamps & {
  id: string;
  payment_id: string;
  booking_id: string;
  gateway_refund_id: string;
  amount_paise: number;
  status: RefundStatus;
  reason: string | null;
  initiated_by: string | null;
  processed_at: string | null;
};

export type WebhookEventRow = {
  id: string;
  gateway: "razorpay";
  event_id: string;
  event_type: string;
  payload: Json;
  received_at: string;
  processed_at: string | null;
  processing_error: string | null;
  delivery_count: number;
};

export type BookingAssignmentRow = {
  id: string;
  booking_id: string;
  driver_id: string;
  vehicle_id: string;
  assigned_by: string | null;
  status: AssignmentStatus;
  notes: string | null;
  assigned_at: string;
  ended_at: string | null;
};

export type BookingEventRow = {
  id: string;
  booking_id: string;
  event_type: string;
  old_status: string | null;
  new_status: string | null;
  actor_type: ActorType;
  performed_by: string | null;
  metadata: Json;
  created_at: string;
};

export type BusinessSettingsRow = {
  id: number;
  business_name: string;
  tagline: string | null;
  phone: string | null;
  whatsapp_number: string | null;
  public_email: string | null;
  address: string | null;
  service_area: string | null;
  admin_alert_email: string | null;
  timezone: string;
  currency: "INR";
  payment_window_minutes: number;
  min_booking_lead_minutes: number;
  max_booking_advance_days: number;
  night_charge_start: string;
  night_charge_end: string;
  terms_version: string;
  cancellation_policy_summary: string | null;
  updated_at: string;
  updated_by: string | null;
};

type WithDefaults = "id" | "created_at" | "updated_at";

export type Database = {
  public: {
    Tables: {
      profiles: TableDef<ProfileRow, "role" | "is_active" | "created_at" | "updated_at">;
      customers: TableDef<CustomerRow, WithDefaults | "email">;
      vehicle_categories: TableDef<
        VehicleCategoryRow,
        WithDefaults | "description" | "example_models" | "luggage_capacity" | "image_url" | "sort_order" | "is_active"
      >;
      vehicles: TableDef<
        VehicleRow,
        WithDefaults | "colour" | "is_active" | "notes",
        [FK<"vehicles_category_id_fkey", "category_id", "vehicle_categories">]
      >;
      drivers: TableDef<DriverRow, WithDefaults | "license_number" | "license_expiry" | "is_active" | "notes">;
      routes: TableDef<
        RouteRow,
        WithDefaults | "destination" | "distance_km" | "description" | "is_featured" | "sort_order" | "is_active"
      >;
      route_fares: TableDef<
        RouteFareRow,
        | WithDefaults
        | "min_fare_paise"
        | "included_km"
        | "included_hours"
        | "included_days"
        | "extra_km_rate_paise"
        | "extra_hour_rate_paise"
        | "extra_day_rate_paise"
        | "driver_allowance_paise"
        | "night_charge_paise"
        | "toll_parking_policy"
        | "toll_parking_paise"
        | "free_waiting_minutes"
        | "waiting_rate_per_hour_paise"
        | "tax_rate_bps"
        | "notes"
        | "is_active",
        [
          FK<"route_fares_route_id_fkey", "route_id", "routes">,
          FK<"route_fares_vehicle_category_id_fkey", "vehicle_category_id", "vehicle_categories">,
        ]
      >;
      tour_packages: TableDef<
        TourPackageRow,
        | WithDefaults
        | "summary"
        | "description"
        | "highlights"
        | "itinerary"
        | "inclusions"
        | "exclusions"
        | "price_paise"
        | "price_basis"
        | "tax_rate_bps"
        | "image_url"
        | "seo_title"
        | "seo_description"
        | "is_featured"
        | "sort_order"
        | "is_published"
        | "published_at"
      >;
      bookings: TableDef<
        BookingRow,
        | WithDefaults
        | "contact_email"
        | "route_id"
        | "route_fare_id"
        | "vehicle_category_id"
        | "package_id"
        | "destination"
        | "return_at"
        | "special_instructions"
        | "currency"
        | "booking_status"
        | "payment_status"
        | "payment_expires_at"
        | "needs_reconciliation"
        | "reconciliation_note"
        | "cancellation_reason"
        | "cancelled_at",
        [
          FK<"bookings_customer_id_fkey", "customer_id", "customers">,
          FK<"bookings_route_id_fkey", "route_id", "routes">,
          FK<"bookings_route_fare_id_fkey", "route_fare_id", "route_fares">,
          FK<"bookings_vehicle_category_id_fkey", "vehicle_category_id", "vehicle_categories">,
          FK<"bookings_package_id_fkey", "package_id", "tour_packages">,
        ]
      >;
      enquiries: TableDef<
        EnquiryRow,
        | WithDefaults
        | "contact_email"
        | "route_id"
        | "vehicle_category_id"
        | "package_id"
        | "pickup_location"
        | "destination"
        | "travel_date"
        | "passenger_count"
        | "message"
        | "status",
        [FK<"enquiries_customer_id_fkey", "customer_id", "customers">]
      >;
      payment_orders: TableDef<
        PaymentOrderRow,
        WithDefaults | "gateway" | "currency" | "status",
        [FK<"payment_orders_booking_id_fkey", "booking_id", "bookings">]
      >;
      payments: TableDef<
        PaymentRow,
        | WithDefaults
        | "amount_refunded_paise"
        | "currency"
        | "method"
        | "signature_verified"
        | "error_code"
        | "error_description"
        | "gateway_response"
        | "authorized_at"
        | "captured_at"
        | "failed_at",
        [
          FK<"payments_payment_order_id_fkey", "payment_order_id", "payment_orders">,
          FK<"payments_booking_id_fkey", "booking_id", "bookings">,
        ]
      >;
      refunds: TableDef<
        RefundRow,
        WithDefaults | "status" | "reason" | "initiated_by" | "processed_at",
        [
          FK<"refunds_payment_id_fkey", "payment_id", "payments">,
          FK<"refunds_booking_id_fkey", "booking_id", "bookings">,
        ]
      >;
      webhook_events: TableDef<
        WebhookEventRow,
        "id" | "gateway" | "received_at" | "processed_at" | "processing_error" | "delivery_count"
      >;
      booking_assignments: TableDef<
        BookingAssignmentRow,
        "id" | "assigned_by" | "status" | "notes" | "assigned_at" | "ended_at",
        [
          FK<"booking_assignments_booking_id_fkey", "booking_id", "bookings">,
          FK<"booking_assignments_driver_id_fkey", "driver_id", "drivers">,
          FK<"booking_assignments_vehicle_id_fkey", "vehicle_id", "vehicles">,
        ]
      >;
      booking_events: TableDef<
        BookingEventRow,
        "id" | "old_status" | "new_status" | "performed_by" | "metadata" | "created_at",
        [FK<"booking_events_booking_id_fkey", "booking_id", "bookings">]
      >;
      business_settings: TableDef<
        BusinessSettingsRow,
        Exclude<keyof BusinessSettingsRow, never>
      >;
    };
    Views: { [_ in never]: never };
    Functions: {
      is_staff: { Args: Record<string, never>; Returns: boolean };
      is_admin: { Args: Record<string, never>; Returns: boolean };
      is_valid_transition: {
        Args: { p_machine: string; p_from: string; p_to: string };
        Returns: boolean;
      };
      upsert_customer: {
        Args: { p_name: string; p_phone: string; p_email: string | null };
        Returns: string;
      };
      create_booking: {
        Args: {
          p_booking_reference: string;
          p_contact_name: string;
          p_contact_phone: string;
          p_contact_email: string | null;
          p_booking_kind: BookingKind;
          p_trip_type: BookingTripType;
          p_route_id: string | null;
          p_route_fare_id: string | null;
          p_vehicle_category_id: string | null;
          p_package_id: string | null;
          p_pickup_location: string;
          p_destination: string | null;
          p_pickup_at: string;
          p_return_at: string | null;
          p_passenger_count: number;
          p_special_instructions: string | null;
          p_fare_snapshot: Json;
          p_total_amount_paise: number;
          p_terms_version: string;
          p_payment_window_minutes: number;
        };
        Returns: { booking_id: string; payment_expires_at: string }[];
      };
      create_enquiry: {
        Args: {
          p_contact_name: string;
          p_contact_phone: string;
          p_contact_email: string | null;
          p_enquiry_type: EnquiryType;
          p_route_id: string | null;
          p_vehicle_category_id: string | null;
          p_package_id: string | null;
          p_pickup_location: string | null;
          p_destination: string | null;
          p_travel_date: string | null;
          p_passenger_count: number | null;
          p_message: string | null;
        };
        Returns: string;
      };
      lookup_booking_status: {
        Args: { p_booking_reference: string; p_phone: string };
        Returns: {
          booking_reference: string;
          booking_status: BookingStatus;
          payment_status: BookingPaymentStatus;
          trip_type: BookingTripType;
          route_name: string | null;
          package_title: string | null;
          vehicle_category: string | null;
          pickup_at: string;
          return_at: string | null;
          total_amount_paise: number;
          payment_expires_at: string | null;
        }[];
      };
      consume_rate_limit: {
        Args: { p_key: string; p_limit: number; p_window_seconds: number };
        Returns: boolean;
      };
    };
    Enums: { [_ in never]: never };
    CompositeTypes: { [_ in never]: never };
  };
};

export type Tables<T extends keyof Database["public"]["Tables"]> = Database["public"]["Tables"][T]["Row"];
export type TablesInsert<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Insert"];
export type TablesUpdate<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Update"];
