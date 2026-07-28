"use client";

import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { TRENDING } from "./constants";

export function TrendingSection() {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (dir: number) => {
    scrollRef.current?.scrollBy({ left: dir * 320, behavior: "smooth" });
  };

  return (
    <section className="py-24 bg-landing-accent-light">
      <div className="max-w-[1440px] mx-auto px-6 lg:px-12">
        <div className="flex items-end justify-between mb-10">
          <div>
            <div className="inline-flex items-center gap-3 mb-4">
              <span className="w-6 h-px bg-landing-primary" />
              <span className="text-[11px] font-black tracking-[0.28em] uppercase text-landing-primary font-display">
                This Season
              </span>
            </div>
            <h2 
              className="leading-none tracking-tight font-black text-landing-dark font-display" 
              style={{ 
                fontSize: "clamp(2.8rem, 5vw, 4.5rem)"
              }}
            >
              Bestsellers
            </h2>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => scroll(-1)} 
              className="w-11 h-11 rounded-full border-2 flex items-center justify-center transition-all cursor-pointer border-landing-dark text-landing-dark hover:bg-landing-dark hover:text-white"
            >
              <ChevronLeft size={17} />
            </button>
            <button 
              onClick={() => scroll(1)} 
              className="w-11 h-11 rounded-full flex items-center justify-center transition-all cursor-pointer text-white bg-landing-dark hover:bg-landing-primary"
            >
              <ChevronRight size={17} />
            </button>
          </div>
        </div>

        <div 
          ref={scrollRef} 
          className="flex gap-4 overflow-x-auto pb-2" 
          style={{ scrollbarWidth: "none", scrollSnapType: "x mandatory" }}
        >
          {TRENDING.map((item) => (
            <div 
              key={item.rank} 
              className="flex-none group cursor-pointer w-[280px] snap-start"
            >
              <div className="relative overflow-hidden rounded-2xl h-[360px] bg-landing-primary-light">
                <img 
                  src={item.image} 
                  alt={item.name} 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                />
                <div 
                  className="absolute inset-0" 
                  style={{ background: "linear-gradient(to top, rgba(10,15,46,0.5) 0%, transparent 50%)" }} 
                />
                {/* Rank watermark */}
                <div className="absolute top-3 left-3 text-[5rem] font-black leading-none select-none pointer-events-none text-white/15 font-display">
                  {item.rank}
                </div>
                {/* Info pill */}
                <div 
                  className="absolute bottom-3 left-3 right-3 rounded-xl p-3" 
                  style={{ background: "rgba(255,255,255,0.93)", backdropFilter: "blur(12px)" }}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-[13px] font-black leading-tight text-landing-dark font-display">
                        {item.name}
                      </div>
                      <div className="text-[11px] font-medium mt-0.5 text-landing-primary-muted">
                        {item.sales}
                      </div>
                    </div>
                    <div className="text-[14px] font-black text-landing-primary font-display">
                      ${item.price}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
