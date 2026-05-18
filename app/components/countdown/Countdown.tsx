"use client";

import { useEffect, useState, useRef } from "react";
import CountdownTimer from "./CountdownTimer";
import Marquee from "./Marquee";
import { useTheme } from "../ThemeContext";

/**
 * Countdown Component
 * 
 * Displays the "Final Countdown" section with animated hands, timer, and a scrolling marquee.
 * Accepts `startAnimation` prop to trigger animations when the section scrolls into view.
 */
export default function Countdown({ startAnimation = false }: { startAnimation?: boolean }) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  // --------------------------------------------------------------------------
  // STATE & REFS
  // --------------------------------------------------------------------------

  // Controls the visibility state for CSS transitions (opacity/translation)
  const [isInView, setIsInView] = useState(false);

  // Reference to the main section (though currently unused for intersection observer since we use props)
  const sectionRef = useRef<HTMLElement>(null);

  // --------------------------------------------------------------------------
  // EFFECTS
  // --------------------------------------------------------------------------

  // Syncs local `isInView` state with the `startAnimation` prop passed from the parent (ScrollTrigger)
  useEffect(() => {
    if (startAnimation) {
      setIsInView(true);
    }
  }, [startAnimation]);

  // --------------------------------------------------------------------------
  // RENDER
  // --------------------------------------------------------------------------

  return (
    <section
      ref={sectionRef}
      className={`relative w-full flex flex-col overflow-hidden min-h-screen lg:pb-2 ${isDark ? "bg-black" : "bg-white"}`}
    >
      {/* =========================================
          TOP CONTENT WRAPPER
          Contains Heading, Hands, and Timer
      ========================================= */}
      <div className="pt-32 sm:pt-32 lg:pt-24 flex flex-col gap-10 items-center w-full max-w-[90rem] mx-auto">

        {/* ------------------------------------------------
            1. HEADING SECTION ("FINAL COUNTDOWN")
            Animates: Fade In + Drop Down
        ------------------------------------------------ */}
        <h2
          className={`relative flex flex-col lg:block items-center mb-6 text-center font-orbitron font-black tracking-[8%] whitespace-nowrap transform transition-all duration-1000 ease-out ${isInView ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-10"
            }`}
        >
          {/* Mobile Background Gradient & Texture (Hidden on Desktop) */}
          <div
            className={`absolute bottom-full translate-y-20 inset-x-0 h-[18.75rem] w-full lg:hidden pointer-events-none transition-opacity duration-1000 ${isInView ? "opacity-100" : "opacity-0"
              }`}
            style={{ zIndex: -1 }}
          >
            {/* The Planet (Light Source) */}
            <img
              src="/Planet.png"
              alt=""
              className="absolute inset-0 w-full h-full object-cover"
              style={{
                filter: 'blur(1.25rem)',
                transform: 'scale(1.1)'
              }}
            />

            {/* The Texture (Overlay) */}
            <img
              src="/texture.png"
              alt=""
              className="absolute inset-0 w-full h-full object-cover mix-blend-overlay"
            />
          </div>

          {/* Text Content */}
          <span className={`text-[2.5rem] sm:text-[3rem] md:text-[4rem] lg:text-[5.75rem] lg:mr-6 z-10 ${isDark ? "text-white" : "text-black"}`}>
            FINAL
          </span>
          <span className="text-[#EB0028] text-[2.5rem] sm:text-[3rem] md:text-[4rem] lg:text-[5.75rem] z-10">
            COUNTDOWN
          </span>
        </h2>

        {/* ------------------------------------------------
            2. DESKTOP VIEW
            Layout: [Timer] centered
            Hidden on mobile, visible on lg screens
        ------------------------------------------------ */}
        <div className="hidden -mt-16 lg:flex w-full items-center justify-center min-h-[12.5rem]">

          {/* CENTER TIMER */}
          <div
            className={`flex justify-center z-0 transform transition-all duration-1000 delay-300 ease-out ${isInView ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-10"
              }`}
          >
            <div className={`border ${isDark ? "border-white" : "border-black/20"} w-fit py-4 px-2 xl:px-8 flex justify-center`}>
              <CountdownTimer />
            </div>
          </div>

        </div>

        {/* ------------------------------------------------
            3. MOBILE / TABLET VIEW
            Layout: [Timer] only
            Visible on small screens, hidden on lg
        ------------------------------------------------ */}
        <div
          className={`flex justify-center lg:hidden px-4 w-full transform transition-all duration-1000 delay-300 ease-out ${isInView ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-10"
            }`}
        >
          <div className={`w-fit border ${isDark ? "border-white" : "border-black/20"} flex justify-center px-2 sm:px-4 py-2`}>
            <CountdownTimer />
          </div>
        </div>
      </div>

      {/* =========================================
          BOTTOM MARQUEE SECTION
          Scrolling text at the bottom
      ========================================= */}
      <div
        className={`mt-auto w-full transform transition-all duration-1000 delay-1000 ease-out ${isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-20"
          }`}
      >
        <Marquee />
      </div>
    </section>
  );
}