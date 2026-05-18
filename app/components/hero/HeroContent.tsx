"use client";

import { motion } from "framer-motion";
import Link from "next/link";

const textReveal = (delay: number) => ({
  initial: { clipPath: "inset(0 0 100% 0)" },
  animate: {
    clipPath: "inset(0 0 0% 0)",
    transition: { duration: 1.2, delay, ease: [0.25, 0.1, 0.25, 1] as const },
  },
});

export default function HeroContent() {
  return (
    <div className="absolute inset-0 z-20 flex flex-col items-center justify-center pointer-events-none">
      <div className="relative flex flex-col items-center -mt-16">
        <motion.div
          className="mb-1 overflow-hidden"
          {...textReveal(4.8)}
        >
          <p className="text-[#7C7C7C] font-tedxiceas font-black text-[10px] tracking-[1em] opacity-90 text-center">
            TEDxICEAS
          </p>
        </motion.div>

        <motion.div
          className="overflow-hidden"
          {...textReveal(5.2)}
        >
          <h1
            className="font-orbitron font-black text-[clamp(2.5rem,7vw,5.5rem)] leading-[0.9] text-white text-center select-none"
            style={{ letterSpacing: "-0.02em" }}
          >
            WHAT
          </h1>
        </motion.div>

        <motion.div
          className="overflow-hidden"
          {...textReveal(5.5)}
        >
          <h1
            className="font-orbitron font-black text-[clamp(2.5rem,7vw,5.5rem)] leading-[0.9] text-white text-center select-none"
            style={{ letterSpacing: "-0.02em" }}
          >
            SHAPES
          </h1>
        </motion.div>

        <motion.div
          className="overflow-hidden"
          {...textReveal(5.8)}
        >
          <h1
            className="font-orbitron font-black text-[clamp(2.5rem,7vw,5.5rem)] leading-[0.9] text-white text-center select-none"
            style={{ letterSpacing: "-0.02em" }}
          >
            US?
          </h1>
        </motion.div>
      </div>

      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 6.2, ease: "easeOut" }}
        className="text-white/40 font-clash text-xs sm:text-sm mt-4 tracking-[0.15em]"
      >
        January 31, 2026 — Bengaluru
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 6.5, ease: "easeOut" }}
        className="mt-6 pointer-events-auto"
      >
        <Link href="/tickets">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-[#EB0028] hover:bg-[#B71C1C] text-white font-clash font-normal text-sm py-3 px-8 transition-colors duration-300 cursor-pointer"
          >
            BOOK NOW
          </motion.button>
        </Link>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 7.0 }}
        className="absolute bottom-8 flex flex-col items-center gap-2"
      >
        <span className="font-clash text-[10px] tracking-[0.3em] text-white/30">
          SCROLL
        </span>
        <motion.div
          animate={{ scaleY: [1, 0.4, 1], opacity: [0.6, 0.2, 0.6] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="w-[2px] h-12"
          style={{
            background: "linear-gradient(to bottom, #EB0028, transparent)",
          }}
        />
      </motion.div>
    </div>
  );
}
