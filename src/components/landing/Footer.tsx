"use client";

export function Footer() {
  return (
    <footer className="bg-landing-featured-start text-white">
      {/* Newsletter */}
      <div className="py-16 px-6 lg:px-12" style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
        <div className="max-w-[1440px] mx-auto flex flex-col lg:flex-row items-center justify-between gap-8">
          <div>
            <h3 className="text-2xl font-black tracking-tight text-white font-display">Stay in the Loop</h3>
            <p className="text-[14px] mt-1 text-landing-dark-muted">New drops, exclusive access, early sales. Never miss.</p>
          </div>
          <div className="flex gap-3 w-full lg:w-auto max-w-md">
            <input
              type="email"
              placeholder="your@email.com"
              className="flex-1 px-5 py-3 rounded-full text-[14px] outline-none transition-colors bg-white/8 border-[1.5px] border-white/15 focus:border-landing-primary text-white"
            />
            <button className="px-6 py-3 text-[13px] font-black tracking-[0.1em] uppercase rounded-full transition-all whitespace-nowrap cursor-pointer bg-landing-primary text-white font-display hover:bg-landing-primary-hover">
              Subscribe
            </button>
          </div>
        </div>
      </div>

      {/* Links */}
      <div className="py-16 px-6 lg:px-12">
        <div className="max-w-[1440px] mx-auto grid grid-cols-2 lg:grid-cols-5 gap-10">
          <div className="col-span-2 lg:col-span-2">
            <div className="text-xl font-black tracking-tighter mb-4 text-white font-display">SELLOKART</div>
            <p className="text-[14px] leading-relaxed max-w-xs text-landing-dark-muted">
              Premium fashion and lifestyle for the ones who move first. Quality without compromise.
            </p>
          </div>
          {[
            { title: "Shop", links: ["New Arrivals", "Men", "Women", "Accessories", "Sale"] },
            { title: "Company", links: ["About Us", "Careers", "Press", "Sustainability"] },
            { title: "Help", links: ["Sizing Guide", "Shipping", "Returns", "FAQ", "Contact"] },
          ].map((col) => (
            <div key={col.title}>
              <div className="text-[10px] font-black tracking-[0.22em] uppercase mb-5 text-white font-display">
                {col.title}
              </div>
              <ul className="space-y-3">
                {col.links.map((link) => (
                  <li key={link}>
                    <a 
                      href="#" 
                      className="text-[14px] transition-colors text-landing-dark-muted hover:text-white"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom */}
      <div className="py-6 px-6 lg:px-12" style={{ borderTop: "1px solid rgba(255,255,255,0.07)" }}>
        <div className="max-w-[1440px] mx-auto flex flex-col lg:flex-row items-center justify-between gap-4">
          <span className="text-[12px] text-landing-dark-muted">© 2026 Sellokart. All rights reserved.</span>
          <div className="flex gap-6">
            {["Privacy Policy", "Terms of Service", "Cookie Settings"].map((link) => (
              <a 
                key={link} 
                href="#" 
                className="text-[12px] transition-colors text-landing-dark-muted hover:text-white"
              >
                {link}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
