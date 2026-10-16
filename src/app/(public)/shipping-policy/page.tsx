import * as React from "react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Shipping Policy | Sellokart",
  description: "Learn about delivery timeframes, rates, and shipping policies at Sellokart.",
};

export default function ShippingPolicyPage() {
  return (
    <div className="w-full py-12 sm:py-16 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-black font-display text-landing-dark">
          Shipping Policy
        </h1>
        <p className="mt-2 text-xs sm:text-sm text-landing-primary-muted">
          Last updated: October 2026
        </p>
      </div>

      <div className="space-y-8 text-sm text-landing-dark leading-relaxed">
        <section className="space-y-2">
          <h2 className="text-base font-bold text-landing-dark">1. Order Processing</h2>
          <p className="text-landing-primary-muted">
            All orders are processed and verified within 1-2 business days (excluding Sundays and national holidays). You will receive an email and SMS confirmation containing tracking details once your package ships.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-landing-dark">2. Delivery Timeframes</h2>
          <ul className="list-disc list-inside text-landing-primary-muted space-y-1">
            <li><strong className="text-landing-dark">Metro Cities:</strong> 2 to 4 business days.</li>
            <li><strong className="text-landing-dark">Rest of India:</strong> 4 to 7 business days.</li>
            <li><strong className="text-landing-dark">Remote Locations:</strong> Up to 8-10 business days.</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-landing-dark">3. Shipping Fees</h2>
          <p className="text-landing-primary-muted">
            Standard delivery is complimentary on all orders above ₹1,999. For orders below this threshold, a flat delivery fee of ₹150 is applied at checkout.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-landing-dark">4. Shipment Tracking</h2>
          <p className="text-landing-primary-muted">
            Once dispatched, a tracking ID and carrier link will be sent to your registered contact info. You can also view live status directly from your Account &gt; Orders section.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-landing-dark">5. Damaged or Lost Shipments</h2>
          <p className="text-landing-primary-muted">
            If your package arrives visibly damaged or fails to arrive within the estimated timeframe, notify us immediately at{" "}
            <a href="mailto:info.sellokart@gmail.com" className="text-landing-primary hover:underline">
              info.sellokart@gmail.com
            </a>{" "}
            with your order number.
          </p>
        </section>
      </div>
    </div>
  );
}
