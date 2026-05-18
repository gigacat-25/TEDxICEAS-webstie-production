"use client";

import { useTheme } from "../ThemeContext";

export default function Marquee() {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <div className={`relative w-full ${isDark ? "bg-black border-y border-white" : "bg-white border-y border-black/10"} py-6`}>
      {/* SCROLLING TRACK CONTAINER */}
      <div className="overflow-hidden w-full">
        {/* ANIMATED TRACK */}
        <div className={`animate-speakers-marquee flex whitespace-nowrap font-clash font-normal text-[18px] sm:text-[18px] lg:text-[22px] leading-none ${isDark ? "text-white" : "text-black"}`}>

          {/* TRACK 1 */}
          <div className="flex items-center">
            {Array.from({ length: 6 }).map((_, i) => (
              <span key={i} className="flex items-center gap-6 pr-6">
                <span><span className="text-[#EB0028] font-bold">TED</span><span className="text-[#EB0028] font-bold text-[0.8em] relative -top-[0.3em]">x</span>ICEAS</span>
                <span className="text-[#EB0028]">&lt;</span>
                <span>WHAT SHAPES US?</span>
                <span className="text-[#EB0028]">&lt;</span>
                <span>SPEAKERS  •  STORIES  •  IMPACT</span>
                <span className="text-[#EB0028]">&lt;</span>
              </span>
            ))}
          </div>

          {/* TRACK 2 — DUPLICATE FOR SEAMLESS LOOP */}
          <div className="flex items-center ml-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <span key={`dup-${i}`} className="flex items-center gap-6 pr-6">
                <span><span className="text-[#EB0028] font-bold">TED</span><span className="text-[#EB0028] font-bold text-[0.8em] relative -top-[0.3em]">x</span>ICEAS</span>
                <span className="text-[#EB0028]">&lt;</span>
                <span>WHAT SHAPES US?</span>
                <span className="text-[#EB0028]">&lt;</span>
                <span>SPEAKERS  •  STORIES  •  IMPACT</span>
                <span className="text-[#EB0028]">&lt;</span>
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
