import { ArrowRight } from "lucide-react"

export const WhatsAppCta = () => {
    return (

        <div className="max-w-7xl mx-auto border-t border-accent-foreground pt-16">

            <div className="relative rounded-[28px] sm:rounded-[36px] overflow-hidden bg-[#0c0e14] mb-16 shadow-2xl border border-white/10">
                {/* Ambient Edge Glows */}
                <div className="absolute -top-24 -right-24 w-96 h-96 bg-landing-primary/20 blur-3xl rounded-full pointer-events-none" />
                <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-red-950/20 blur-3xl rounded-full pointer-events-none" />

                <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[300px] sm:min-h-[340px] items-center relative z-10">
                    {/* Left Decorative Concentric Discs Graphic */}
                    <div className="lg:col-span-5 h-[240px] sm:h-[300px] lg:h-full relative overflow-hidden flex items-start justify-center lg:justify-start">
                        <svg
                            viewBox="0 0 420 380"
                            className="w-full h-full max-w-[420px] object-cover pointer-events-none"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <defs>
                                <filter id="discShadow" x="-20%" y="-20%" width="140%" height="140%">
                                    <feDropShadow dx="0" dy="10" stdDeviation="12" floodColor="#000000" floodOpacity="0.55" />
                                </filter>
                                <radialGradient id="disc5Grad" cx="35%" cy="30%" r="70%">
                                    <stop offset="0%" stopColor="#1e232d" />
                                    <stop offset="100%" stopColor="#0d1017" />
                                </radialGradient>
                                <radialGradient id="disc4Grad" cx="35%" cy="30%" r="70%">
                                    <stop offset="0%" stopColor="#374151" />
                                    <stop offset="100%" stopColor="#1f2937" />
                                </radialGradient>
                                <radialGradient id="disc3Grad" cx="35%" cy="30%" r="70%">
                                    <stop offset="0%" stopColor="#64748b" />
                                    <stop offset="100%" stopColor="#475569" />
                                </radialGradient>
                                <radialGradient id="disc2Grad" cx="35%" cy="30%" r="70%">
                                    <stop offset="0%" stopColor="#cbd5e1" />
                                    <stop offset="100%" stopColor="#94a3b8" />
                                </radialGradient>
                                <radialGradient id="disc1Grad" cx="35%" cy="30%" r="70%">
                                    <stop offset="0%" stopColor="#ffffff" />
                                    <stop offset="70%" stopColor="#f1f5f9" />
                                    <stop offset="100%" stopColor="#e2e8f0" />
                                </radialGradient>
                            </defs>

                            {/* Layer 5 (Outermost) */}
                            <circle cx="170" cy="10" r="300" fill="url(#disc5Grad)" opacity="0.9" />
                            {/* Layer 4 */}
                            <circle cx="170" cy="10" r="235" fill="url(#disc4Grad)" filter="url(#discShadow)" />
                            {/* Layer 3 */}
                            <circle cx="170" cy="10" r="175" fill="url(#disc3Grad)" filter="url(#discShadow)" />
                            {/* Layer 2 */}
                            <circle cx="170" cy="10" r="120" fill="url(#disc2Grad)" filter="url(#discShadow)" />
                            {/* Layer 1 (Innermost Top Disc) */}
                            <circle cx="170" cy="10" r="70" fill="url(#disc1Grad)" filter="url(#discShadow)" />
                        </svg>
                    </div>

                    {/* Right Content */}
                    <div className="lg:col-span-7 p-6 sm:p-10 lg:p-14 lg:pl-4 flex flex-col justify-center">
                        <h3 className="text-3xl sm:text-4xl lg:text-[42px]  tracking-tight text-white font-display leading-[1.12] mb-3 sm:mb-4">
                            Join Our Exclusive
                            <br />
                            WhatsApp Community
                        </h3>

                        <p className="text-xs sm:text-sm text-white/70 max-w-lg leading-relaxed mb-6 sm:mb-8 font-sans">
                            Get instant access to secret product drops, exclusive member specials, and direct customer care. We&apos;re happy to help you.
                        </p>

                        {/* Pill CTA Button with Glossy Orb / Circle Indicator */}
                        <div>
                            <a
                                href="https://whatsapp.com"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-4 pl-6 sm:pl-7 pr-2 sm:pr-2.5 py-2 sm:py-2.5 rounded-full bg-landing-primary hover:bg-landing-primary-hover text-white text-xs sm:text-sm font-bold tracking-wide transition-all shadow-xl hover:shadow-2xl group cursor-pointer"
                            >
                                <span>Join WhatsApp Community</span>
                                <span className="w-8 h-8 rounded-full bg-gradient-to-br from-white via-white to-slate-200 text-landing-dark flex items-center justify-center shadow-md group-hover:translate-x-1 transition-transform">
                                    <ArrowRight size={14} className="text-landing-dark" />
                                </span>
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>

    )
}
