import * as React from "react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Frequently Asked Questions | Sellokart",
  description: "Find quick answers to common questions about Sellokart orders, shipping, and products.",
};

const FAQS = [
  {
    q: "How do I track my order?",
    a: "Once your order has been dispatched, you will receive an email and WhatsApp message with tracking details. You can also view live status under your Account > Orders page."
  },
  {
    q: "What payment methods do you accept?",
    a: "We accept all major Credit/Debit Cards, UPI (Google Pay, PhonePe, Paytm), Net Banking, and Cash on Delivery (COD) for eligible pin codes."
  },
  {
    q: "How long does shipping take?",
    a: "Orders usually ship within 1-2 business days. Delivery takes 2-4 business days for metro areas and 4-7 days for other regions."
  },
  {
    q: "What is your return policy?",
    a: "We offer a 7-day hassle-free return window for unwashed and unworn products with tags attached. You can request a return directly from your account."
  },
  {
    q: "How do I contact customer support?",
    a: "You can write to us anytime at info.sellokart@gmail.com or call +91 98765 43210 (Mon – Sat: 9 AM – 7 PM IST)."
  }
];

export default function FaqPage() {
  return (
    <div className="w-full py-12 sm:py-16 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
      <div className="mb-8 text-center sm:text-left">
        <h1 className="text-3xl sm:text-4xl fond-medium font-display text-landing-dark">
          Frequently Asked Questions
        </h1>
        <p className="mt-2 text-xs sm:text-sm text-landing-primary-muted">
          Quick answers to common questions about orders, payments, and returns.
        </p>
      </div>

      <div className="divide-y divide-landing-primary/10 border-y border-landing-primary/10">
        {FAQS.map((faq, index) => (
          <div key={index} className="py-6 space-y-2">
            <h2 className="text-base font-bold text-landing-dark">
              {faq.q}
            </h2>
            <p className="text-sm text-landing-primary-muted leading-relaxed">
              {faq.a}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
