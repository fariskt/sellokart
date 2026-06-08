"use client";

import * as React from "react";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, ArrowRight, Pause, Play } from "lucide-react";
import { Title } from "@/components/ui/title";
import { cn } from "@/lib/utils";

interface Slide {
  id: number;
  badge: string;
  title: string;
  description: string;
  image: string;
  primaryCta: string;
  secondaryCta: string;
  theme: "tech" | "minimal" | "fashion";
}

const slides: Slide[] = [
  {
    id: 1,
    badge: "Exclusive Tech",
    title: "Acoustic Perfection Redefined",
    description: "Experience premium sound with custom active noise cancellation, smart ambient awareness, and up to 40 hours of lossless audio playback.",
    image: "/images/headphones.png",
    primaryCta: "Pre-order Now",
    secondaryCta: "Specifications",
    theme: "tech",
  },
  {
    id: 2,
    badge: "Productivity",
    title: "Elevate Your Creative Space",
    description: "Transform your daily workflow with handcrafted minimalist desk accessories, smart lighting, and ergonomic organizers designed for focus.",
    image: "/images/workspace.png",
    primaryCta: "Explore Accessories",
    secondaryCta: "Get Inspiration",
    theme: "minimal",
  },
  {
    id: 3,
    badge: "Trending Style",
    title: "Aesthetic Premium Apparel",
    description: "Uncompromising quality meets contemporary silhouettes. Discover sustainable materials tailored for ultimate comfort and daily styling.",
    image: "/images/fashion.png",
    primaryCta: "Shop New Season",
    secondaryCta: "Watch Lookbook",
    theme: "fashion",
  },
];

