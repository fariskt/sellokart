import * as React from "react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms and Conditions | Sellokart",
  description: "Terms and Conditions of service for Sellokart online store.",
};

export default function TermsAndConditionsPage() {
  return (
    <div className="w-full py-12 sm:py-16 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl sm:text-4xl fond-medium font-display text-landing-dark">
          Terms &amp; Conditions
        </h1>
        <p className="mt-2 text-xs sm:text-sm text-landing-primary-muted">
          Last updated: October 2026
        </p>
      </div>

      <div className="space-y-8 text-sm text-landing-dark leading-relaxed">
        <section className="space-y-2">
          <h2 className="text-base font-bold text-landing-dark">1. Overview</h2>
          <p className="text-landing-primary-muted">
            Welcome to Sellokart. By accessing our website or purchasing products from us, you agree to comply with and be bound by the following terms and conditions. Please review them carefully.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-landing-dark">2. Products &amp; Pricing</h2>
          <p className="text-landing-primary-muted">
            All prices and product specifications are subject to change without prior notice. We strive to present accurate imagery and descriptions, but slight variations in color and texture may occur depending on display screens.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-landing-dark">3. Orders &amp; Payments</h2>
          <p className="text-landing-primary-muted">
            We reserve the right to refuse or cancel any order for reasons such as product unavailability, pricing discrepancies, or suspected fraudulent activity. Payments must be settled in full before order dispatch.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-landing-dark">4. Intellectual Property</h2>
          <p className="text-landing-primary-muted">
            All content on Sellokart, including graphics, logos, photos, and digital assets, is the property of Sellokart and protected by applicable copyright and trademark laws.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-landing-dark">5. Contact Information</h2>
          <p className="text-landing-primary-muted">
            If you have questions regarding these terms, please contact us at{" "}
            <a href="mailto:info.sellokart@gmail.com" className="text-landing-primary hover:underline">
              info.sellokart@gmail.com
            </a>.
          </p>
        </section>
      </div>
    </div>
  );
}
