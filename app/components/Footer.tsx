"use client";

import { useEffect, useState, useRef } from "react";
import { useTheme } from "./ThemeContext";
import { venue } from "@/lib/venue";
import Link from "next/link";

export default function Footer({ startAnimation = false }: { startAnimation?: boolean }) {
  const [isInView, setIsInView] = useState(false);
  const footerRef = useRef<HTMLElement>(null);
  const { theme } = useTheme();

  useEffect(() => {
    if (startAnimation) {
      setIsInView(true);
    }
  }, [startAnimation]);

  const isDark = theme === "dark";

  return (
    <footer ref={footerRef} className={`lg:pt-10 ${isDark ? "bg-black text-white" : "bg-white text-black"}`}>
      {/* MAIN FOOTER CONTENT */}
      <div className="relative mx-auto w-full max-w-screen px-6 lg:px-16 lg:pt-24 lg:pb-12 lg:mt-0 -mt-24">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-0">

          {/* LEFT COLUMN */}
          <div className="relative w-full lg:pr-16">

            <div
              className={`transform transition-all duration-1000 ease-out ${isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
            >
              <h3 className="font-orbitron text-3xl md:text-[48px] tracking-[-2%]">
                Got a <span className="text-[#EB0028]">Question?</span>
              </h3>

              <p className="mt-2 font-orbitron text-xl md:text-[24px] opacity-80">
                Contact
              </p>
            </div>

            {/* CONTACT CARDS */}
            <div className="mt-10 lg:mt-[100px] space-y-6 lg:space-y-10">

              {/* CONTACT CARD - TEDxICEAS Email */}
              <div
                className={`border ${isDark ? "border-white" : "border-black"} px-5 py-4 w-full max-w-[380px] transform transition-opacity duration-1000 delay-500 ease-out ${isInView ? "opacity-100" : "opacity-0"}`}
              >
                <p className="font-clash text-2xl md:text-[26px] tracking-[-2%] text-[#EB0028]">
                  TEDxICEAS
                </p>

                <p className="mt-0.5 font-clash text-[12px] text-white/70">
                  Official Contact
                </p>

                <div className="mt-1 h-px w-full bg-white/30" />

                <a
                  href="mailto:tedxiceas@gmail.com"
                  className="mt-3 flex items-center gap-3 font-clash text-[16px] text-white hover:opacity-80 transition"
                >
                  <img
                    src="/call.png"
                    alt="Email"
                    className="h-4 w-4"
                  />
                  <span>tedxiceas@gmail.com</span>
                </a>
              </div>

              {/* SOCIAL CARD */}
              <div
                className={`border ${isDark ? "border-white" : "border-black"} px-5 py-4 w-full max-w-[380px] transform transition-opacity duration-1000 delay-700 ease-out ${isInView ? "opacity-100" : "opacity-0"}`}
              >
                <p className="font-clash text-2xl md:text-[26px] tracking-[-2%] text-[#EB0028]">
                  Follow Us
                </p>

                <p className="mt-0.5 font-clash text-[12px] text-white/70">
                  Stay Updated
                </p>

                <div className="mt-1 h-px w-full bg-white/30" />

                <div className="mt-4 flex items-center gap-4">
                  <a
                    href="https://www.instagram.com/tedxiceas/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 font-clash text-[16px] text-white hover:opacity-80 transition"
                  >
                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 18 18">
                      <path d="M9.0041 4.3865C6.44874 4.3865 4.38758 6.44766 4.38758 9.00301C4.38758 11.5584 6.44874 13.6195 9.0041 13.6195C11.5595 13.6195 13.6206 11.5584 13.6206 9.00301C13.6206 6.44766 11.5595 4.3865 9.0041 4.3865ZM9.0041 12.0044C7.35276 12.0044 6.00276 10.6584 6.00276 9.00301C6.00276 7.34766 7.34874 6.00167 9.0041 6.00167C10.6595 6.00167 12.0054 7.34766 12.0054 9.00301C12.0054 10.6584 10.6554 12.0044 9.0041 12.0044ZM14.8862 4.19766C14.8862 4.79632 14.4041 5.27444 13.8095 5.27444C13.2108 5.27444 12.7327 4.7923 12.7327 4.19766C12.7327 3.60301 13.2148 3.12087 13.8095 3.12087C14.4041 3.12087 14.8862 3.60301 14.8862 4.19766ZM17.9438 5.29051C17.8755 3.8481 17.5461 2.57042 16.4894 1.51775C15.4367 0.465067 14.159 0.135603 12.7166 0.0632812C11.23 -0.0210937 6.77419 -0.0210937 5.28758 0.0632812C3.84919 0.131585 2.57151 0.461049 1.51482 1.51373C0.45812 2.56641 0.132673 3.84408 0.0603516 5.28649C-0.0240234 6.7731 -0.0240234 11.2289 0.0603516 12.7155C0.128655 14.1579 0.45812 15.4356 1.51482 16.4883C2.57151 17.541 3.84517 17.8704 5.28758 17.9427C6.77419 18.0271 11.23 18.0271 12.7166 17.9427C14.159 17.8744 15.4367 17.545 16.4894 16.4883C17.542 15.4356 17.8715 14.1579 17.9438 12.7155C18.0282 11.2289 18.0282 6.77712 17.9438 5.29051Z"/>
                    </svg>
                    <span>@tedxiceas</span>
                  </a>
                  <a
                    href="https://www.linkedin.com/company/tedxiceas"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 font-clash text-[16px] text-white hover:opacity-80 transition"
                  >
                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                    </svg>
                    <span>LinkedIn</span>
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* VERTICAL DIVIDER */}
          <div className="hidden lg:block absolute left-1/2 top-0 h-full w-px bg-white/40" />

          {/* RIGHT COLUMN */}
          <div
            className={`w-full lg:pl-16 transform transition-all duration-1000 delay-1000 ease-out ${isInView ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-20"}`}
          >
            <h3 className="font-orbitron text-3xl md:text-[42px] tracking-[5%]">
              See You <span className="text-[#EB0028]">there!</span>
            </h3>

            {/* Location */}
            <div className="mt-6 flex items-start gap-3 font-clash text-lg md:text-[20px] leading-relaxed text-white/90">
              <img
                src="/location.png"
                alt="Location"
                className="mt-1 h-5 w-5 flex-shrink-0"
              />
              <span>
                {venue.fullLocation}
              </span>
            </div>

            {/* Parking */}
            <div className="mt-4 flex items-center gap-3 font-clash text-base md:text-[18px] text-white">
              <img
                src="/car.png"
                alt="Parking"
                className="h-5 w-5 flex-shrink-0"
              />
              <span>Free Parking Space available!</span>
            </div>

            {/* Venue Image */}
            <div className="my-8 w-full border border-white/30 overflow-hidden">
              <img
                src="/images/venue.avif"
                alt="Impact College of Engineering and Applied Sciences"
                className="w-full h-auto object-cover"
              />
            </div>

            {/* Map */}
            <div className="my-8 h-[200px] md:h-[260px] w-full border border-white/30 overflow-hidden">
              <iframe
                title="Impact College of Engineering and Applied Sciences Map"
                src={venue.mapEmbedUrl}
                className={`h-full w-full ${isDark ? "[filter:invert(0.85)_hue-rotate(180deg)_saturate(0.5)]" : ""}`}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>
        </div>
      </div>

      {/* BOTTOM BAR */}
      <div
        className={`border-t transform transition-opacity duration-1000 delay-1200 ease-out ${isInView ? "opacity-100" : "opacity-0"} ${isDark ? "border-white/40" : "border-black/20"}`}
      >
        <div className="mx-auto flex w-full max-w-[1440px] flex-row items-center justify-between md:gap-0 px-4 py-4 lg:px-12">
          <img
            src={isDark ? "/logo-white.png" : "/logo-black.png"}
            alt="TEDxICEAS"
            className="h-[24px] md:h-[40px]"
          />
          <div className="flex flex-col items-center justify-center text-center">
            <span className="font-tedxiceas text-[10px] md:text-[16px] text-white/80 leading-tight">
              ©TEDxICEAS
            </span>
            <Link
              href="/terms"
              className="font-clash text-[8px] md:text-[11px] text-[#EB0028] hover:underline transition mt-1"
            >
              Terms & Privacy Policy
            </Link>
          </div>
          <div className="flex flex-col items-center gap-0.5">
            <span className="font-clash text-[8px] md:text-[14px] text-white/70 whitespace-nowrap">
              FOLLOW US ON.
            </span>
            <div className="flex items-center gap-2 md:gap-4">
              <a
                href="https://www.instagram.com/tedxiceas/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
              >
                <img
                  src="/instagram.svg"
                  alt="Instagram"
                  className="h-3 w-3 md:h-5 md:w-5 hover:opacity-80 transition"
                />
              </a>
              <a
                href="https://www.linkedin.com/company/tedxiceas"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn"
              >
                <svg className="w-3 h-3 md:w-5 md:h-5 hover:opacity-80 transition" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* TEDx License Text */}
      <div className={`border-t px-6 py-4 text-center text-[10px] md:text-[12px] font-clash ${isDark ? "border-white/20 text-white/50" : "border-black/20 text-black/50"}`}>
        This independent TEDx event is operated under license from TED.
      </div>
    </footer>
  );
}