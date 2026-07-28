"use client";

import { useState, useRef } from "react";
import { motion, useScroll, useTransform } from "motion/react";
import { Play } from "lucide-react";

export function FeaturedProductSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start end", "end start"] });
  const rotate = useTransform(scrollYProgress, [0, 1], [-18, 18]);
  const scale = useTransform(scrollYProgress, [0, 0.4, 0.6, 1], [0.88, 1.06, 1.06, 0.92]);
  const [selectedSize, setSelectedSize] = useState("M");

  return (
    <section
      ref={sectionRef}
      className="py-28 overflow-hidden bg-gradient-to-br from-landing-featured-start via-landing-featured-mid to-landing-featured-end"
    >
      <div className="max-w-[1440px] mx-auto px-6 lg:px-12">
        <div className="grid lg:grid-cols-2 gap-16 items-center" style={{ minHeight: "72vh" }}>

          {/* Text side */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.65 }}
          >
            <div className="inline-flex items-center gap-3 mb-8">
              <span className="w-6 h-px bg-landing-accent-glow" />
              <span className="text-[11px] font-black tracking-[0.28em] uppercase text-landing-accent-glow font-display">
                Featured Drop
              </span>
            </div>
            <h2 
              className="leading-none tracking-tight mb-8 font-black text-white font-display" 
              style={{ 
                fontSize: "clamp(3rem, 5.5vw, 5.5rem)" 
              }}
            >
              ICE<br />DRIFT<br />
              <span className="text-landing-accent-glow">JACKET</span>
            </h2>
            <p className="text-[15px] leading-relaxed max-w-sm mb-10 text-landing-dark-muted">
              Engineered for the elements. Technical shell construction with premium wool lining for unmatched warmth-to-weight ratio. Every seam sealed. Every panel purposeful.
            </p>

            <div className="flex items-center gap-8 mb-10">
              <div>
                <div className="text-4xl font-black text-white font-display">$329</div>
                <div className="text-[11px] font-medium mt-1 text-landing-accent-glow">Free shipping worldwide</div>
              </div>
            </div>

            {/* Size selector */}
            <div className="mb-10">
              <div className="text-[11px] font-black tracking-[0.2em] uppercase mb-3 text-landing-accent-glow font-display">
                Size
              </div>
              <div className="flex gap-2">
                {["XS", "S", "M", "L", "XL", "2XL"].map((s) => (
                  <button
                    key={s}
                    onClick={() => setSelectedSize(s)}
                    className={`w-10 h-10 rounded-full text-[12px] font-black transition-all cursor-pointer font-display border-[1.5px] text-white ${
                      selectedSize === s 
                        ? "border-landing-primary bg-landing-primary" 
                        : "border-white/20 bg-transparent"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-3">
              <button className="px-8 py-3.5 text-[13px] font-black tracking-[0.12em] uppercase rounded-full transition-all cursor-pointer bg-landing-primary text-white font-display hover:bg-landing-primary-hover">
                Shop the Look
              </button>
              <button className="px-8 py-3.5 text-[13px] font-black tracking-[0.12em] uppercase rounded-full transition-all flex items-center gap-2 cursor-pointer border-[1.5px] border-white/20 hover:border-white/50 text-white font-display">
                <Play size={13} /> Video
              </button>
            </div>
          </motion.div>

          {/* Product image */}
          <div className="flex items-center justify-center">
            <motion.div style={{ rotate, scale }} className="relative">
              <div style={{ width: 440, height: 520, borderRadius: 32, overflow: "hidden", boxShadow: "0 40px 120px rgba(26,63,240,0.45), 0 0 0 1px rgba(255,255,255,0.06)" }}>
                <img src="https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?w=880&h=1040&fit=crop&auto=format" alt="Ice Drift Jacket" className="w-full h-full object-cover" />
              </div>
              {/* Glow rings */}
              <div 
                className="absolute -inset-4 rounded-[48px] pointer-events-none" 
                style={{ background: "radial-gradient(ellipse at center, rgba(26,63,240,0.25) 0%, transparent 70%)" }} 
              />
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
