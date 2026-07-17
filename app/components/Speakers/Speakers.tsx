"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Image from "next/image";
import { motion, AnimatePresence, PanInfo, Variants } from "framer-motion";
import gsap from "gsap";
import { Draggable } from "gsap/dist/Draggable";
gsap.registerPlugin(Draggable);
import SpeakersMarquee from "./SpeakersMarquee";
import { ChevronLeft, ChevronRight, ChevronUp } from "lucide-react";
import { useTheme } from "../ThemeContext";

type Speaker = {
  name: string;
  title: string;
  description: string;
  img: string;
};

const speakers: Speaker[] = [
  {
    name: "Hospitality Leader",
    title: "Hospitality Business Leader & Entrepreneur",
    description: "A hospitality business leader with over a decade of experience in building, operating, and scaling premium restaurant and dining brands. Driven by empathy and purpose, he shares how seemingly ordinary people and moments in our lives profoundly shape who we become.",
    img: "/speakers/hospitality-leader.jpg",
  },
  {
    name: "Dr. Saheer Nelliparamban",
    title: "Founder & CEO, Paywint | Forbes Council Member",
    description: "Doctor, entrepreneur, Founder and CEO of Paywint, Fichecks, and Gasdeck, and a member of the Forbes Business Council. His journey spans healthcare, technology, fintech innovation, and entrepreneurship, offering valuable insights on leadership, resilience, and creating impact.",
    img: "/speakers/dr-saheer-nelliparamban.jpg",
  },
  {
    name: "Fazlur Rahman Khan",
    title: "Technical Trainer, Linux Foundation | Kubestronaut",
    description: "Technical Trainer at The Linux Foundation with 20+ years of experience across enterprise database architecture, cloud-native infrastructure, and technical education. India's first Technical Trainer, Course Maintainer, Author, and Kubestronaut holding all five active CNCF Kubernetes certifications.",
    img: "/speakers/fazlur-rahman-khan.jpg",
  },
  {
    name: "Dr. Ghazala Ahmed Shafi",
    title: "Chief Dental Surgeon | Laser Specialist of the Year",
    description: "Head and Chief Dental Surgeon at Dr. Ghazala’s Dental, Implant and Laser Centre with 17+ years of clinical and academic expertise. MDS in Periodontology, Laser Specialist of the Year 2022, and Top 100 Doctors in Doctors’ Choice Awards 2019, pioneering phototherapy in patient care.",
    img: "/speakers/dr-ghazala-ahmed-shafi.jpg",
  },
  {
    name: "Neole Anna Cornelio",
    title: "International Sprinter | Gold Medalist & Record Holder",
    description: "International sprinter who has represented India in the 4×100m relay at the Asian U20, World Athletics U20, and South Asian Junior Athletics Championships (gold medalist & national record holder). HYROX Women's Relay medalist and WWE tryout qualifier, dedicated to inspiring young athletes.",
    img: "/speakers/neole-anna-cornelio.jpg",
  },
  {
    name: "Sanjay R",
    title: "Community Manager, Google for Developers",
    description: "Community builder, entrepreneur, and youth leader. MBA in Marketing with 5+ years in community growth. Serves as Community Manager at Google for Developers and Youngest District Rotaract Representative of Rotary International District 3192 (2026-27), having inspired 5,000+ young professionals.",
    img: "/speakers/sanjay-r.jpg",
  },
  {
    name: "Shweta Vohra",
    title: "Architecture Leader, Booking.com | Author & Inventor",
    description: "Technology leader, author, inventor, and speaker with 24+ years of experience building cloud, platform, and AI systems across global enterprises. Architecture leader at Booking.com and author of Decoding Platform Engineering Patterns and Dear Software and AI Architect.",
    img: "/speakers/shweta-vohra.jpg",
  },
];

// Helper to wrap page index
const wrap = (min: number, max: number, v: number): number => {
  const range = max - min;
  return ((((v - min) % range) + range) % range) + min;
};

