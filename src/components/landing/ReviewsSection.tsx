"use client";

// WhatsApp chat review screenshots (Replace image paths with your actual WhatsApp screenshot files)
const CHAT_REVIEWS = [
  {
    id: 1,
    image: "https://i.pinimg.com/736x/3f/20/ca/3f20ca9d303d0ba50ea0b584f0691c77.jpg",
    alt: "WhatsApp customer chat review 1",
  },
  {
    id: 2,
    image: "https://i.pinimg.com/736x/3f/20/ca/3f20ca9d303d0ba50ea0b584f0691c77.jpg",
    alt: "WhatsApp customer chat review 2",
  },
  {
    id: 3,
    image: "https://i.pinimg.com/736x/3f/20/ca/3f20ca9d303d0ba50ea0b584f0691c77.jpg",
    alt: "WhatsApp customer chat review 3",
  },
];

export function ReviewsSection() {
  return (
    <section className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 max-w-[1400px] mx-auto overflow-hidden">
      {/* Container Card */}
      <div>
        {/* Header */}
        <div className="text-center max-w-xl mx-auto mb-10 sm:mb-12">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl  tracking-tight text-landing-dark font-display leading-tight mb-2">
            What They Say
          </h2>
        </div>

        {/* Marquee Track (Only WhatsApp screenshot cards, pauses on hover) */}
        <div className="relative w-full overflow-hidden py-2 group select-none">
          {/* Scrolling Container */}
          <div className="flex items-center gap-6 whitespace-nowrap animate-[marquee_28s_linear_infinite] group-hover:[animation-play-state:paused]">
            {[...CHAT_REVIEWS, ...CHAT_REVIEWS, ...CHAT_REVIEWS, ...CHAT_REVIEWS].map((item, idx) => (
              <div
                key={`${item.id}-${idx}`}
                className="w-[260px] sm:w-[300px] aspect-[3/4] shrink-0 rounded-3xl bg-white border border-slate-200/80 shadow-xs hover:shadow-xl transition-all duration-300 overflow-hidden flex items-center justify-center group/card cursor-pointer"              >
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
