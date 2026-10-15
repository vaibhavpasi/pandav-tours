import type { Metadata } from "next";
import { LegalPage, Tbc } from "@/components/site/LegalPage";

export const metadata: Metadata = {
  title: "Cancellation & Refund Policy",
  description: "How cancellations and refunds work for Pandav Tours & Travel bookings.",
  alternates: { canonical: "/cancellation-refund-policy" },
};

export default function CancellationPolicyPage() {
  return (
    <LegalPage title="Cancellation & Refund Policy" updated="Draft — not yet in effect">
      <h2>How to cancel</h2>
      <p>
        Contact us by phone or WhatsApp with your booking reference and the mobile number used for booking. The time
        we receive your request is used to work out any cancellation charge.
      </p>

      <h2>Cancellation charges</h2>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left text-sm">
          <caption className="sr-only">Cancellation charges by notice period</caption>
          <thead>
            <tr className="border-b border-line">
              <th scope="col" className="py-2 pr-4 font-semibold text-ink">Notice before pickup</th>
              <th scope="col" className="py-2 font-semibold text-ink">Refund</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-line">
              <td className="py-2 pr-4"><Tbc>e.g. more than 24 hours</Tbc></td>
              <td className="py-2"><Tbc>refund %</Tbc></td>
            </tr>
            <tr className="border-b border-line">
              <td className="py-2 pr-4"><Tbc>e.g. 6–24 hours</Tbc></td>
              <td className="py-2"><Tbc>refund %</Tbc></td>
            </tr>
            <tr>
              <td className="py-2 pr-4"><Tbc>e.g. less than 6 hours / no-show</Tbc></td>
              <td className="py-2"><Tbc>refund %</Tbc></td>
            </tr>
          </tbody>
        </table>
      </div>
      <p>Payment gateway charges <Tbc>refundable or not</Tbc>.</p>

      <h2>If we cancel</h2>
      <p>
        If we are unable to provide your trip, we will refund the full amount paid online.
      </p>

      <h2>Refund timelines</h2>
      <p>
        Approved refunds are initiated to the original payment method within <Tbc>number</Tbc> working days. Your bank
        or card issuer may take additional time to credit the amount.
      </p>

      <h2>Unpaid or expired bookings</h2>
      <p>
        Bookings not paid within the payment window are released automatically and nothing is charged. If a payment
        is received after a booking has expired, we will contact you to either confirm the trip (if still available)
        or refund the payment in full.
      </p>
    </LegalPage>
  );
}