export function HeroSlider() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0); // -1 for prev, 1 for next
  const [isPlaying, setIsPlaying] = useState(true);
  const autoplayTimerRef = useRef<NodeJS.Timeout | null>(null);

  const slideDuration = 6000; // 6 seconds per slide

  // Autoplay functionality
  const startAutoplay = () => {
    stopAutoplay();
    if (isPlaying) {
      autoplayTimerRef.current = setInterval(() => {
        setDirection(1);
        setCurrentIndex((prevIndex) => (prevIndex + 1) % slides.length);
      }, slideDuration);
    }
  };

  const stopAutoplay = () => {
    if (autoplayTimerRef.current) {
      clearInterval(autoplayTimerRef.current);
      autoplayTimerRef.current = null;
    }
  };

  useEffect(() => {
    startAutoplay();
    return () => stopAutoplay();
  }, [currentIndex, isPlaying]);

  const handleNext = () => {
    setDirection(1);
    setCurrentIndex((prevIndex) => (prevIndex + 1) % slides.length);
  };

  const handlePrev = () => {
    setDirection(-1);
    setCurrentIndex((prevIndex) => (prevIndex - 1 + slides.length) % slides.length);
  };

  const handleDotClick = (index: number) => {
    setDirection(index > currentIndex ? 1 : -1);
    setCurrentIndex(index);
  };

  const togglePlayback = () => {
    setIsPlaying((prev) => !prev);
  };

  const currentSlide = slides[currentIndex];

  // Animation variants
  const slideVariants = {
    enter: (dir: number) => ({
      x: dir > 0 ? "100%" : "-100%",
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
      transition: {
        x: { type: "spring" as const, stiffness: 300, damping: 30 },
        opacity: { duration: 0.5 },
      },
    },
    exit: (dir: number) => ({
      x: dir < 0 ? "100%" : "-100%",
      opacity: 0,
      transition: {
        x: { type: "spring" as const, stiffness: 300, damping: 30 },
        opacity: { duration: 0.5 },
      },
    }),
  };

  const textContainerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.15,
      },
    },
  };

  const textItemVariants = {
    hidden: { y: 24, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring" as const,
        stiffness: 100,
        damping: 15,
      },
    },
  };

  return (
    <section 
      className="relative w-full h-[650px] md:h-[900px] overflow-hidden select-none bg-slate-950"
      onMouseEnter={stopAutoplay}
      onMouseLeave={startAutoplay}
    >
      <AnimatePresence mode="popLayout" initial={false} custom={direction}>
        <motion.div
          key={currentIndex}
          custom={direction}
          variants={slideVariants}
          initial="enter"
          animate="center"
          exit="exit"
          className="absolute inset-0 w-full h-full flex items-center"
        >
          <div className="absolute inset-0 w-full h-full overflow-hidden">
            {/* Themed background gradient based on slide type */}
            <div className={cn(
              "absolute inset-0 transition-colors duration-1000",
              currentSlide.theme === "tech" 
                ? "bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950/40"
                : currentSlide.theme === "fashion"
                ? "bg-gradient-to-br from-slate-950 via-zinc-900 to-amber-950/20"
                : "bg-gradient-to-br from-slate-950 via-slate-900 to-zinc-900"
            )} />

            {/* Glowing background blob matching slide theme */}
            <div className={cn(
              "absolute top-1/4 left-1/4 w-80 h-80 rounded-full blur-3xl opacity-90 transition-colors duration-1000",
              currentSlide.theme === "tech" 
                ? "bg-blue-500" 
                : currentSlide.theme === "fashion" 
                ? "bg-amber-500" 
                : "bg-neutral-500"
            )} />

            {/* Watermark/background product image */}
            <motion.div
              initial={{ scale: 1.15, opacity: 0, rotate: -2 }}
              animate={{ scale: 1.3, opacity: currentSlide.theme === "tech" ? 0.35 : 0.25, rotate: 2 }}
              transition={{ duration: 6, ease: "easeOut" }}
              className="absolute -right-20 -bottom-20 md:right-10 md:bottom-10 w-[120%] md:w-[60%] h-[120%] md:h-[90%] flex justify-center items-center pointer-events-none select-none"
            >
              <img
                src={currentSlide.image}
                alt={currentSlide.title}
                className="w-full h-full object-contain filter brightness-90 saturate-[1.1] drop-shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
              />
            </motion.div>


          </div>

          {/* Slide Content (Overlaid over Background) */}
          <div className="container-page h-full relative z-10 flex items-center">
            <motion.div
              variants={textContainerVariants}
              initial="hidden"
              animate="visible"
              className="max-w-2xl flex flex-col space-y-4 md:space-y-6 text-white"
            >
              {/* Badge */}
              <motion.div variants={textItemVariants}>
                <span className="inline-flex items-center px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider bg-secondary text-secondary-foreground border border-accent/20">
                  {currentSlide.badge}
                </span>
              </motion.div>

              {/* Title */}
              <motion.div variants={textItemVariants}>
                <Title 
                  as="h1" 
                  size="xl" 
                  className={cn(
                    "leading-[1.1] font-extrabold text-white",
                    currentSlide.theme === "tech" 
                      ? "bg-linear-to-r from-blue-400 via-indigo-200 to-white bg-clip-text text-transparent"
                      : "text-white"
                  )}
                >
                  {currentSlide.title}
                </Title>
              </motion.div>

              {/* Description */}
              <motion.p 
                variants={textItemVariants}
                className="text-slate-300 text-base md:text-lg leading-relaxed max-w-xl"
              >
                {currentSlide.description}
              </motion.p>

              {/* Call to Actions */}
              <motion.div 
                variants={textItemVariants}
                className="flex flex-wrap gap-4 pt-2"
              >
                <button 
                  type="button"
                  className="inline-flex items-center justify-center px-6 py-3 rounded-lg font-medium text-sm transition-all duration-200 cursor-pointer bg-primary text-primary-foreground hover:bg-primary-hover button-shadow hover:translate-y-[-2px] active:translate-y-[0px]"
                >
                  <span>{currentSlide.primaryCta}</span>
                  <ArrowRight className="ml-2 w-4 h-4" />
                </button>
                <button 
                  type="button"
                  className="inline-flex items-center justify-center px-6 py-3 rounded-lg font-medium text-sm transition-all duration-200 cursor-pointer border border-white/20 text-white hover:bg-white/10 hover:border-white/40 hover:translate-y-[-2px] active:translate-y-[0px]"
                >
                  {currentSlide.secondaryCta}
                </button>
              </motion.div>
            </motion.div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Navigation Controls */}
      
      {/* Left Arrow */}
      <button
        onClick={handlePrev}
        type="button"
        aria-label="Previous Slide"
        className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full border border-white/10 bg-slate-900/60 hover:bg-slate-900/80 text-white flex items-center justify-center shadow-xs backdrop-blur-xs transition-all hover:scale-105 active:scale-95 cursor-pointer opacity-0 md:opacity-100 hover:border-primary/50"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>

      {/* Right Arrow */}
      <button
        onClick={handleNext}
        type="button"
        aria-label="Next Slide"
        className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full border border-white/10 bg-slate-900/60 hover:bg-slate-900/80 text-white flex items-center justify-center shadow-xs backdrop-blur-xs transition-all hover:scale-105 active:scale-95 cursor-pointer opacity-0 md:opacity-100 hover:border-primary/50"
      >
        <ChevronRight className="w-5 h-5" />
      </button>

      {/* Controls Overlay (Dots, Playback, Progress) */}
      <div className="absolute bottom-6 left-0 right-0 z-20 flex flex-col items-center justify-center gap-4">
        
        {/* Progress Bar */}
        {isPlaying && (
          <div className="w-48 h-[2px] bg-white/20 rounded-full overflow-hidden">
            <motion.div
              key={currentIndex}
              initial={{ width: 0 }}
              animate={{ width: "100%" }}
              transition={{ duration: slideDuration / 1000, ease: "linear" }}
              className="h-full bg-primary"
            />
          </div>
        )}

        <div className="flex items-center gap-4 px-4 py-2 bg-slate-900/60 border border-white/10 rounded-full backdrop-blur-md">
          {/* Play/Pause Button */}
          <button
            onClick={togglePlayback}
            type="button"
            className="text-slate-400 hover:text-white transition-colors cursor-pointer"
            aria-label={isPlaying ? "Pause autoplay" : "Start autoplay"}
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </button>

          {/* Separator */}
          <div className="w-[1px] h-4 bg-white/10" />

          {/* Dots Indicator */}
          <div className="flex items-center gap-2">
            {slides.map((slide, idx) => (
              <button
                key={slide.id}
                onClick={() => handleDotClick(idx)}
                type="button"
                aria-label={`Go to slide ${idx + 1}`}
                className={cn(
                  "w-2.5 h-2.5 rounded-full transition-all duration-300 cursor-pointer",
                  currentIndex === idx
                    ? "bg-primary w-6"
                    : "bg-white/30 hover:bg-white/60"
                )}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
