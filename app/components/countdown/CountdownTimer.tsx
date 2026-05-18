"use client";

import { useEffect, useState } from "react";
import { COUNTDOWN_TARGET_ISO } from "./countdown.constants";
import { useTheme } from "../ThemeContext";

type TimeLeft = {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
};

function calculateTimeLeft(): TimeLeft | null {
  const target = new Date(COUNTDOWN_TARGET_ISO).getTime();
  const now = Date.now();
  const diff = target - now;

  if (diff <= 0) {
    return {
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
    };
  }

  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  };
}

export default function CountdownTimer() {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [mounted, setMounted] = useState(false);
  const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(null);

  useEffect(() => {
    setMounted(true);
    setTimeLeft(calculateTimeLeft());

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  if (!mounted || !timeLeft) return null;

  return (
    <div className="flex flex-wrap lg:flex-nowrap items-center justify-center gap-0.5 w-full py-4 mx-0 sm:py-6">

      {Object.entries(timeLeft).map(([label, value], index) => {
        const isDays = index === 0;

        return (
          <div
            key={label}
            className={`
                    flex items-center 
                    ${isDays ? "w-full flex-col justify-center mb-4 lg:flex-row lg:w-auto lg:justify-start lg:mb-0" : ""}
                `}
          >

            {/* UNIT GROUP (Number + Letter) */}
            <div className="flex items-baseline justify-center lg:pr-4">

              {/* NUMBER */}
              <span
                className="font-orbitron font-bold text-[#EB0028]
                        text-[32px] sm:text-[clamp(14px,3vw,82px)] 
                        tabular-nums text-center leading-none"
                style={{ width: "2.3ch" }}
              >
                {value.toString().padStart(2, "0")}
              </span>

              {/* LETTER (D, H, M, S) */}
              <span
                className="font-orbitron font-bold
                        text-[32px] sm:text-[clamp(14px,3vw,82px)] leading-none"
                style={{
                  WebkitTextStroke: "1px #EB0028",
                  color: "transparent",
                }}
              >
                {isDays ? (
                  <>
                    <span className="lg:hidden">DAYS</span>
                    <span className="hidden lg:inline">D</span>
                  </>
                ) : (
                  label.charAt(0).toUpperCase()
                )}
              </span>
            </div>

            {/* Horizontal Line for 'Days' Row (Mobile Only) */}
            {isDays && (
              <div
                className={`lg:hidden mt-3 mb-1 ${isDark ? "bg-white/60" : "bg-black/20"}`}
                style={{
                  width: "100%",
                  height: "1px",
                }}
              />
            )}

            {/* VERTICAL DIVIDER (For Hrs, Min, Sec) */}
            {index < 3 && (
              <div
                className={`
                    mx-1 sm:mx-6 lg:mx-8 xl:mx-12
                    h-14 sm:h-10 lg:h-16
                    ${isDays ? "hidden lg:block" : "block"} 
                    ${isDark ? "bg-white/60" : "bg-black/20"}
                `}
                style={{
                  width: "1px",
                }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}