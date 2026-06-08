"use client";

import * as React from "react";
import { Sparkles, Mail, ArrowRight } from "lucide-react";

export function NewsletterSection() {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert("Subscribed successfully!");
  };

  return (
    <section className="container-page section-padding">
      <div className="relative rounded-3xl bg-slate-950 border border-white/5 overflow-hidden p-8 md:p-16 text-center flex flex-col items-center justify-center group shadow-md select-none">
        {/* Ambient Glows */}
        <div className="absolute top-[-20%] left-[-20%] w-[50%] h-[50%] bg-primary/20 rounded-full blur-3xl" />
        <div className="absolute bottom-[-20%] right-[-20%] w-[50%] h-[50%] bg-purple-500/10 rounded-full blur-3xl" />

        <div className="relative z-10 max-w-2xl">
          <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-primary mx-auto mb-6">
            <Sparkles className="w-6 h-6 animate-pulse" />
          </div>

          <h2 className="text-3xl md:text-4xl font-extrabold text-white leading-tight mb-4">
            Join the Sellokart Elite Club
          </h2>
          <p className="text-slate-400 text-sm md:text-base leading-relaxed mb-8 max-w-lg mx-auto">
            Subscribe to unlock early-access updates, spec releases, weekly curated drops, and a flat 10% discount code on your first order.
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 w-full max-w-md mx-auto">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                <Mail className="w-4 h-4" />
              </div>
              <input
                type="email"
                required
                placeholder="Enter your email address"
                className="w-full pl-11 pr-4 py-3 rounded-xl border border-white/10 bg-white/5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              />
            </div>
            <button
              type="submit"
              className="inline-flex items-center justify-center px-6 py-3 rounded-xl font-bold text-sm bg-primary text-white hover:bg-primary-hover button-shadow hover:translate-y-[-1px] active:translate-y-[1px] transition-all cursor-pointer"
            >
              <span>Subscribe</span>
              <ArrowRight className="w-4 h-4 ml-2" />
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
