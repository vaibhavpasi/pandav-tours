import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage, Tbc } from "@/components/site/LegalPage";

export const metadata: Metadata = {
  title: "Terms & Conditions",
  description: "Terms for booking cabs and tours with Pandav Tours & Travel.",
  alternates: { canonical: "/terms-and-conditions" },
};

export default function TermsPage() {
  return (
    <LegalPage title="Terms & Conditions" updated="Draft — not yet in effect">
      <p>
        These terms apply to bookings made with Pandav Tours &amp; Travel through this website. Legal business name and
        address: <Tbc>registered name, address and GSTIN if applicable</Tbc>.
      </p>

      <h2>Bookings</h2>
      <ul>
        <li>A booking is confirmed only after full payment is received and verified. Until then it is held for a limited time and may be released.</li>
        <li>Your booking reference (for example PT-ABCD2345) identifies your booking. Keep it for any communication with us.</li>
        <li>Please make sure the pickup address, date, time and passenger count are correct. Changes are subject to availability.</li>
      </ul>

      <h2>Fares</h2>
      <ul>
        <li>The amount paid online is the total shown in your fare breakdown at the time of booking.</li>
        <li>
          Charges listed as “not included” — such as extra kilometres or hours beyond the included limits, tolls and
          parking where not included, and waiting time — are payable during the trip at the rates shown when you
          booked.
        </li>
        <li>Fares for routes not listed online are provided on enquiry.</li>
      </ul>

      <h2>Vehicles and drivers</h2>
      <ul>
        <li>You book a vehicle category with a stated capacity. The specific model may vary within the category.</li>
        <li>Driver and vehicle details are shared before the trip <Tbc>how and when they are shared</Tbc>.</li>
        <li>Passenger and luggage limits must not be exceeded for safety reasons.</li>
      </ul>

      <h2>Conduct and safety</h2>
      <ul>
        <li>Smoking, alcohol and illegal items are not permitted in vehicles <Tbc>confirm policy</Tbc>.</li>
        <li>The driver may refuse or end a trip if passenger behaviour puts safety at risk.</li>
      </ul>

      <h2>Cancellations and refunds</h2>
      <p>
        See our <Link href="/cancellation-refund-policy" className="font-semibold underline">cancellation &amp; refund policy</Link>.
      </p>

      <h2>Liability</h2>
      <p>
        We are not responsible for delays caused by traffic, weather, road closures or other events outside our
        reasonable control <Tbc>liability wording reviewed by a lawyer</Tbc>.
      </p>

      <h2>Governing law</h2>
      <p>
        These terms are governed by the laws of India. Disputes are subject to the jurisdiction of the courts at{" "}
        <Tbc>city</Tbc>.
      </p>
    </LegalPage>
  );
}
