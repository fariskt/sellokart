"use client";

import * as React from "react";
import { useState } from "react";
import { Mail, Phone, MapPin, Send, CheckCircle2 } from "lucide-react";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitted(true);
    }, 600);
  };

  return (
    <div className="w-full py-12 sm:py-16 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
      {/* Simple Header */}
      <div className="text-center mb-10">
        <h1 className="text-3xl sm:text-4xl fond-medium font-display text-landing-dark">
          Contact Us
        </h1>
        <p className="mt-2 text-sm sm:text-base text-landing-primary-muted max-w-lg mx-auto">
          Have questions or need assistance? Reach out to our team below.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Contact Info Sidebar */}
        <div className="space-y-6 md:border-r md:border-landing-primary/10 md:pr-8">
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wider text-landing-primary font-display mb-4">
              Get in Touch
            </h2>
            <div className="space-y-4 text-sm">
              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-landing-primary shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold text-landing-dark">Email</div>
                  <a
                    href="mailto:info.sellokart@gmail.com"
                    className="text-landing-primary-muted hover:text-landing-primary transition-colors text-xs"
                  >
                    info.sellokart@gmail.com
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Phone className="w-5 h-5 text-landing-primary shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold text-landing-dark">Phone</div>
                  <a
                    href="tel:+919876543210"
                    className="text-landing-primary-muted hover:text-landing-primary transition-colors text-xs"
                  >
                    +91 98765 43210
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-landing-primary shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold text-landing-dark">Address</div>
                  <p className="text-landing-primary-muted text-xs">
                    Sellokart Lifestyle Hub, BKC, Mumbai, Maharashtra 400051
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-[#f8faff] border border-landing-primary/10 text-xs text-landing-primary-muted">
            <span className="font-bold text-landing-dark block mb-1">Hours of Support</span>
            Monday – Saturday: 9:00 AM – 7:00 PM IST
          </div>
        </div>

        {/* Contact Form */}
        <div className="md:col-span-2">
          {submitted ? (
            <div className="p-8 text-center rounded-2xl border border-landing-primary/15 bg-[#f8faff] space-y-3">
              <CheckCircle2 className="w-10 h-10 text-landing-primary mx-auto" />
              <h3 className="text-lg font-bold text-landing-dark">Message Sent</h3>
              <p className="text-xs text-landing-primary-muted">
                Thank you, {formData.name}. We have received your message and will reply to {formData.email} shortly.
              </p>
              <button
                type="button"
                onClick={() => {
                  setFormData({ name: "", email: "", subject: "", message: "" });
                  setSubmitted(false);
                }}
                className="mt-2 text-xs font-bold text-landing-primary hover:underline cursor-pointer"
              >
                Send another message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label htmlFor="name" className="text-xs font-bold text-landing-dark">
                    Name
                  </label>
                  <input
                    id="name"
                    required
                    type="text"
                    placeholder="Your name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-landing-primary/15 bg-white text-sm text-landing-dark placeholder:text-slate-400 focus:outline-none focus:border-landing-primary focus:ring-2 focus:ring-landing-primary/10 transition-all font-medium"
                  />
                </div>

                <div className="space-y-1">
                  <label htmlFor="email" className="text-xs font-bold text-landing-dark">
                    Email
                  </label>
                  <input
                    id="email"
                    required
                    type="email"
                    placeholder="your@email.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-landing-primary/15 bg-white text-sm text-landing-dark placeholder:text-slate-400 focus:outline-none focus:border-landing-primary focus:ring-2 focus:ring-landing-primary/10 transition-all font-medium"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label htmlFor="subject" className="text-xs font-bold text-landing-dark">
                  Subject
                </label>
                <input
                  id="subject"
                  required
                  type="text"
                  placeholder="How can we help?"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-landing-primary/15 bg-white text-sm text-landing-dark placeholder:text-slate-400 focus:outline-none focus:border-landing-primary focus:ring-2 focus:ring-landing-primary/10 transition-all font-medium"
                />
              </div>

              <div className="space-y-1">
                <label htmlFor="message" className="text-xs font-bold text-landing-dark">
                  Message
                </label>
                <textarea
                  id="message"
                  required
                  rows={4}
                  placeholder="Write your message here..."
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-landing-primary/15 bg-white text-sm text-landing-dark placeholder:text-slate-400 focus:outline-none focus:border-landing-primary focus:ring-2 focus:ring-landing-primary/10 transition-all font-medium resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-full bg-landing-primary hover:bg-landing-primary-hover disabled:opacity-50 text-white font-bold text-xs transition-colors cursor-pointer"
              >
                {isSubmitting ? "Sending..." : "Send Message"}
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
