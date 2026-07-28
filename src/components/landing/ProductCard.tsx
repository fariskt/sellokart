"use client";

import { useState, useRef } from "react";
import { Heart, Plus } from "lucide-react";
import { PRODUCTS } from "./constants";

export type ProductType = typeof PRODUCTS[0];

interface ProductCardProps {
  product: ProductType;
}

export function ProductCard({ product }: ProductCardProps) {
  const [wishlist, setWishlist] = useState(false);
  const [hovered, setHovered] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    cardRef.current.style.transform = `perspective(1000px) rotateY(${x * 9}deg) rotateX(${-y * 9}deg) scale(1.025)`;
  };

  const handleMouseLeave = () => {
    if (cardRef.current) cardRef.current.style.transform = "perspective(1000px) rotateY(0deg) rotateX(0deg) scale(1)";
    setHovered(false);
  };

  return (
    <div
      ref={cardRef}
      className="relative group cursor-pointer h-full flex flex-col"
      style={{ transition: "transform 0.2s ease-out" }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={handleMouseLeave}
    >
      {/* Image */}
      <div className="relative flex-1 overflow-hidden rounded-2xl min-h-0 bg-landing-primary-light">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />

        {product.tag && (
          <div className="absolute top-3 left-3 text-[10px] font-black px-2.5 py-1.5 rounded-full bg-landing-primary text-white font-display tracking-[0.15em]">
            {product.tag}
          </div>
        )}

        <button
          onClick={(e) => { e.preventDefault(); setWishlist(!wishlist); }}
          className="absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center transition-all bg-white/92 backdrop-blur-sm cursor-pointer"
        >
          <Heart 
            size={14} 
            fill={wishlist ? "currentColor" : "none"} 
            className={wishlist ? "text-landing-primary" : "text-landing-dark"} 
          />
        </button>

        {/* Quick add */}
        <div
          className="absolute inset-x-3 bottom-3 transition-all duration-300"
          style={{ opacity: hovered ? 1 : 0, transform: hovered ? "translateY(0)" : "translateY(10px)" }}
        >
          <button className="w-full py-2.5 text-[11px] font-black tracking-[0.15em] uppercase rounded-xl flex items-center justify-center gap-2 transition-colors bg-landing-dark text-white font-display hover:bg-landing-primary cursor-pointer">
            <Plus size={13} /> Quick Add
          </button>
        </div>
      </div>

      {/* Info */}
      <div className="mt-3 px-0.5 shrink-0">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-sm font-bold leading-tight text-landing-dark font-display">
            {product.name}
          </h3>
          <span className="text-sm font-black shrink-0 text-landing-dark font-display">
            ${product.price}
          </span>
        </div>
        <div className="flex gap-1.5 mt-2">
          {product.colors.map((color, i) => (
            <div key={i} className="w-3.5 h-3.5 rounded-full border-2 border-white shadow-sm" style={{ background: color }} />
          ))}
        </div>
      </div>
    </div>
  );
}
