"use client";

// WhatsApp chat review screenshots (Replace image paths with your actual WhatsApp screenshot files)
const CHAT_REVIEWS = [
  {
    id: 1,
    image: "/images/landing/review-1.png",
    alt: "WhatsApp customer chat review 1",
  },
  {
    id: 2,
    image: "/images/landing/review-1.png",
    alt: "WhatsApp customer chat review 2",
  },
  {
    id: 3,
    image: "/images/landing/review-1.png",
    alt: "WhatsApp customer chat review 3",
  },
];

export function ReviewsSection() {
  return (
    <section className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 max-w-[1400px] mx-auto overflow-hidden">
      {/* Container Card */}
      <div className="rounded-[32px] sm:rounded-[44px] bg-[#fbfcfd] border border-landing-primary/10 p-6 sm:p-12 lg:p-14 shadow-sm">
        {/* Header */}
        <div className="text-center max-w-xl mx-auto mb-10 sm:mb-12">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-landing-dark font-display leading-tight mb-2">
            What They Say
          </h2>
        </div>

        {/* Marquee Track (Only WhatsApp screenshot cards, pauses on hover) */}
        <div className="relative w-full overflow-hidden py-2 group select-none">
          {/* Subtle Edge Gradient Masks */}
          <div className="pointer-events-none absolute inset-y-0 left-0 w-12 sm:w-28 bg-gradient-to-r from-[#fbfcfd] to-transparent z-10" />
          <div className="pointer-events-none absolute inset-y-0 right-0 w-12 sm:w-28 bg-gradient-to-l from-[#fbfcfd] to-transparent z-10" />

          {/* Scrolling Container */}
          <div className="flex items-center gap-6 whitespace-nowrap animate-[marquee_28s_linear_infinite] group-hover:[animation-play-state:paused]">
            {[...CHAT_REVIEWS, ...CHAT_REVIEWS, ...CHAT_REVIEWS, ...CHAT_REVIEWS].map((item, idx) => (
              <div
                key={`${item.id}-${idx}`}
                className="w-[260px] sm:w-[300px] aspect-[9/16] shrink-0 rounded-3xl bg-white border border-slate-200/80 shadow-xs hover:shadow-xl transition-all duration-300 overflow-hidden flex items-center justify-center group/card cursor-pointer"
              >
                <img
                  src={item.image}
                  alt={item.alt}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover/card:scale-105"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
