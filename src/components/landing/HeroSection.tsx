"use client";

import { useEffect, useRef } from "react";
import { motion } from "motion/react";
import { Star } from "lucide-react";

export function HeroSection() {
  const heroRef = useRef<HTMLElement>(null);
  const layer1 = useRef<HTMLDivElement>(null);
  const layer2 = useRef<HTMLDivElement>(null);
  const layer3 = useRef<HTMLDivElement>(null);
  const layer4 = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let rafId: number;
    const handleMove = (e: MouseEvent) => {
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        const vw = window.innerWidth;
        const vh = window.innerHeight;
        const x = e.clientX / vw - 0.5;
        const y = e.clientY / vh - 0.5;
        if (layer1.current) layer1.current.style.transform = `translate(${x * 28}px, ${y * 18}px) rotate(-3deg)`;
        if (layer2.current) layer2.current.style.transform = `translate(${x * 48}px, ${y * 32}px) rotate(12deg)`;
        if (layer3.current) layer3.current.style.transform = `translate(${x * -32}px, ${y * -22}px) rotate(8deg)`;
        if (layer4.current) layer4.current.style.transform = `translate(${x * 38}px, ${y * 26}px) rotate(-15deg)`;
      });
    };
    window.addEventListener("mousemove", handleMove);
    return () => {
      window.removeEventListener("mousemove", handleMove);
      cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <section
      ref={heroRef}
      className="relative min-h-screen pt-5 flex items-center overflow-hidden bg-landing-hero-bg"
    >
      {/* Background orbs */}
      <div
        className="absolute pointer-events-none"
        style={{
          width: 800,
          height: 800,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(26,63,240,0.1) 0%, transparent 70%)",
          top: "5%",
          right: "15%",
          transform: "translate(0,0)"
        }}
      />
      <div
        className="absolute pointer-events-none"
        style={{
          width: 400,
          height: 400,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(26,63,240,0.07) 0%, transparent 70%)",
          bottom: "10%",
          left: "30%"
        }}
      />

      {/* Subtle grid */}
      <div
        className="absolute inset-0 opacity-[0.025] pointer-events-none"
        style={{
          backgroundImage: "linear-gradient(var(--landing-dark) 1px, transparent 1px), linear-gradient(90deg, var(--landing-dark) 1px, transparent 1px)",
          backgroundSize: "64px 64px"
        }}
      />

      <div className="relative z-10 max-w-[1440px] mx-auto px-6 lg:px-12 w-full">
        <div className="grid lg:grid-cols-2 items-center min-h-screen gap-8 lg:gap-0">

          {/* Left — text */}
          <div className="flex flex-col justify-center py-32 lg:py-0 lg:pr-12">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55 }}
              className="inline-flex items-center gap-3 mb-8"
            >
              <span className="w-8 h-px bg-landing-primary" />
              <span className="text-[11px] font-black tracking-[0.28em] uppercase text-landing-primary font-display">
                SS26 — New Collection
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 32 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.65, delay: 0.08 }}
              className="leading-[0.88] tracking-[-0.03em] mb-8 text-landing-dark font-display font-black"
              style={{
                fontSize: "clamp(3.8rem, 7.5vw, 7.5rem)"
              }}
            >
              WEAR<br />
              <span className="text-landing-primary">WHAT'S</span><br />
              NEXT.
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.2 }}
              className="text-[15px] leading-relaxed max-w-sm mb-10 text-landing-primary-muted"
            >
              Precision-crafted essentials and statement pieces for those who move first. Premium materials. Uncompromising detail.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.3 }}
              className="flex flex-wrap gap-3"
            >
              <button className="px-7 py-3.5 text-[13px] font-black tracking-[0.12em] uppercase rounded-full transition-all cursor-pointer bg-landing-primary hover:bg-landing-primary-hover text-white font-display">
                Shop New Collection
              </button>
              <button className="px-7 py-3.5 text-[13px] font-black tracking-[0.12em] uppercase rounded-full border-2 transition-all cursor-pointer border-landing-dark text-landing-dark font-display hover:bg-landing-dark hover:text-white">
                Explore Collections
              </button>
            </motion.div>

            {/* Stats bar */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.55, delay: 0.45 }}
              className="flex gap-10 mt-14 pt-10"
              style={{ borderTop: "1px solid rgba(10,15,46,0.1)" }}
            >
              {[["180+", "Premium Styles"], ["50K+", "Happy Customers"], ["4.9★", "Average Rating"]].map(([val, label]) => (
                <div key={label}>
                  <div className="text-[22px] font-black tracking-tight text-landing-dark font-display">
                    {val}
                  </div>
                  <div className="text-[11px] font-medium mt-0.5 text-landing-primary-muted">
                    {label}
                  </div>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Right — 3D studio scene */}
          <div className="relative h-[85vh] hidden lg:flex items-center justify-center">
            {/* Studio light */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{ background: "radial-gradient(ellipse 75% 75% at 55% 45%, rgba(26,63,240,0.1) 0%, transparent 70%)" }}
            />

            {/* Ground shadow */}
            <div
              className="absolute pointer-events-none"
              style={{
                width: 300,
                height: 50,
                background: "radial-gradient(ellipse, rgba(26,63,240,0.18) 0%, transparent 70%)",
                borderRadius: "50%",
                bottom: "8%",
                left: "50%",
                transform: "translateX(-50%)"
              }}
            />

            {/* Hoodie — main product */}
            <div ref={layer1} className="absolute" style={{ top: "6%", left: "50%", marginLeft: -160, transition: "transform 0.12s ease-out", zIndex: 3 }}>
              <div style={{ width: 320, height: 390, borderRadius: 28, overflow: "hidden", boxShadow: "0 32px 80px rgba(26,63,240,0.28), 0 12px 32px rgba(0,0,0,0.12)" }}>
                <img src="https://www.aeropostale.com/dw/image/v2/BBSG_PRD/on/demandware.static/-/Sites-master-catalog-aeropostale/default/dw317ad9fd/60219350_204_main.jpg?sw=640&sh=780&sm=fit&sfrm=jpg" alt="Aero Cloud Hoodie" className="w-full h-full object-cover" />
              </div>
              <div className="absolute -top-3 -right-3 text-[10px] font-black px-3 py-1.5 rounded-full bg-landing-primary text-white font-display tracking-[0.15em]">
                NEW DROP
              </div>
            </div>

            {/* Sneaker */}
            <div ref={layer2} className="absolute" style={{ bottom: "10%", right: "2%", transition: "transform 0.16s ease-out", zIndex: 4 }}>
              <div style={{ width: 210, height: 148, borderRadius: 22, overflow: "hidden", boxShadow: "0 20px 60px rgba(26,63,240,0.22), 0 8px 24px rgba(0,0,0,0.1)" }}>
                <img src="https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=420&h=296&fit=crop&auto=format" alt="Sneaker" className="w-full h-full object-cover" />
              </div>
            </div>

            {/* Cap */}
            <div ref={layer3} className="absolute" style={{ top: "10%", left: "2%", transition: "transform 0.13s ease-out", zIndex: 2 }}>
              <div style={{ width: 148, height: 148, borderRadius: 22, overflow: "hidden", boxShadow: "0 16px 48px rgba(10,15,46,0.14)" }}>
                <img src="https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=296&h=296&fit=crop&auto=format" alt="Cap" className="w-full h-full object-cover" />
              </div>
            </div>

            {/* Watch */}
            <div ref={layer4} className="absolute" style={{ bottom: "22%", left: "6%", transition: "transform 0.18s ease-out", zIndex: 2 }}>
              <div style={{ width: 112, height: 112, borderRadius: 18, overflow: "hidden", boxShadow: "0 12px 32px rgba(26,63,240,0.2)" }}>
                <img src="https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=224&h=224&fit=crop&auto=format" alt="Watch" className="w-full h-full object-cover" />
              </div>
            </div>

            {/* Floating price card */}
            <motion.div
              animate={{ y: [0, -9, 0] }}
              transition={{ repeat: Infinity, duration: 3.2, ease: "easeInOut" }}
              className="absolute"
              style={{ top: "43%", right: "0%" }}
            >
              <div style={{ background: "#fff", borderRadius: 20, padding: "14px 18px", boxShadow: "0 20px 60px rgba(26,63,240,0.18)", border: "1px solid rgba(26,63,240,0.1)" }}>
                <div className="text-[11px] font-medium text-landing-primary-muted">Just dropped</div>
                <div className="text-sm font-black mt-0.5 text-landing-dark font-display">
                  Aero Cloud Hoodie
                </div>
                <div className="text-base font-black text-landing-primary font-display">
                  $189
                </div>
              </div>
            </motion.div>

            {/* Floating rating pill */}
            <motion.div
              animate={{ y: [0, 7, 0] }}
              transition={{ repeat: Infinity, duration: 4, ease: "easeInOut", delay: 1.2 }}
              className="absolute"
              style={{ bottom: "30%", right: "25%" }}
            >
              <div className="bg-landing-dark rounded-2xl px-4 py-2.5 shadow-[0_16px_48px_rgba(0,0,0,0.3)]">
                <div className="flex items-center gap-1 mb-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={10}
                      fill="currentColor"
                      className="text-landing-primary"
                    />
                  ))}
                </div>
                <div className="text-[11px] font-bold text-white">50K+ Reviews</div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
        <span className="text-[10px] font-bold tracking-[0.22em] uppercase text-landing-primary-muted font-display">
          Scroll
        </span>
        <motion.div
          animate={{ scaleY: [0, 1, 0], opacity: [0, 1, 0] }}
          transition={{ repeat: Infinity, duration: 1.6, ease: "easeInOut" }}
          className="w-px h-8 origin-top bg-gradient-to-b from-landing-primary to-transparent"
        />
      </div>
    </section>
  );
}
