"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';

const Loader = ({ onComplete }: { onComplete?: () => void }) => {
  const [isVisible, setIsVisible] = useState(true);

  return (
    <AnimatePresence mode='wait' onExitComplete={onComplete}>
      {isVisible && (
        <motion.div
          key="loader"
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center min-h-screen bg-[#040404] text-white"
          exit={{
            y: "-100%",
            transition: { duration: 0.8, ease: [0.76, 0, 0.24, 1] }
          }}
        >
          {/* Desktop View */}
          <div className="hidden md:flex relative flex-col items-center w-[360px] max-w-full -mt-16">
            <div className="flex justify-center -mb-2 w-full overflow-hidden relative z-10">
              <motion.div
                initial={{ clipPath: "inset(0 0 100% 0)", y: 20, opacity: 0 }}
                animate={{ clipPath: "inset(0 0 0% 0)", y: 0, opacity: 1 }}
                transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1] }}
                className="w-full"
                onAnimationComplete={() => {
                  // Trigger exit after a minimal delay or immediately, 
                  // but we need to wait for the subtext too.
                  // Simplest way is a setTimeout or use a sequence in parent.
                  // For now, let's let the subtext animate, then set isVisible(false)
                }}
              >
                <Image
                  src="/logo-white.png"
                  alt="TEDxICEAS"
                  width={504}
                  height={101}
                  className="w-full h-auto"
                  priority
                  unoptimized
                />
              </motion.div>
            </div>
            <div className="flex justify-center w-full relative z-0">
              <motion.div
                initial={{ y: "-100%", opacity: 0 }}
                animate={{ y: "0%", opacity: 1 }}
                transition={{
                  duration: 1.5,
                  ease: [0.22, 1, 0.36, 1],
                  delay: 0.2 // Slight stagger
                }}
                className="w-auto"
                onAnimationComplete={() => {
                  setTimeout(() => setIsVisible(false), 500);
                }}
              >
                <Image
                  src="/sub-text.svg"
                  alt="Presents"
                  width={249}
                  height={12}
                  className="w-auto h-[8.7px]"
                  priority
                />
              </motion.div>
            </div>
          </div>

          {/* Mobile View */}
          <div className="md:hidden relative flex flex-col items-center w-[80vw] max-w-full -translate-y-[10vh]">
            <div className="flex justify-center mb-0.5 w-full overflow-hidden relative z-10">
              <motion.div
                initial={{ clipPath: "inset(0 0 100% 0)", y: 20, opacity: 0 }}
                animate={{ clipPath: "inset(0 0 0% 0)", y: 0, opacity: 1 }}
                transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1] }}
                className="w-full"
              >
                <Image
                  src="/logo-white.png"
                  alt="TEDxICEAS"
                  width={504}
                  height={101}
                  className="w-full h-auto"
                  priority
                  unoptimized
                />
              </motion.div>
            </div>
            <div className="flex justify-center w-full relative z-0">
              <motion.div
                initial={{ y: "-100%", opacity: 0 }}
                animate={{ y: "0%", opacity: 1 }}
                transition={{
                  duration: 1.5,
                  ease: [0.22, 1, 0.36, 1],
                  delay: 0.2
                }}
                className="w-auto"
                onAnimationComplete={() => {
                  setTimeout(() => setIsVisible(false), 500);
                }}
              >
                <Image
                  src="/sub-text.svg"
                  alt="Presents"
                  width={249}
                  height={12}
                  className="w-auto h-[8.7px]"
                  priority
                />
              </motion.div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Loader;