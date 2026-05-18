"use client";

import React, { useState, useRef, useEffect } from 'react';
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/**
 * MOCK DATA - 7 ITEMS
 */
const ITEMS = [
  {
    id: 1,
    title: 'Elena Roussos',
    role: 'AI Ethics Lead',
    category: 'Keynote',
    bio: 'Pioneering safe AGI development frameworks. Elena advocates for transparent algorithms in global finance systems and has advised the G20 on digital policy.',
    image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=1000&auto=format&fit=crop'
  },
  {
    id: 2,
    title: 'Marcus Chen',
    role: 'Chief Architect',
    category: 'Tech Talk',
    bio: 'The mind behind the quantum-resistant ledger. Marcus bridges the gap between theoretical physics and applied cryptography, securing the next decade of data.',
    image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=1000&auto=format&fit=crop'
  },
  {
    id: 3,
    title: 'Sarah Jenkins',
    role: 'Product Strategy',
    category: 'Panelist',
    bio: 'Transforming user retention models at scale. Sarah has led product verticals for three Fortune 500 tech giants and is a vocal advocate for ethical design.',
    image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=1000&auto=format&fit=crop'
  },
  {
    id: 4,
    title: 'David Okeke',
    role: 'UX Director',
    category: 'Workshop',
    bio: 'Championing inclusive design patterns. David’s workshops focus on accessibility as a driver for innovation rather than a compliance checklist.',
    image: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=1000&auto=format&fit=crop'
  },
  {
    id: 5,
    title: 'Priya Patel',
    role: 'Venture Capital',
    category: 'Fireside',
    bio: 'Managing partner at Zenith Ventures. Priya specializes in seed-stage funding for deep-tech robotics startups and sustainable energy grids.',
    image: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?q=80&w=1000&auto=format&fit=crop'
  },
  {
    id: 6,
    title: 'James Wilson',
    role: 'Futurist',
    category: 'Keynote',
    bio: 'Author of "The Next 50 Years". James predicts macro-economic shifts driven by automated labor markets and the rise of synthetic biology.',
    image: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=1000&auto=format&fit=crop'
  },
  {
    id: 7,
    title: 'Anita Roy',
    role: 'Robotics Lead',
    category: 'Demo',
    bio: 'Lead engineer for the Atlas project. Anita will be demonstrating the latest in bipedal locomotion and adaptive terrain navigation systems.',
    image: 'https://images.unsplash.com/photo-1590650516494-0c8e4a4dd67e?q=80&w=1000&auto=format&fit=crop'
  },
];

/**
 * MAIN COMPONENT
 */
export default function SpeakersPrototype() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [config, setConfig] = useState({
    radius: 380,
    itemHeight: 180,
    cardWidth: 260,
    cardHeight: 340,
  });

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 640) {
        setConfig({ radius: 150, itemHeight: 120, cardWidth: 160, cardHeight: 220 });
      } else if (window.innerWidth < 1024) {
        setConfig({ radius: 260, itemHeight: 150, cardWidth: 220, cardHeight: 280 });
      } else {
        setConfig({ radius: 380, itemHeight: 180, cardWidth: 260, cardHeight: 340 });
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div ref={containerRef} className="relative min-h-screen bg-black text-white overflow-hidden font-clash selection:bg-[#eb0028] selection:text-white">

      {/* Background - Pure Black Minimal */}
      <div className="absolute inset-0 pointer-events-none bg-black" />

      {/* Main Carousel Stage */}
      <main className="relative z-0 flex flex-col items-center justify-center h-screen w-full perspective-container">
        <HelixCarousel
          parentRef={containerRef}
          items={ITEMS}
          radius={config.radius}
          itemHeight={config.itemHeight}
          cardWidth={config.cardWidth}
          cardHeight={config.cardHeight}
        />
      </main>
    </div>
  );
}

/**
 * HELIX CAROUSEL LOGIC
 */
