"use client";

import React, { useRef } from 'react';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';


const Placeholder = ({ startAnimation = false }: { startAnimation?: boolean }) => {
  const boxRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    if (!startAnimation) return;

    gsap.fromTo(boxRef.current,
      { x: '10vw' },
      {
        x: '90vw',
        duration: 5,
        ease: "none"
      }
    );
  }, { scope: containerRef, dependencies: [startAnimation] });

  return (
    <section ref={containerRef} className="relative w-full h-screen bg-black overflow-hidden flex items-center">
      <div
        ref={boxRef}
        className="w-20 h-20 bg-red-600 absolute left-0"
      />
    </section>
  );
};

export default Placeholder;
