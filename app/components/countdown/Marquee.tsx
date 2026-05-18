"use client";

import { useState, useRef, MouseEvent } from "react";
import { useTheme } from "../ThemeContext";

export default function Marquee() {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  // State to determine which image to show
  const [activeImg, setActiveImg] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const popupRef = useRef<HTMLDivElement>(null);

  // Define your images here. Replace with actual paths.
  const IMG_1 = "/image-1.png";
  const IMG_2 = "/image-2.jpg";

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!popupRef.current || !containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;

    // Update position directly for performance
    // Using translateX(-50%) in CSS to center it on the cursor
    popupRef.current.style.left = `${x}px`;
  };

  return (
    // Main Container
    <div
      ref={containerRef}
      className={`relative w-full ${isDark ? "bg-black border-y border-white" : "bg-white border-y border-black/10"} py-6 group`}
      // Clear image when mouse leaves the entire marquee strip area
      onMouseLeave={() => setActiveImg(null)}
      onMouseMove={handleMouseMove}
    >

      {/* HOVER IMAGE POPUP */}
      <div
        ref={popupRef}
        // Positioned absolutely. Left is controlled by JS.
        // -translate-x-1/2 centers it on the cursor X.
        className={`absolute bottom-[100%] z-50 pointer-events-none transition-opacity duration-300 ease-out transform -translate-x-1/2 ${activeImg ? "opacity-100" : "opacity-0"
          }`}
        style={{ left: "50%" }} // Default center until moved
      >
        {activeImg && (
          <img
            src={activeImg}
            alt="Preview"
            // CHANGED: 'translate-y-12' equivalent logic can be handled here or by parent margin.
            // But previous code had `translate-y-12` vs `translate-y-20` on the parent for animation.
            // Since we need to move X constantly, mixing transform transitions for Y might be tricky if we use style.left.
            // Actually, style.left + CSS transform translate-x-1/2 works fine.
            // But the previous Y-translation animation was on the same div.
            // We can keep the Y-translation in a wrapper or just offset via margin?
            // Let's just add the translate-y directly to the class or use a different class for the Y animation?
            // 
            // Better approach:
            // The parent div handles X positioning (left, -translate-x-1/2).
            // A child div handles the Y entrance animation (translate-y).
            className={`w-auto h-auto max-w-[200px] sm:max-w-[300px] max-h-[160px] sm:max-h-[200px] object-contain border ${isDark ? "border-white/50 bg-black" : "border-black/20 bg-white"} shadow-2xl transition-transform duration-500 ease-out ${activeImg ? "translate-y-12" : "translate-y-20"
              }`}
          />
        )}
      </div>

      {/* SCROLLING TRACK CONTAINER */}
      <div className="overflow-hidden w-full h-full relative z-10">
        {/* ANIMATED TRACK */}
        <div className={`animate-marquee flex whitespace-nowrap font-clash font-normal text-[18px] sm:text-[20px] lg:text-[22px] leading-none ${isDark ? "text-white" : "text-black"}`}>

          {/* TRACK 1 */}
          <div className="flex items-center">
            {Array.from({ length: 6 }).map((_, i) => (
              <span key={i} className="flex items-center">

                {/* HOVER ZONE 1: Covers "TEDxICEAS < WHAT SHAPES US?" */}
                <span
                  className="flex items-center gap-6 pr-6 cursor-pointer"
                  onMouseEnter={() => setActiveImg(IMG_1)}
                >
                  <span><span className="text-[#EB0028] font-bold">TED</span><span className="text-[#EB0028] font-bold text-[0.8em] relative -top-[0.3em]">x</span>ICEAS</span>
                  <span className="text-[#EB0028]">&lt;</span>
                  <span>WHAT SHAPES US?</span>
                </span>

                {/* HOVER ZONE 2: Covers "< WHAT SHAPES US? <" */}
                <span
                  className="flex items-center gap-6 pr-6 cursor-pointer"
                  onMouseEnter={() => setActiveImg(IMG_2)}
                >
                  <span className="text-[#EB0028]">&lt;</span>
                  <span>WHAT SHAPES US?</span>
                  <span className="text-[#EB0028]">&lt;</span>
                </span>

              </span>
            ))}
          </div>

          {/* TRACK 2 — IDENTICAL COPY */}
          <div className="flex items-center ml-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <span key={`dup-${i}`} className="flex items-center">

                {/* HOVER ZONE 1 DUPLICATE */}
                <span
                  className="flex items-center gap-6 pr-6 cursor-pointer"
                  onMouseEnter={() => setActiveImg(IMG_1)}
                >
                  <span><span className="text-[#EB0028] font-bold">TED</span><span className="text-[#EB0028] font-bold text-[0.8em] relative -top-[0.3em]">x</span>ICEAS</span>
                  <span className="text-[#EB0028]">&lt;</span>
                  <span>WHAT SHAPES US?</span>
                </span>

                {/* HOVER ZONE 2 DUPLICATE */}
                <span
                  className="flex items-center gap-6 pr-6 cursor-pointer"
                  onMouseEnter={() => setActiveImg(IMG_2)}
                >
                  <span className="text-[#EB0028]">&lt;</span>
                  <span>WHAT SHAPES US?</span>
                  <span className="text-[#EB0028]">&lt;</span>
                </span>
              </span>
            ))}
          </div>

        </div>
      </div>
    </div>
  );
}