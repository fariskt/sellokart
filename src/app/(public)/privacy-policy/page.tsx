import * as React from "react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | Sellokart",
  description: "Learn how Sellokart collects, protects, and uses your personal data.",
};

export default function PrivacyPolicyPage() {
  return (
    <div className="w-full py-12 sm:py-16 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-black font-display text-landing-dark">
          Privacy Policy
        </h1>
        <p className="mt-2 text-xs sm:text-sm text-landing-primary-muted">
          Last updated: October 2026
        </p>
      </div>

      <div className="space-y-8 text-sm text-landing-dark leading-relaxed">
        <section className="space-y-2">
          <h2 className="text-base font-bold text-landing-dark">1. Information We Collect</h2>
          <p className="text-landing-primary-muted">
            We collect personal information necessary to fulfill your orders and enhance your shopping experience. This includes your name, delivery address, email, telephone number, and payment preferences.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-landing-dark">2. How We Use Your Data</h2>
          <ul className="list-disc list-inside text-landing-primary-muted space-y-1">
            <li>Process, package, and ship your purchases.</li>
            <li>Send order confirmation, delivery updates, and customer support messages.</li>
            <li>Protect against unauthorized or fraudulent transactions.</li>
            <li>Improve website performance, product recommendations, and design.</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-landing-dark">3. Data Sharing &amp; Third Parties</h2>
          <p className="text-landing-primary-muted">
            We do not sell, rent, or trade your personal data. Your details are only shared with trusted partners required to operate our store—such as payment gateways, courier providers, and database services.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-landing-dark">4. Data Security</h2>
          <p className="text-landing-primary-muted">
            We use industry-standard encryption protocols (SSL/TLS) and secure database storage to protect your private records against unauthorized access or disclosure.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-landing-dark">5. Contact Us</h2>
          <p className="text-landing-primary-muted">
            For questions about this Privacy Policy or your personal records, please reach out to{" "}
            <a href="mailto:info.sellokart@gmail.com" className="text-landing-primary hover:underline">
              info.sellokart@gmail.com
            </a>.
          </p>
        </section>
      </div>
    </div>
  );
}
