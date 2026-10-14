"use client";

import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { CATEGORIES } from "./constants";
import { useLandingCategories } from "@/features/products/hooks/useLandingProducts";

export function CategorySection() {
  const { data: rawCategories, isLoading } = useLandingCategories();

  // If Supabase categories exist, map them, otherwise fallback to constants
  const categories =
    rawCategories && rawCategories.length > 0
      ? rawCategories.slice(0, 3).map((cat, i) => ({
          id: cat.id,
          name: cat.name,
          sub: i === 0 ? "FEATURED DROP" : i === 1 ? "CAPSULE DROP" : "URBAN CORE",
          cta: `Shop ${cat.name}`,
          image: cat.image_url || CATEGORIES[i]?.image || CATEGORIES[0].image,
          href: `/products?category=${cat.id}`,
        }))
      : CATEGORIES.map((c) => ({ ...c, id: c.name, href: `/products` }));

  const secondaryCategories =
    rawCategories && rawCategories.length > 3
      ? rawCategories.slice(3, 6).map((cat, i) => ({
          id: cat.id,
          name: cat.name,
          image:
            cat.image_url ||
            [
              "https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=700&h=420&fit=crop&auto=format",
              "https://images.unsplash.com/photo-1598532163257-ae3c6b2524b6?q=80&w=763&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
              "https://images.unsplash.com/photo-1600269452121-4f2416e55c28?w=700&h=420&fit=crop&auto=format",
            ][i] ||
            CATEGORIES[0].image,
          href: `/products?category=${cat.id}`,
        }))
      : [
          {
            id: "Accessories",
            name: "Accessories",
            image:
              "https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=700&h=420&fit=crop&auto=format",
            href: "/products",
          },
          {
            id: "Bags",
            name: "Bags",
            image:
              "https://images.unsplash.com/photo-1598532163257-ae3c6b2524b6?q=80&w=763&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
            href: "/products",
          },
          {
            id: "Footwear",
            name: "Footwear",
            image:
              "https://images.unsplash.com/photo-1600269452121-4f2416e55c28?w=700&h=420&fit=crop&auto=format",
            href: "/products",
          },
        ];

  return (
    <section className="py-24 px-6 lg:px-12 max-w-[1440px] mx-auto" id="collections">
      <div className="flex items-end justify-between mb-12">
        <div>
          <div className="inline-flex items-center gap-3 mb-4">
            <span className="w-6 h-px bg-landing-primary" />
            <span className="text-[11px] font-black tracking-[0.28em] uppercase text-landing-primary font-display">
              Shop by Category
            </span>
          </div>
          <h2
            className="leading-none tracking-tight font-black text-landing-dark font-display"
            style={{
              fontSize: "clamp(2.8rem, 5vw, 4.5rem)",
            }}
          >
            Collections
          </h2>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-[1.7fr_1.2fr_0.9fr] gap-3.5 mb-3.5 h-auto lg:h-[580px]">
          <div className="rounded-2xl bg-slate-200/60 animate-pulse h-[300px] lg:h-full md:col-span-2 lg:col-span-1" />
          <div className="rounded-2xl bg-slate-200/60 animate-pulse h-[280px] lg:h-full" />
          <div className="rounded-2xl bg-slate-200/60 animate-pulse h-[280px] lg:h-full" />
        </div>
      ) : (
        /* Main asymmetric grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-[1.7fr_1.2fr_0.9fr] gap-3.5 h-auto lg:h-[580px]">
          {categories.map((cat, i) => (
            <Link
              key={cat.id || cat.name}
              href={cat.href}
              className={`relative overflow-hidden rounded-2xl group cursor-pointer bg-landing-primary-light h-[320px] sm:h-[380px] lg:h-full ${
                i === 0 ? "md:col-span-2 lg:col-span-1" : ""
              }`}
            >
              <img
                src={cat.image}
                alt={cat.name}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div
                className="absolute inset-0"
                style={{
                  background:
                    "linear-gradient(to top, rgba(10,15,46,0.82) 0%, rgba(10,15,46,0.1) 50%, transparent 100%)",
                }}
              />
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{ background: "rgba(26,63,240,0.15)" }}
              />
              <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-7">
                <div className="text-[10px] font-black tracking-[0.28em] uppercase mb-2 text-landing-accent-glow font-display">
                  {cat.sub}
                </div>
                <h3
                  className={`leading-none tracking-tight mb-4 font-black text-white font-display ${
                    i === 0
                      ? "text-3xl sm:text-4xl lg:text-[2.8rem]"
                      : "text-2xl sm:text-3xl lg:text-[2.2rem]"
                  }`}
                >
                  {cat.name}
                </h3>
                <span className="inline-flex items-center gap-2 text-[13px] font-black tracking-wide group-hover:gap-3 transition-all cursor-pointer text-white font-display">
                  {cat.cta} <ArrowRight size={15} />
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Secondary row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 mt-3.5">
        {secondaryCategories.map((item) => (
          <Link
            key={item.id || item.name}
            href={item.href}
            className="relative overflow-hidden rounded-2xl group cursor-pointer bg-landing-primary-light h-[200px] sm:h-[240px]"
          >
            <img
              src={item.image}
              alt={item.name}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div
              className="absolute inset-0"
              style={{
                background:
                  "linear-gradient(to top, rgba(10,15,46,0.72) 0%, transparent 60%)",
              }}
            />
            <div
              className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              style={{ background: "rgba(26,63,240,0.15)" }}
            />
            <div className="absolute bottom-0 left-0 right-0 p-5">
              <h4 className="font-black tracking-tight text-[1.4rem] text-white font-display">
                {item.name}
              </h4>
              <span className="text-[11px] font-bold text-landing-accent-glow font-display">
                Shop Now →
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
