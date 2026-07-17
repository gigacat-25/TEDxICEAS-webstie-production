"use client";

import { useTheme } from "../components/ThemeContext";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Link from "next/link";

type Sponsor = {
  tier: string;
  name: string;
  description: string;
  logo: string;
};

const sponsors: Sponsor[] = [];

export default function SponsorsPage() {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const grouped = sponsors.reduce<Record<string, Sponsor[]>>((acc, s) => {
    if (!acc[s.tier]) acc[s.tier] = [];
    acc[s.tier].push(s);
    return acc;
  }, {});

  const hasSponsors = sponsors.length > 0;

  return (
    <main className={`min-h-screen ${isDark ? "bg-black text-white" : "bg-white text-black"}`}>
      <Navbar startAnimation={true} />

      <div className="pt-32 pb-20 px-6 md:px-16 max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-16">
          <h1 className="font-orbitron text-4xl md:text-6xl font-black tracking-tight mb-4">
            Our <span className="text-[#EB0028]">Sponsors</span>
          </h1>
          <p className="font-clash text-base md:text-lg opacity-70 max-w-xl">
            At TEDx, we are deeply grateful for the support of our partners and sponsors. Their commitment to spreading ideas worth sharing makes our events possible.
          </p>
          <div className="w-16 h-1 bg-[#EB0028] mt-6" />
        </div>

        {/* Sponsor Groups or Coming Soon */}
        {hasSponsors ? (
          Object.entries(grouped).map(([tier, items]) => (
            <div key={tier} className="mb-16">
              <h2 className="font-orbitron text-xl md:text-2xl font-bold mb-6 text-[#EB0028]">
                {tier}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {items.map((sponsor) => (
                  <div
                    key={sponsor.name}
                    className={`p-6 rounded-lg border transition-colors ${
                      isDark
                        ? "bg-white/5 border-white/10 hover:border-white/20"
                        : "bg-black/5 border-black/10 hover:border-black/20"
                    }`}
                  >
                    <div className="h-16 mb-4 flex items-center justify-center">
                      <img src={sponsor.logo} alt={`${sponsor.name} logo`} className="h-full object-contain" />
                    </div>
                    <h3 className="font-orbitron text-lg font-bold mb-2">{sponsor.name}</h3>
                    <p className="font-clash text-sm leading-relaxed opacity-70">{sponsor.description}</p>
                  </div>
                ))}
              </div>
            </div>
          ))
        ) : (
          <div
            className={`p-10 md:p-16 rounded-2xl border text-center my-8 ${
              isDark
                ? "bg-white/5 border-white/10"
                : "bg-black/5 border-black/10"
            }`}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EB0028]/10 text-[#EB0028] font-clash text-xs uppercase tracking-widest font-semibold mb-6">
              TEDxICEAS 2026
            </div>
            <h2 className="font-orbitron text-3xl md:text-4xl font-bold mb-4">
              Sponsors Announcement <span className="text-[#EB0028]">Coming Soon</span>
            </h2>
            <p className="font-clash text-base md:text-lg opacity-70 max-w-xl mx-auto mb-6 leading-relaxed">
              We are currently curating an extraordinary group of partners and sponsors for TEDxICEAS 2026. Stay tuned for the big reveal!
            </p>
          </div>
        )}

        {/* Want to Sponsor Callout */}
        <div
          className={`p-8 md:p-10 rounded-xl border flex flex-col md:flex-row items-center justify-between gap-6 ${
            isDark
              ? "bg-gradient-to-r from-white/5 to-black/30 border-white/10"
              : "bg-gradient-to-r from-black/5 to-white/30 border-black/10"
          }`}
        >
          <div>
            <h3 className="font-orbitron text-xl md:text-2xl font-bold mb-2">
              Want to <span className="text-[#EB0028]">sponsor us?</span>
            </h3>
            <p className="font-clash text-sm md:text-base opacity-80 max-w-lg leading-relaxed">
              Partner with TEDxICEAS 2026 to showcase your brand, support innovation, and connect with visionary minds.
            </p>
          </div>
          <a
            href="mailto:tedxiceas@gmail.com"
            className="shrink-0 inline-flex items-center gap-3 px-6 py-3.5 bg-[#EB0028] text-white font-clash text-sm font-semibold tracking-wide rounded-lg hover:bg-[#B71C1C] transition-all transform hover:scale-[1.02] shadow-lg shadow-[#EB0028]/20"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
            </svg>
            Contact Us: tedxiceas@gmail.com
          </a>
        </div>

        {/* Back to Home */}
        <div className="mt-16">
          <Link
            href="/"
            className="inline-flex items-center gap-2 font-clash text-sm text-[#EB0028] hover:underline"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
            Back to Home
          </Link>
        </div>
      </div>

      <Footer />
    </main>
  );
}
