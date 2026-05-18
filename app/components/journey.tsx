"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useTheme } from "./ThemeContext";
import { useRef, useEffect } from "react";

gsap.registerPlugin(ScrollTrigger);

const currentEvent = {
  year: "2025",
  title: "Threads of Change",
  description:
    "TEDxICEAS 2025: Threads of Change weaves together stories of transformation, resilience, and innovation. Each speaker brought a unique thread — a perspective that challenges the norm, inspires action, and creates ripples of meaningful change. From redefining success to pioneering new frontiers, this inaugural edition celebrated the power of ideas to reshape our world.",
  image: "/images/DSC02160.JPG",
};

const yearsList = ["2025"];
const flatDigits = yearsList
  .map((year) => year + " . ")
  .join("")
  .split("");
const totalDigits = flatDigits.length;
const angleStep = 360 / totalDigits;

export default function Journey() {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const sectionRef = useRef<HTMLDivElement>(null);
  const centerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const mobileCenterRef = useRef<HTMLDivElement>(null);
  const mobileContentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!sectionRef.current) return;

    const ctx = gsap.context(() => {
      ScrollTrigger.matchMedia({

        "(min-width: 768px)": function () {
          if (!centerRef.current || !contentRef.current) return;

          gsap.set(centerRef.current, { y: 0, scale: 1, opacity: 1, xPercent: -50, clearProps: "all" });
          gsap.set(contentRef.current, { y: 80, opacity: 0, clearProps: "all" });

          const tl = gsap.timeline({
            scrollTrigger: {
              trigger: sectionRef.current,
              start: "top top",
              end: "+=150%",
              scrub: true,
              pin: true,
              anticipatePin: 1,
            },
          });

          tl.to(centerRef.current, {
            y: -50,
            xPercent: -50,
            scale: 0.35,
            transformOrigin: "top center",
            duration: 1,
            ease: "power2.inOut",
          });

          tl.to(contentRef.current, { opacity: 1, y: 0, duration: 1, ease: "power2.out" }, "-=0.6");
        },

        "(max-width: 767px)": function () {
          if (!mobileCenterRef.current || !mobileContentRef.current) return;

          gsap.set(mobileCenterRef.current, { y: 0, scale: 1, opacity: 1, clearProps: "all" });
          gsap.set(mobileContentRef.current, { y: 50, opacity: 0, clearProps: "all" });

          const tl = gsap.timeline({
            scrollTrigger: {
              trigger: sectionRef.current,
              start: "top top",
              end: "+=100%",
              scrub: true,
              pin: true,
              anticipatePin: 1,
            },
          });

          tl.to(mobileCenterRef.current, {
            y: -80,
            scale: 0.5,
            transformOrigin: "center center",
            duration: 1,
            ease: "power2.inOut",
          });

          tl.to(mobileContentRef.current, {
            opacity: 1,
            y: -140,
            duration: 1,
            ease: "power2.out"
          }, "-=0.8");
        }
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className={`relative w-full min-h-screen overflow-hidden ${isDark ? "bg-black text-white" : "bg-white text-black"}`}
    >
      {/* 
        ========================================
        MOBILE LAYOUT
        ========================================
      */}
      <div className="md:hidden flex flex-col items-center pt-20 pb-48 px-6 min-h-screen">
        {/* Mobile Center Image with Rings */}
        <div ref={mobileCenterRef} className="relative w-[300px] h-[300px] shrink-0 flex items-center justify-center mb-10">
          <div className="relative w-full h-full flex items-center justify-center">
            {/* Spinning Rings */}
            <div className="absolute inset-0 animate-[spin_35s_linear_infinite]">
              {flatDigits.map((digit, i) => (
                <div key={`m-outer-${i}`} className="absolute left-1/2 top-1/2"
                  style={{ transform: `translate(-50%, -50%) rotate(${i * angleStep}deg) translateY(-140px)` }}>
                  <span className="text-white/40 text-[10px] font-mono">{digit}</span>
                </div>
              ))}
            </div>
            <div className="absolute inset-0 animate-[spin_30s_linear_infinite_reverse]">
              {flatDigits.map((digit, i) => (
                <div key={`m-inner-${i}`} className="absolute left-1/2 top-1/2"
                  style={{ transform: `translate(-50%, -50%) rotate(${i * angleStep}deg) translateY(-100px)` }}>
                  <span className="text-white text-[10px] font-bold font-mono">{digit}</span>
                </div>
              ))}
            </div>
            {/* Sub4 Image - no rotation */}
            <img src="/images/sub4.png" alt="TEDxICEAS" className="relative z-10 w-[160px] drop-shadow-[0_0_30px_rgba(220,38,38,0.5)]" />

          </div>
        </div>

        {/* Mobile Content */}
        <div ref={mobileContentRef} className="w-full max-w-sm flex flex-col">
            <div className="flex justify-between items-end border-b border-gray-800 pb-4 mb-6">
              <h2 className="text-2xl font-bold uppercase">Our <span className="text-[#E62B1E]">Journey</span></h2>
            </div>

          <div className="w-full space-y-4">
            <div>
              <h3 className="text-[#E62B1E] text-xl font-bold mb-1">
                {currentEvent.title}
              </h3>
              <p className="text-3xl font-mono text-gray-700 opacity-50">
                {currentEvent.year}
              </p>
            </div>
            <p className="text-sm text-gray-300 leading-relaxed">
              {currentEvent.description}
            </p>
            <div className="relative w-full h-[180px] bg-gray-900 rounded-lg overflow-hidden border border-gray-800 mt-4 pointer-events-none">
              <img
                src={currentEvent.image}
                alt={currentEvent.title}
                className="w-full h-full object-cover"
              />
            </div>
          </div>

        </div>
      </div>


      {/* 
        ========================================
        DESKTOP LAYOUT
        ========================================
      */}
      <div className="hidden md:block w-full h-full">
        {/* --- DESKTOP CENTER IMAGE --- */}
        <div
          ref={centerRef}
          className="absolute top-[15%] left-1/2 z-20 flex items-center justify-center"
        >
          <div className="relative w-[500px] h-[500px] flex items-center justify-center">
            {/* Outer Ring */}
            <div className="absolute inset-0 flex items-center justify-center animate-[spin_35s_linear_infinite]">
              {flatDigits.map((digit, i) => (
                <div key={`d-outer-${i}`} className="absolute left-1/2 top-1/2"
                  style={{
                    transform: `translate(-50%, -50%) rotate(${i * angleStep}deg) translateY(-260px)`,
                    transition: "transform 1s"
                  }}>
                  <span className="block text-white/40 font-mono text-sm">{digit}</span>
                </div>
              ))}
            </div>

            {/* Inner Ring */}
            <div className="absolute inset-0 flex items-center justify-center animate-[spin_30s_linear_infinite_reverse]">
              {flatDigits.map((digit, i) => (
                <div key={`d-inner-${i}`} className="absolute left-1/2 top-1/2"
                  style={{
                    transform: `translate(-50%, -50%) rotate(${i * angleStep}deg) translateY(-190px)`,
                    transition: "transform 1s"
                  }}>
                  <span className="block text-white font-bold font-mono text-base drop-shadow-[0_0_10px_rgba(255,255,255,0.8)]">{digit}</span>
                </div>
              ))}
            </div>

            {/* Sub4 Image - no rotation */}
            <div className="relative z-30 w-[280px] hover:scale-105 transition-transform duration-500">
              <img
                src="/images/sub4.png"
                alt="TEDxICEAS"
                className="w-full h-auto drop-shadow-[0_0_50px_rgba(220,38,38,0.4)]"
              />
            </div>
          </div>
        </div>

        {/* --- DESKTOP CONTENT --- */}
        <div
          ref={contentRef}
          className="absolute top-[30%] left-1/2 -translate-x-1/2 w-full max-w-5xl pb-32 px-6 opacity-0 z-30"
        >
          {/* Header */}
          <div className="flex justify-between items-end border-b border-gray-800 pb-4 mb-6">
            <h2 className="text-4xl font-bold uppercase">
              Our <span className="text-[#E62B1E]">Journey</span>
            </h2>
          </div>

          {/* Grid */}
          <div className="w-full grid grid-cols-2 gap-8 items-center">
            <div className="space-y-4">
              <div>
                <h3 className="text-[#E62B1E] text-3xl font-bold mb-1">
                  {currentEvent.title}
                </h3>
                <p className="text-3xl font-mono text-gray-600 opacity-50">
                  {currentEvent.year}
                </p>
              </div>
              <p className="text-lg text-gray-400 leading-relaxed max-w-md">
                {currentEvent.description}
              </p>
            </div>

            {/* Image */}
            <div className="relative h-[320px] w-full bg-gray-900 overflow-hidden group border-2 border-white/10 p-1 pointer-events-none">
              <div className="relative w-full h-full overflow-hidden">
                <img
                  src={currentEvent.image}
                  alt={currentEvent.title}
                  className="absolute inset-0 w-full h-full object-cover opacity-90 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700"
                />
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}