function HelixCarousel({
  parentRef,
  items,
  radius,
  itemHeight,
  cardWidth,
  cardHeight,
}: {
  parentRef: React.RefObject<HTMLDivElement | null>,
  items: typeof ITEMS,
  radius: number,
  itemHeight: number,
  cardWidth: number,
  cardHeight: number
}) {
  const itemCount = items.length;
  const [activeIndex, setActiveIndex] = useState(0);

  const ROTATION_PER_ITEM = Math.PI / 3;

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Create a proxy object to tween
      const proxy = { idx: 0 };

      gsap.to(proxy, {
        idx: itemCount - 1,
        ease: "none",
        scrollTrigger: {
          trigger: parentRef.current,
          start: "top top",
          end: "+=300%", // Adjust scroll distance as needed
          pin: true,
          scrub: 1,
          onUpdate: (self) => {
            // Update the index based on scroll progress
            // We can map progress 0-1 to index 0-(itemCount-1)
            const newIndex = self.progress * (itemCount - 1);
            setActiveIndex(newIndex);
          },
        },
      });
    }, parentRef); // Scope to parent

    return () => ctx.revert();
  }, [itemCount, parentRef]);

  // Determine current active item for Bio Display
  const currentSafeIndex = Math.max(0, Math.min(Math.round(activeIndex), itemCount - 1));
  const currentItem = items[currentSafeIndex];

  // --- RENDER CALCULATION ---
  const renderedItems = items.map((itemData, i) => {
    const offset = i - activeIndex;

    const y = offset * itemHeight;
    const angle = offset * ROTATION_PER_ITEM;

    const x = radius * Math.sin(angle);
    const z = radius * Math.cos(angle);

    const zDepth = Math.cos(angle);

    // Fade out items that spiral too far away visually
    const distOpacity = 1 - Math.min(1, Math.abs(offset) / 3.5);
    const depthOpacity = 0.3 + (0.7 * (zDepth + 1) / 2);
    const opacity = distOpacity * depthOpacity;

    const scale = 0.7 + (0.3 * (zDepth + 1) / 2);
    const zIndex = Math.floor((zDepth + 2) * 100);

    return {
      ...itemData,
      key: `item-${i}`,
      realId: itemData.id,
      x,
      y,
      scale,
      opacity,
      zIndex,
      virtualIndex: i,
    };
  });

  renderedItems.sort((a, b) => a.zIndex - b.zIndex);

  return (
    <div
      className="relative w-full h-full flex items-center justify-center touch-none select-none"
    >
      {/* CENTRAL PILLAR - MINIMALIST */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80px] h-[150vh] pointer-events-none"
        style={{ zIndex: 195 }}
      >
        {/* Sleek Matte Pillar */}
        <div className="w-full h-full bg-[#111] relative">
          {/* Red Laser Line */}
          <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-[2px] bg-[#eb0028]" />
          {/* Subtle Gradient for Cylinder effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-transparent to-black/80" />
        </div>
      </div>

      {/* ITEMS */}
      {renderedItems.map((item) => (
        <CarouselItem
          key={item.key}
          data={item}
          width={cardWidth}
          height={cardHeight}
        />
      ))}

      {/* BIO PANEL - MINIMALIST */}
      <div className="absolute bottom-12 left-8 md:left-12 max-w-sm z-[600] pointer-events-none">
        {/* Animated content key change */}
        <div key={currentItem.id} className="animate-in fade-in slide-in-from-bottom-2 duration-500">

          <h2 className="text-4xl font-medium text-[#EB0028] mb-2 uppercase font-clash leading-none tracking-tight">
            {currentItem.title}
          </h2>

          <p className="text-sm text-gray-400 font-sans leading-relaxed max-w-xs">
            {currentItem.bio}
          </p>

        </div>
      </div>

    </div>
  );
}

/**
 * INDIVIDUAL CARD COMPONENT - MINIMALIST
 */
function CarouselItem({ data, width, height }: {
  data: any,
  width: number,
  height: number,
}) {
  if (data.opacity < 0.05) return null;

  return (
    <div
      className="absolute top-1/2 left-1/2 will-change-transform"
      style={{
        width: width,
        height: height,
        zIndex: data.zIndex,
        opacity: data.opacity,
        transform: `
          translate(-50%, -50%)
          translate3d(${data.x}px, ${data.y}px, 0)
          scale(${data.scale})
        `,
        filter: data.scale < 0.8 ? 'grayscale(1) brightness(0.4)' : 'grayscale(1)',
        transition: 'filter 0.3s ease-out',
      }}
    >
      {/* MINIMAL CARD */}
      <div className="relative w-full h-full bg-[#050505] group cursor-pointer overflow-hidden">

        {/* IMAGE */}
        <div className="relative h-full w-full">
          <img
            src={data.image}
            alt={data.title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            draggable={false}
          />
          {/* Active state color restore on hover */}
          <div className="absolute inset-0 bg-[#eb0028] mix-blend-overlay opacity-0 group-hover:opacity-40 transition-opacity duration-300" />

          {/* Dark gradient at bottom for text readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-90" />
        </div>

      </div>
    </div>
  );
}