// Slide animation variants for horizontal carousel
const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 300 : -300,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
    transition: { duration: 0.4, ease: [0.25, 0.1, 0.25, 1] as const },
  },
  exit: (direction: number) => ({
    x: direction < 0 ? 300 : -300,
    opacity: 0,
    transition: { duration: 0.3, ease: [0.55, 0.05, 0.55, 0.95] as const },
  }),
};

const swipeConfidenceThreshold = 10000;
const swipePower = (offset: number, velocity: number): number => Math.abs(offset) * velocity;

const SpeakerFlipCard = ({
  speaker,
  className = "",
  onFlip,
}: {
  speaker: Speaker;
  className?: string;
  onFlip?: (isOpen: boolean) => void;
}) => {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [isFlipped, setIsFlipped] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  const handleFlip = () => {
    if (!isAnimating) {
      const newFlipState = !isFlipped;
      setIsFlipped(newFlipState);
      setIsAnimating(true);
      onFlip?.(newFlipState);
    }
  };

  return (
    <div
      className={`cursor-pointer perspective-1000 group mx-auto ${className}`}
      onClick={handleFlip}
    >
      <motion.div
        initial={false}
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.6, ease: "easeInOut" }}
        onAnimationComplete={() => setIsAnimating(false)}
        className="relative w-full h-full shadow-2xl"
        style={{ transformStyle: "preserve-3d" }}
      >
        {/* FRONT FACE */}
        <div
          className={`absolute inset-0 backface-hidden flex flex-col gap-3 p-4 ${isDark ? "bg-black border-white/20" : "bg-white border-black/10"} border border-t-4 border-t-[#E62B1E] overflow-hidden`}
          style={{ backfaceVisibility: "hidden" }}
        >
          {/* Image Container */}
          <div className="w-full relative flex-1 overflow-hidden">
            <Image
              src={speaker.img}
              alt={speaker.name}
              fill
              className="object-cover "
            />
            <div className="absolute inset-0 bg-[#E62B1E] mix-blend-multiply opacity-0 transition-opacity duration-300" />
          </div>

          {/* Content */}
          <div className="flex flex-col justify-end relative shrink-0 min-h-[60px]">
            <div className="absolute top-0 right-0 w-8 h-[1px] bg-[#E62B1E]" />

            <h3
              className="text-[#E62B1E] font-medium text-lg tracking-[0.05em] leading-tight mb-1"
              style={{ fontFamily: "'Clash Display', sans-serif" }}
            >
              {speaker.name}
            </h3>
            <p
              className={`${isDark ? "text-white" : "text-black"} text-xs tracking-[0.08em] uppercase opacity-80`}
              style={{ fontFamily: "'Clash Display', sans-serif" }}
            >
              {speaker.title}
            </p>
          </div>
        </div>

        {/* BACK FACE */}
        <div
          className={`absolute inset-0 backface-hidden flex flex-col justify-center items-center p-6 ${isDark ? "bg-black border-white/20" : "bg-white border-black/10"} border border-t-4 border-t-[#E62B1E] overflow-hidden`}
          style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
        >
          <div className="absolute top-4 right-4 w-8 h-[1px] bg-[#E62B1E]" />

          <h3
            className="text-[#E62B1E] font-medium text-xl tracking-[0.05em] leading-tight mb-4 text-center"
            style={{ fontFamily: "'Clash Display', sans-serif" }}
          >
            About
          </h3>

          <div className={`w-full h-px ${isDark ? "bg-white/20" : "bg-black/10"} mb-4`} />

          <p
            className={`${isDark ? "text-gray-400" : "text-gray-600"} text-xs leading-relaxed tracking-[0.04em] text-center overflow-y-auto max-h-full scrollbar-hide`}
            style={{ fontFamily: "'Clash Display', sans-serif" }}
          >
            {speaker.description}
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default function Newspeakers({
  startAnimation = false,
}: {
  startAnimation?: boolean;
}) {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [openIndices, setOpenIndices] = useState<number[]>([]);
  const cardRefs = useRef<HTMLDivElement[]>([]);
  const spotlightRef = useRef<HTMLDivElement>(null);
  const bg25Ref = useRef<HTMLDivElement>(null);
  const bg25MaskRef = useRef<HTMLDivElement>(null);
  const voicesRef = useRef<HTMLHeadingElement>(null);
  const speakersHeaderRef = useRef<HTMLDivElement>(null);
  const lineRef = useRef<HTMLDivElement | null>(null);
  const cardsContainerRef = useRef<HTMLDivElement>(null);
  const marqueeRef = useRef<HTMLDivElement>(null);
  const startIndex = useRef(0);
  const lastStartIndex = useRef(0);
  const isManual = useRef(false);
  const isAnimating = useRef(false);
  const [screenType, setScreenType] = useState<"mobile" | "tablet" | "desktop">("desktop");
  const [centerIndex, setCenterIndex] = useState(2);

  // Mobile Carousel State
  const [[page, direction], setPage] = useState<[number, number]>([0, 0]);

  const speakerIndex = wrap(0, speakers.length, page);

  const paginate = useCallback((newDirection: number) => {
    setPage(([prevPage]) => [prevPage + newDirection, newDirection]);
  }, []);

  const handleDragEnd = useCallback(
    (_e: MouseEvent | TouchEvent | PointerEvent, { offset, velocity }: PanInfo) => {
      const swipe = swipePower(offset.x, velocity.x);
      if (swipe < -swipeConfidenceThreshold) {
        paginate(1);
      } else if (swipe > swipeConfidenceThreshold) {
        paginate(-1);
      }
    },
    [paginate]
  );

  useEffect(() => {
    gsap.set(bg25MaskRef.current, {
      clipPath: "inset(0 0 100% 0)",
    });

    gsap.set(voicesRef.current, {
      position: "absolute",
      top: "30%",
      left: "50%",
      xPercent: -50,
      yPercent: -30,
      scale: window.innerWidth < 640 ? 1 : 1.5,
      opacity: 1,
      clipPath: "polygon(50% 0, 50% 0, 50% 100%, 50% 100%)",
    });
  }, []);

  useEffect(() => {
    if (!startAnimation) return;

    const tl = gsap.timeline();

    // Stage 2 — spotlight + bg '26
    tl.fromTo(
      spotlightRef.current,
      {
        clipPath: "polygon(0 0, 100% 0, 100% 0, 0 0)",
      },
      {
        clipPath: "polygon(0 0, 100% 0, 100% 100%, 0 100%)",
        duration: 1,
        ease: "power1.out",
      }
    ).to(
      bg25MaskRef.current,
      {
        clipPath: "inset(0 0 0% 0)",
        duration: 1,
        ease: "power3.out",
      },
      "<"
    );

    // Stage 3 — Echoes of '26
    tl.to(voicesRef.current, {
      clipPath: "polygon(0% 0, 100% 0, 100% 100%, 0% 100%)",
      duration: 0.8,
      ease: "power3.out",
    });

    // Stage 4 — spotlight + bg fade out
    tl.to([spotlightRef.current, bg25Ref.current], {
      opacity: 0,
      duration: 0.5,
      ease: "power2.in",
    });

    // Stage 5 — Voices moves to final position
    tl.to(voicesRef.current, {
      top: "5%",
      yPercent: 0,
      scale: 0.8,
      duration: 1,
      ease: "power3.inOut",
    });

    // Stage 6 — Speakers header
    tl.to(speakersHeaderRef.current, {
      opacity: 1,
      duration: 0.5,
      ease: "power3.out",
    });

    tl.to(
      lineRef.current,
      {
        opacity: 1,
        duration: 0.5,
        ease: "power3.out",
      },
      "<"
    );

    // Stage 7 — Cards
    tl.to([cardsContainerRef.current, marqueeRef.current], {
      opacity: 1,
      duration: 0.5,
    });
  }, [startAnimation]);

  const getScreenType = () => {
    const w = window.innerWidth;
    if (w < 640) return "mobile";
    if (w < 1024) return "tablet";
    return "desktop";
  };

  const layoutCards = (): gsap.core.Tween | null => {
    const screen = getScreenType();

    // Only layout for non-mobile
    if (screen === 'mobile') return null;

    const containerWidth =
      cardsContainerRef.current?.offsetWidth || window.innerWidth;
    const total = speakers.length;
    const center = 2;
    let lastTween: gsap.core.Tween | null = null;
    const animate = (card: HTMLDivElement, vars: gsap.TweenVars) => {
      lastTween = gsap.to(card, vars);
    };

    // Configuration based on screen type
    const isTablet = screen === "tablet";
    const config = isTablet
      ? {
        width: Math.min(containerWidth * 0.45, 240),
        gap: 20,
        baseY: 10,
        visibleRange: 2,
        yOffsetBase: 28,
        yOffsetCenter: 18,
        duration: 3.2,
      }
      : {
        width: Math.min(containerWidth * 0.42, 260),
        gap: 40,
        baseY: 20,
        visibleRange: 2,
        yOffsetBase: 40,
        yOffsetCenter: 25,
        duration: 6,
      };

    // Detect wrap direction
    const diff = startIndex.current - lastStartIndex.current;
    const isNext = diff === 1 || diff === -(total - 1);
    const isPrev = diff === -1 || diff === (total - 1);

    // Create a main timing tween to return. This decouples the "global" completion
    // from individual card tweens, allowing us to use onComplete on cards safely.
    // Use a dummy object to animate so we don't affect DOM.
    const mainDuration = isManual.current ? 0.7 : config.duration;
    let mainTween = gsap.to({}, { duration: mainDuration });

    cardRefs.current.forEach((card, i) => {
      if (!card) return;

      let offset = i - center - startIndex.current;
      offset = ((offset % total) + total) % total;
      if (offset > total / 2) offset -= total;

      // Conditional rotation: 6 for first card, 4 for others
      const rotFactor = Math.abs(offset) <= 1 ? 5.5 : 4.8;
      const rotation = offset * rotFactor;

      let targetX = offset * (config.width + config.gap);
      let targetY = config.baseY + Math.abs(offset) * config.yOffsetBase + (offset === 0 ? config.yOffsetCenter : 0);
      let targetRot = rotation;
      let targetOpacity = Math.abs(offset) > config.visibleRange ? 0 : 1;

      // Standard Animation Vars
      const vars: gsap.TweenVars = {
        x: targetX,
        y: targetY,
        rotation: targetRot,
        opacity: targetOpacity,
        immediateRender: false,
        duration: mainDuration,
        ease: "linear",
        overwrite: "auto",
        zIndex: Math.abs(offset) === 0 ? 50 : 10,
      };

      // Wrap-around fix: Prevent flying across screen
      if (isNext && offset === 3) {
        // Moving Left: Card wraps from -2 to 3. 
        // 1. Force it to animate to virtual -3 (Hidden Left) instead of flying Right.
        const virtualOffset = -3;
        vars.x = virtualOffset * (config.width + config.gap);
        vars.y = config.baseY + Math.abs(virtualOffset) * config.yOffsetBase;
        vars.rotation = virtualOffset * 4.8;
        vars.opacity = 0;

        // 2. AFTER it fades out at -3, silently move it to +3 (Hidden Right)
        // so it's ready to enter from the Right on the next step.
        vars.onComplete = () => {
          const resetOffset = 3;
          gsap.set(card, {
            x: resetOffset * (config.width + config.gap),
            y: config.baseY + Math.abs(resetOffset) * config.yOffsetBase,
            rotation: resetOffset * 4.8,
            opacity: 0
          });
        };
      }

      if (isPrev && offset === -2) {
        // Moving Right: Card wraps from 3 to -2. 
        // Snap it to virtual -3 (Hidden Left) BEFORE animating to -2.
        const virtualOffset = -3;
        gsap.set(card, {
          x: virtualOffset * (config.width + config.gap),
          y: config.baseY + Math.abs(virtualOffset) * config.yOffsetBase,
          rotation: virtualOffset * 4.8,
          opacity: 0,
        });
      }

      animate(card, vars);
    });

    lastStartIndex.current = startIndex.current;

    return mainTween;
  };

  useEffect(() => {
    const update = () => {
      const type = getScreenType();
      setScreenType(type);
      if (type !== 'mobile') layoutCards();
    };

    update();
    window.addEventListener("resize", update);

    return () => window.removeEventListener("resize", update);
  }, []);

  useEffect(() => {
    if (screenType !== 'mobile') {
      layoutCards();
    }
  }, [screenType]);

  const handleNext = () => {
    if (isAnimating.current) return;
    isAnimating.current = true;
    isManual.current = true;
    gsap.killTweensOf(cardRefs.current);

    setCenterIndex((prev) => (prev + 1) % speakers.length);
    startIndex.current = (startIndex.current + 1) % speakers.length;

    const tween = layoutCards();
    tween?.eventCallback("onComplete", () => {
      isManual.current = false;
      isAnimating.current = false;
    });
  };

  const handlePrev = () => {
    if (isAnimating.current) return;
    isAnimating.current = true;
    isManual.current = true;
    gsap.killTweensOf(cardRefs.current);

    setCenterIndex((prev) => (prev - 1 + speakers.length) % speakers.length);
    startIndex.current = (startIndex.current - 1 + speakers.length) % speakers.length;

    const tween = layoutCards();
    tween?.eventCallback("onComplete", () => {
      isManual.current = false;
      isAnimating.current = false;
    });
  };

  const handleDesktopDotClick = (index: number) => {
    if (isAnimating.current || index === centerIndex) return;
    isAnimating.current = true;
    isManual.current = true;
    gsap.killTweensOf(cardRefs.current);

    setCenterIndex(index);

    // Calculate required startIndex to center the clicked index
    // i - center - startIndex = 0 => startIndex = i - center
    // We used center = 2 in layoutCards
    let newStart = index - 2;
    newStart = (newStart % speakers.length + speakers.length) % speakers.length;
    startIndex.current = newStart;

    const tween = layoutCards();
    tween?.eventCallback("onComplete", () => {
      isManual.current = false;
      isAnimating.current = false;
    });
  };

  // Auto scroll for desktop/tablet only
  useEffect(() => {
    let auto: gsap.core.Timeline | null = null;

    if (openIndices.length === 0 && screenType !== "mobile") {
      auto = gsap.timeline({ repeat: -1 });

      auto.to(
        {},
        {
          duration: 6,
          onComplete: handleNext,
        }
      );
    }

    return () => {
      auto?.kill();
    };
  }, [openIndices, screenType]);

  const handleCardFlip = (index: number, isOpen: boolean) => {
    setOpenIndices((prev) => {
      if (isOpen) {
        return [...prev, index];
      } else {
        return prev.filter((i) => i !== index);
      }
    });
  };

  return (
    <section
      id="speakers"
      className={`relative ${isDark ? "bg-black text-white" : "bg-white text-black"} isolate md:min-h-screen flex flex-col pt-10 overflow-hidden`}
    >
      <div className="md:flex-1">
        <div className="relative overflow-x-visible overflow-y-hidden">
          {/* Spotlight */}
          <div className="absolute inset-0 -z-10 overflow-hidden">
            <div
              ref={spotlightRef}
              className="pointer-events-none absolute inset-0 flex justify-center"
              style={{
                clipPath: "polygon(0 0, 100% 0, 100% 0, 0 0)",
              }}
            >
              <div className="relative w-[45rem] h-[15rem]">
                <svg
                  width="1500"
                  height="500"
                  viewBox="0 0 1000 500"
                  className="absolute left-1/2 -translate-x-1/2 origin-top scale-[0.3] sm:scale-[0.45] md:scale-50"
                >
                  <defs>
                    <linearGradient id="spotGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop
                        offset="0%"
                        stopColor="#EB0028"
                        stopOpacity="0.85"
                      />
                      <stop
                        offset="70%"
                        stopColor="#EB0028"
                        stopOpacity="0.15"
                      />
                      <stop offset="100%" stopColor="#EB0028" stopOpacity="0" />
                    </linearGradient>

                    <clipPath id="spotClip">
                      <polygon points="200,0 800,0 1150,520 -150,520" />
                    </clipPath>

                    <filter
                      id="softEdges"
                      x="-30%"
                      y="-30%"
                      width="160%"
                      height="160%"
                    >
                      <feGaussianBlur
                        stdDeviation={
                          screenType === "mobile"
                            ? 55
                            : screenType === "tablet"
                              ? 35
                              : 18
                        }
                      />
                    </filter>
                  </defs>

                  <polygon
                    points="200,0 800,0 1150,520 -150,520"
                    fill="url(#spotGrad)"
                    style={{ filter: "blur(18px)" }}
                    className="pointer-events-none"
                  />
                </svg>
              </div>
            </div>

            {/* Background '26 */}
            <div
              ref={bg25Ref}
              className="pointer-events-none absolute inset-x-0 top-0 bottom-0 flex justify-center"
            >
              <div
                ref={bg25MaskRef}
                className={`absolute top-12 lg:top-8 flex whitespace-nowrap sm:gap-8 lg:gap-12 text-5xl sm:text-7xl md:text-9xl lg:text-9xl font-orbitron font-black ${isDark ? "text-white/5" : "text-black/5"} tracking-widest overflow-hidden`}
              >
                {Array.from({ length: 10 }).map((_, i) => (
                  <span key={i}>’26</span>
                ))}
              </div>
            </div>
          </div>
          {/* Grain Overlay — ABOVE spotlight */}
          <div className="pointer-events-none absolute inset-0 z-10 flex justify-center overflow-x-hidden">
            <div
              className="relative w-[45rem] h-[15rem] opacity-50 mix-blend-overlay"
              style={{
                maskImage:
                  "polygon(200px 0px, 800px 0px, 1150px 520px, -150px 520px)",
                WebkitMaskImage:
                  "polygon(200px 0px, 800px 0px, 1150px 520px, -150px 520px)",
              }}
            >
              <Image
                src="/Texture.svg"
                alt=""
                fill
                priority
                className="absolute inset-0 w-full h-full object-cover scale-[1.8]"
              />
            </div>
          </div>

          {/* Heading */}
          <div className="flex flex-col">
            <h1
              ref={voicesRef}
              className="absolute z-30 whitespace-nowrap text-4xl sm:text-4xl md:text-5xl lg:text-6xl font-semibold opacity-0 will-change-transform font-orbitron"
            >
              Echoes of <span className="text-[#EB0028]">’26</span>
            </h1>

            <div className="relative z-10 mt-28 lg:mt-32">
              <div className="flex flex-col gap-4 md:gap-2 lg:gap-2 px-[5%] ">
                <div
                  ref={speakersHeaderRef}
                  className="flex items-center justify-between gap-6 opacity-0 mt-0 "
                >
                  <h2 className="uppercase text-sm sm:text-base md:text-lg font-[600] font-clash">
                    Speakers.2026
                  </h2>

                  {/* Header Controls (Nav Buttons) */}
                  <div className="flex gap-4">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => {
                        if (screenType === 'mobile') {
                          paginate(-1);
                        } else {
                          handlePrev();
                        }
                      }}
                      className="w-9 h-9 sm:w-10 sm:h-10 bg-[#EB0028] flex items-center justify-center hover:bg-[#B71C1C] transition-colors duration-300 rounded-sm"
                      aria-label="Previous speakers"
                    >
                      <ChevronLeft className="w-3.5 h-3.5 sm:w-5 sm:h-5 md:w-6 md:h-6 text-white" />
                    </motion.button>

                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => {
                        if (screenType === 'mobile') {
                          paginate(1);
                        } else {
                          handleNext();
                        }
                      }}
                      className="w-9 h-9 sm:w-10 sm:h-10 bg-[#EB0028] flex items-center justify-center hover:bg-[#B71C1C] transition-colors duration-300 rounded-sm"
                      aria-label="Next speakers"
                    >
                      <ChevronRight className="w-3.5 h-3.5 sm:w-5 sm:h-5 md:w-6 md:h-6 text-white" />
                    </motion.button>
                  </div>
                </div>

                <div ref={lineRef} className={`h-px ${isDark ? "bg-white/30" : "bg-black/10"} opacity-0`} />
              </div>
            </div>
          </div>

          {/* Cards Area */}
          <div
            ref={cardsContainerRef}
            className={`relative flex items-center justify-center overflow-hidden opacity-0 mt-12 md:mt-5 transition-all duration-300 z-20
              ${screenType === 'mobile' ? 'h-[440px]' : 'h-[25rem] md:h-[31.25rem]'}
            `}
          >
            {screenType === 'mobile' ? (
              // MOBILE VIEW: Framer Motion Carousel
              <div className="w-full h-full flex flex-col items-center justify-center px-4">
                <div className="relative w-full flex-1 flex items-center justify-center">
                  <AnimatePresence initial={false} custom={direction} mode="wait">
                    <motion.div
                      key={page}
                      custom={direction}
                      variants={slideVariants}
                      initial="enter"
                      animate="center"
                      exit="exit"
                      drag="x"
                      dragConstraints={{ left: 0, right: 0 }}
                      dragElastic={0.2}
                      onDragEnd={handleDragEnd}
                      className="absolute w-full flex justify-center cursor-grab active:cursor-grabbing"
                    >
                      <SpeakerFlipCard speaker={speakers[speakerIndex]} className="w-full h-[400px] max-w-[240px]" />
                    </motion.div>
                  </AnimatePresence>
                </div>

                {/* Pagination Dots */}
                <div className="flex justify-center pt-4 gap-2 flex-shrink-0 z-10">
                  {speakers.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setPage([index, index > speakerIndex ? 1 : -1])}
                      className={`h-1.5 rounded-full transition-all duration-300 ${index === speakerIndex
                        ? "bg-[#E62B1E] w-8"
                        : `${isDark ? "bg-white/20 hover:bg-white/40" : "bg-black/10 hover:bg-black/20"} w-4`
                        }`}
                      aria-label={`Go to speaker ${index + 1}`}
                    />
                  ))}
                </div>
              </div>
            ) : (
              // DESKTOP/TABLET VIEW: GSAP 3D Carousel
              <>
                {speakers.map((sp, i) => {
                  const isOpen = openIndices.includes(i);

                  return (
                    <div
                      ref={(el) => {
                        if (el) cardRefs.current[i] = el;
                      }}
                      key={sp.name + i}
                      className={`absolute top-[2%] w-[16rem] sm:w-[15rem] md:w-[14rem] lg:w-[16rem] h-[28rem] md:h-[22rem] lg:h-[24rem] shadow-2xl overflow-visible will-change-transform z-10 perspective-1000`}
                    >
                      <SpeakerFlipCard
                        speaker={sp}
                        className="h-full"
                        onFlip={(isOpen) => handleCardFlip(i, isOpen)}
                      />
                    </div>
                  );
                })}

                {/* Desktop Pagination Dots */}
                <div className="absolute bottom-0 left-0 right-0 flex justify-center pb-4 z-50 transition-opacity duration-500 opacity-100">
                  <div className="flex gap-2">
                    {speakers.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => handleDesktopDotClick(index)}
                        className={`h-1.5 rounded-full transition-all duration-300 ${index === centerIndex
                          ? "bg-[#E62B1E] w-8"
                          : `${isDark ? "bg-white/20 hover:bg-white/40" : "bg-black/10 hover:bg-black/20"} w-4`
                          }`}
                        aria-label={`Go to speaker ${index + 1}`}
                      />
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div >
      <div ref={marqueeRef} className="relative opacity-0 mt-8 md:mt-10">
        <SpeakersMarquee />
      </div>
    </section >
  );
}