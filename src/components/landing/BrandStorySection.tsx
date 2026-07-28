"use client";

import { Play } from "lucide-react";

export function BrandStorySection() {
  return (
    <section 
      className="relative py-32 overflow-hidden bg-gradient-to-br from-landing-featured-start via-landing-story-mid to-landing-featured-start" 
    >
      {/* Grid overlay */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-[0.035]" 
        style={{ 
          backgroundImage: "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)", 
          backgroundSize: "80px 80px" 
        }} 
      />
      {/* Center glow */}
      <div 
        className="absolute pointer-events-none" 
        style={{ 
          width: 700, 
          height: 700, 
          borderRadius: "50%", 
          background: "radial-gradient(circle, rgba(26,63,240,0.22) 0%, transparent 70%)", 
          top: "50%", 
          left: "50%", 
          transform: "translate(-50%, -50%)" 
        }} 
      />

      <div className="relative z-10 max-w-[1440px] mx-auto px-6 lg:px-12">
        <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center">

          {/* Layered images */}
          <div className="relative h-[480px] hidden lg:block">
            <div 
              className="absolute" 
              style={{ top: 0, left: 0, width: 280, height: 368, borderRadius: 24, overflow: "hidden", boxShadow: "0 32px 80px rgba(0,0,0,0.45)" }}
            >
              <img src="https://images.unsplash.com/photo-1529139574466-a303027614a1?w=560&h=736&fit=crop&auto=format" alt="Brand story" className="w-full h-full object-cover" />
              <div className="absolute inset-0" style={{ background: "rgba(26,63,240,0.12)" }} />
            </div>
            <div 
              className="absolute" 
              style={{ bottom: 0, right: 0, width: 240, height: 300, borderRadius: 24, overflow: "hidden", boxShadow: "0 32px 80px rgba(0,0,0,0.45)" }}
            >
              <img src="https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=480&h=600&fit=crop&auto=format" alt="Fashion community" className="w-full h-full object-cover" />
            </div>
            {/* Accent line */}
            <div 
              className="absolute w-[2px] h-[120px] bg-gradient-to-b from-transparent via-landing-primary to-transparent" 
              style={{ top: "35%", right: "30%" }} 
            />
          </div>

          {/* Text */}
          <div>
            <div className="inline-flex items-center gap-3 mb-8">
              <span className="w-6 h-px bg-landing-accent-glow" />
              <span className="text-[11px] font-black tracking-[0.28em] uppercase text-landing-accent-glow font-display">
                Our Story
              </span>
            </div>
            <h2 
              className="leading-none tracking-tight mb-4 font-black text-white font-display" 
              style={{ fontSize: "clamp(3rem, 5.5vw, 5.5rem)" }}
            >
              NOT JUST<br />WHAT YOU<br />
              <span className="text-landing-accent-glow">WEAR.</span>
            </h2>
            <h3 
              className="leading-none tracking-tight mb-10 font-black text-landing-dark-muted font-display" 
              style={{ fontSize: "clamp(1.8rem, 3.5vw, 3.2rem)" }}
            >
              HOW YOU<br />SHOW UP.
            </h3>
            <p className="text-[15px] leading-relaxed max-w-sm mb-10 text-landing-dark-muted">
              Sellokart was built on the belief that what you wear is an extension of who you are. Every piece is a statement — precise, purposeful, built to last. Premium materials sourced responsibly. Craftsmanship that goes beyond the seam.
            </p>
            <div className="flex gap-3">
              <button
                className="inline-flex items-center gap-3 px-8 py-3.5 text-[13px] font-black tracking-[0.12em] uppercase rounded-full transition-all cursor-pointer text-white bg-landing-primary font-display hover:bg-landing-primary-hover"
              >
                <Play size={13} fill="#fff" /> Watch Our Story
              </button>
              <button
                className="px-8 py-3.5 text-[13px] font-black tracking-[0.12em] uppercase rounded-full transition-all cursor-pointer text-white border-[1.5px] border-white/20 hover:border-white/50 font-display"
              >
                About Us
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
