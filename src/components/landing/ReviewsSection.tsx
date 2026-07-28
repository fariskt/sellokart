"use client";

import { motion } from "motion/react";
import { Star } from "lucide-react";
import { REVIEWS } from "./constants";

export function ReviewsSection() {
  return (
    <section className="py-24 px-6 lg:px-12 max-w-[1440px] mx-auto">
      <div className="text-center mb-14">
        <div className="inline-flex items-center gap-3 justify-center mb-4">
          <span className="w-6 h-px bg-landing-primary" />
          <span className="text-[11px] font-black tracking-[0.28em] uppercase text-landing-primary font-display">
            Customer Love
          </span>
          <span className="w-6 h-px bg-landing-primary" />
        </div>
        <h2 
          className="leading-none tracking-tight mb-5 font-black text-landing-dark font-display" 
          style={{ 
            fontSize: "clamp(2.5rem, 4.5vw, 4rem)"
          }}
        >
          What They Say
        </h2>
        <div className="flex items-center justify-center gap-1.5">
          {[...Array(5)].map((_, i) => (
            <Star key={i} size={18} fill="currentColor" className="text-landing-primary" />
          ))}
          <span className="text-sm font-bold ml-2 text-landing-dark font-display">
            4.9 from 50,000+ reviews
          </span>
        </div>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
        {REVIEWS.map((review, i) => (
          <motion.div
            key={review.name}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1, duration: 0.5 }}
            className="rounded-2xl p-6 transition-all bg-white border-[1.5px] border-landing-primary/10 shadow-[0_4px_24px_rgba(26,63,240,0.05)] hover:shadow-[0_12px_40px_rgba(26,63,240,0.14)] hover:border-landing-primary/20"
          >
            <div className="flex gap-1 mb-4">
              {[...Array(review.rating)].map((_, j) => (
                <Star key={j} size={13} fill="currentColor" className="text-landing-primary" />
              ))}
            </div>
            <p className="text-[14px] leading-relaxed mb-6 text-landing-dark">
              &ldquo;{review.review}&rdquo;
            </p>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full overflow-hidden bg-landing-primary-light">
                <img src={review.avatar} alt={review.name} className="w-full h-full object-cover" />
              </div>
              <div>
                <div className="text-[13px] font-black text-landing-dark font-display">
                  {review.name}
                </div>
                <div className="text-[11px] font-medium text-landing-primary">
                  {review.product}
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
