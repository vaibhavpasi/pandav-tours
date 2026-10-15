import type { Metadata } from "next";
import { LegalPage, Tbc } from "@/components/site/LegalPage";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How Pandav Tours & Travel collects, uses and protects your personal data.",
  alternates: { canonical: "/privacy-policy" },
};

export default function PrivacyPolicyPage() {
  return (
    <LegalPage title="Privacy Policy" updated="Draft — not yet in effect">
      <p>
        This policy explains how Pandav Tours &amp; Travel (“we”, “us”) handles personal data when you use this website
        to book a trip, send an enquiry or check a booking. We aim to follow India&apos;s Digital Personal Data
        Protection Act, 2023.
      </p>

      <h2>What we collect</h2>
      <ul>
        <li>Your name, mobile number and (optionally) email address.</li>
        <li>Trip details: pickup and drop addresses, dates and times, passengers, vehicle choice and any instructions you add.</li>
        <li>
          Payment records: the amount, status and the payment reference issued by our payment provider. We do{" "}
          <strong>not</strong> receive or store your card number, CVV or UPI PIN.
        </li>
        <li>
          Basic technical data needed to run the site securely, such as a one-way hashed form of your IP address used
          to prevent abuse. We do not store raw IP addresses for this purpose.
        </li>
      </ul>

      <h2>Why we use it</h2>
      <ul>
        <li>To provide the trip you booked, assign a driver and contact you about it.</li>
        <li>To process payments, refunds and keep accounting records.</li>
        <li>To reply to your enquiries.</li>
        <li>To protect the website and our customers from fraud and misuse.</li>
      </ul>
      <p>We do not sell your personal data, and we do not use it for advertising without your consent.</p>

      <h2>Who we share it with</h2>
      <ul>
        <li>The driver assigned to your trip (name, mobile number, pickup details).</li>
        <li>Razorpay, our payment provider, to process payments.</li>
        <li>Service providers that host our website and database, under their own security obligations.</li>
        <li>Authorities, where required by law.</li>
      </ul>

      <h2>How long we keep it</h2>
      <p>
        Booking and payment records are kept for as long as required for tax and accounting purposes{" "}
        <Tbc>retention period confirmed with the business&apos;s accountant</Tbc>. Enquiries that do not become
        bookings are deleted after <Tbc>period</Tbc>.
      </p>

      <h2>Your rights</h2>
      <p>
        You can ask to access, correct or delete your personal data, or withdraw consent, by contacting us. We may need
        to keep some records where the law requires it.
      </p>

      <h2>Contact</h2>
      <p>
        For privacy questions or requests, contact <Tbc>grievance officer name, email and phone</Tbc>.
      </p>
    </LegalPage>
  );
}
