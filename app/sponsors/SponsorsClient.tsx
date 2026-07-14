"use client";

import { useTheme } from "../components/ThemeContext";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Link from "next/link";

const sponsors = [
  { tier: "Title Sponsor", name: "Sanvi Group", description: "Real Estate", logo: "/sponsors/sanvi-group.png" },
  { tier: "Patron Sponsor", name: "SOGO COMPUTERS", description: "Computer Store", logo: "/sponsors/sogo.png" },
  { tier: "Bank Partners", name: "Bank of Baroda", description: "Public Sector Bank", logo: "/sponsors/bank-of-baroda.png" },
  { tier: "Bank Partners", name: "Karur Vysya Bank", description: "Private Bank", logo: "/sponsors/karur-vyasa.png" },
  { tier: "Affiliate Sponsor", name: "My Captain", description: "E-Learning Platform", logo: "/sponsors/my-captain.png" },
];

export default function SponsorsPage() {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const grouped = sponsors.reduce<Record<string, typeof sponsors>>((acc, s) => {
    if (!acc[s.tier]) acc[s.tier] = [];
    acc[s.tier].push(s);
    return acc;
  }, {});

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
            At TEDx, we are deeply grateful for the support of our incredible sponsors. Their commitment to spreading ideas worth sharing is what makes our events possible. We would like to extend our sincerest appreciation to each of these organizations for their belief in the power of innovation and community engagement.
          </p>
          <div className="w-16 h-1 bg-[#EB0028] mt-6" />
        </div>

        {/* Sponsor Groups */}
        {Object.entries(grouped).map(([tier, items]) => (
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
        ))}

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
