"use client";

import { Heart } from "lucide-react";
import { COMMUNITY } from "./constants";

export function CommunitySection() {
  return (
    <section className="py-24 bg-landing-accent-light">
      <div className="max-w-[1440px] mx-auto px-6 lg:px-12">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-3 justify-center mb-4">
            <span className="w-6 h-px bg-landing-primary" />
            <span className="text-[11px] font-black tracking-[0.28em] uppercase text-landing-primary font-display">
              #SellokartStyle
            </span>
            <span className="w-6 h-px bg-landing-primary" />
          </div>
          <h2 
            className="leading-none tracking-tight font-black text-landing-dark font-display" 
            style={{ 
              fontSize: "clamp(2.5rem, 4.5vw, 4rem)"
            }}
          >
            The Community
          </h2>
        </div>

        <div className="grid grid-cols-3 lg:grid-cols-6 gap-3">
          {COMMUNITY.map((img, i) => (
            <div 
              key={i} 
              className="relative overflow-hidden rounded-xl group cursor-pointer aspect-square bg-landing-primary-light"
            >
              <img 
                src={img} 
                alt={`Community ${i + 1}`} 
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
              />
              <div className="absolute inset-0 flex items-center justify-center transition-all duration-300 bg-landing-primary/0 hover:bg-landing-primary/32">
                <Heart size={22} fill="white" className="text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-10">
          <button
            className="px-8 py-3.5 text-[13px] font-black tracking-[0.12em] uppercase rounded-full border-2 transition-all cursor-pointer border-landing-dark text-landing-dark font-display hover:bg-landing-dark hover:text-white"
          >
            Follow @Sellokart
          </button>
        </div>
      </div>
    </section>
  );
}
