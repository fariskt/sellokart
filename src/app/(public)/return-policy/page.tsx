import * as React from "react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Return & Refund Policy | Sellokart",
  description: "Learn about Sellokart's 7-day return, exchange, and refund process.",
};

export default function ReturnPolicyPage() {
  return (
    <div className="w-full py-12 sm:py-16 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl sm:text-4xl fond-medium font-display text-landing-dark">
          Return &amp; Refund Policy
        </h1>
        <p className="mt-2 text-xs sm:text-sm text-landing-primary-muted">
          Last updated: October 2026
        </p>
      </div>

      <div className="space-y-8 text-sm text-landing-dark leading-relaxed">
        <section className="space-y-2">
          <h2 className="text-base font-bold text-landing-dark">1. 7-Day Return Window</h2>
          <p className="text-landing-primary-muted">
            We offer a 7-day return and exchange window from the date of delivery. If you are not completely satisfied with your purchase, you may initiate a return directly from your account.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-landing-dark">2. Return Eligibility</h2>
          <ul className="list-disc list-inside text-landing-primary-muted space-y-1">
            <li>Item must be unused, unwashed, and in its original condition.</li>
            <li>All original tags, labels, and protective packaging must be intact.</li>
            <li>Intimate apparel, face masks, and clearance items marked final sale are non-returnable.</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-landing-dark">3. Return Pickup Process</h2>
          <p className="text-landing-primary-muted">
            Once a return request is accepted, our courier partner will arrange doorstep pickup within 2-3 business days. Please pack the item securely along with original invoices.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-landing-dark">4. Refund Timeline</h2>
          <p className="text-landing-primary-muted">
            Upon receipt and quality inspection at our fulfillment facility (typically 2 business days), refunds will be processed to your original payment method within 5-7 business days.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-landing-dark">5. Need Help with a Return?</h2>
          <p className="text-landing-primary-muted">
            For questions or assistance with an active return or exchange, contact us at{" "}
            <a href="mailto:info.sellokart@gmail.com" className="text-landing-primary hover:underline">
              info.sellokart@gmail.com
            </a>.
          </p>
        </section>
      </div>
    </div>
  );
}
