"use client";

import React, { useState, useRef, useCallback, useEffect } from "react";
import { useTheme } from "./ThemeContext";
import Image from "next/image";
import {
  motion,
  useScroll,
  useTransform,
  AnimatePresence,
  PanInfo,
} from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";

// Types
interface Speaker {
  id: number;
  name: string;
  title: string;
  description: string;
  image: string;
}

interface SpeakerCardProps {
  speaker: Speaker;
}

interface EchoesHeroProps {
  startAnimation?: boolean;
}

// Helper to wrap page index
const wrap = (min: number, max: number, v: number): number => {
  const range = max - min;
  return ((((v - min) % range) + range) % range) + min;
};

// Slide animation variants for horizontal carousel
const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 800 : -800,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
    transition: { duration: 0.4, ease: [0.25, 0.1, 0.25, 1] as const },
  },
  exit: (direction: number) => ({
    x: direction < 0 ? 800 : -800,
    opacity: 0,
    position: "absolute",
    top: 0,
    width: "100%",
    transition: { duration: 0.3, ease: [0.55, 0.05, 0.55, 0.95] as const },
  }),
};

// Swipe threshold for drag gestures
const swipeConfidenceThreshold = 10000;
const swipePower = (offset: number, velocity: number): number =>
  Math.abs(offset) * velocity;

// Mock speaker data
const speakers: Speaker[] = [
  {
    id: 1,
    name: "Pramodh Chandrashekar",
    title: "Founder of Coincontra",
    description: "Pramodh Chandrashekar is a changemaker on a mission. He founded the Last Ripple Foundation, India's first initiative to create special biodegradable urns that turn ashes into living memory trees. His foundation also provides 24/7 pet funeral services, helping families say goodbye with dignity. As the Founder & CEO of COINCONTRA, he's making personal finance easy and accessible for everyone. A serial entrepreneur, lawyer, and author, Pramodh has delivered 100+ speeches, written books, and spoken at two TEDx events—all to create a lasting impact on people's lives.",
    image: "/speakers/Pramodh.png",
  },
  {
    id: 2,
    name: "Karen Vincent",
    title: "Standup Comedian | Entertainer | Influencer",
    description: "Making the world a happier place one joke at a time, with content that resonates with audiences of all ages, Karen found her passion and love for the stage one day and never went back to being mediocre.",
    image: "/speakers/Karen.png",
  },
  {
    id: 3,
    name: "Jonathan Thomas Jai",
    title: "Journalist | Writer",
    description: "Jonathan Thomas Jai is a Bangalore-based writer and researcher specializing in international relations, public policy, philosophy, and psychology. His work merges political analysis with philosophical inquiry, exploring governance, power, and the psychology behind leadership. A student of International Relations, Peace and Public Policy at St Joseph's University, he currently writes for OneIndia, Dailyhunt, and Mathrubhumi English, covering global politics and policy. As a Research Analyst for MP K. Sudhakaran, he contributes to policy formulation and legislative discussions, gaining firsthand experience in governance.",
    image: "/speakers/jonathan james.png",
  },
  {
    id: 4,
    name: "Rida Khan",
    title: "Content Creator",
    description: "Rida Khan is a content creator who specializes in entertainment and relatable content. With her witty humor and down-to-earth style, she captivates her audience by sharing everyday situations in a fun and engaging way. From comedic skits to relatable commentary on daily life, Rida's content resonates with young adults who appreciate her authenticity and playful personality.",
    image: "/speakers/Rida Khan.png",
  },
  {
    id: 5,
    name: "Prahalad Kulkarni",
    title: "Former Indian Air Force Veteran",
    description: "He began his journey in the Indian Air Force, instilling discipline and dedication before transitioning to the Karnataka Police as a Sub-Inspector. Balancing duty and ambition, he prepared for the KPSC KAS exams, eventually becoming an Assistant Commissioner of Commercial Taxes. His journey from an Aircraftman Under Trainee to a civil servant showcases perseverance and resilience. Through real-life experiences and humor, he inspires others to overcome challenges and explore careers in defense and government services.",
    image: "/speakers/Pralhad Kulkarni.png",
  },
  {
    id: 6,
    name: "Tezashwani Tomar",
    title: "Senior Brand Manager",
    description: "Tezashwani Tomar is a dynamic Senior Brand Manager at Indian Design Media Network, shaping the future of digital storytelling. With six years of expertise in social media, brand management, and content creation, she has collaborated with leading MNCs like Flipkart and FashionTV, along with various other brands. A history major, she brings a unique blend of analytical depth and creative strategy, using the past to inform bold, forward-thinking digital narratives.",
    image: "/speakers/Tezashwani Tomar.png",
  },
  {
    id: 7,
    name: "Prof. Ar. Vasanth K. Bhat",
    title: "Director of Impact School of Architecture",
    description: "B.Arch from Bangalore University and Masters in Industrial Planning from the University of Stuttgart Germany. Architect-Vasthu Consultant with over 40 years of experience. Since the last 40 years engaged in the practice of Architecture using Vasthu shastra as a guiding parameter. Has designed a wide variety of residential, institutional and industrial projects all over India and abroad. Retired as Principal/Dean of Acharya School of Architecture & later RNS School of Architecture after a successful tenure of 16 years. Presented many papers in national and international conferences.",
    image: "/speakers/Ar.Vasanth png.png",
  },
  {
    id: 8,
    name: "Dr. Bharat Bylappa",
    title: "Founder of Bharat Groups",
    description: "Dr. Bharat is an Indian entrepreneur who started his business journey from a 1BHK house, renting a computer — and today leads a BSE-listed company. He is the founder of BHHS Technologies Limited, Tranway21 Technologies Limited, Bharat Farms, and Board25. Under BHHS Technologies, he has built two renowned brands: Bharat Headhunters and Diversity Headhunters. Bharat has a business presence in India, South Africa, Malaysia, and the UAE. He is currently developing an AI-based career tool called Confidential Hiring, set to launch this financial year.",
    image: "/speakers/Dr.Bharath.png",
  },
  {
    id: 9,
    name: "Dr. Alice Abraham",
    title: "Entrepreneur",
    description: "Dr. Alice Abraham, the President of the IMPACT Group of Institutions, a 40 year old group of colleges in the North of Bengaluru, has extensive experience in Education Management. She has a Bachelors and Masters in Electrical Engineering from UVCE Bangalore and a Doctorate in Computer Networks from Bangalore University. She has also completed her MBA from IIM Bangalore, where she was the first woman President of the Student Council of her program. Dr. Abraham is actively engaged in supporting under-privileged students pursuing professional education through UVCE Foundation.",
    image: "/speakers/Dr.Alice Abraham.png",
  },
];

// Speaker Card Component
const SpeakerCard: React.FC<SpeakerCardProps> = ({ speaker }) => {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  return (
    <div className={`flex gap-2 sm:gap-4 p-2 sm:p-4 border ${isDark ? "border-white/20" : "border-black/10"} overflow-hidden group hover:border-[#E62B1E] transition-colors duration-300 min-h-[200px] sm:min-h-[160px] ${isDark ? "bg-black" : "bg-gray-100"}`}>
      {/* Image */}
      <div className="relative w-[100px] sm:w-[120px] shrink-0 overflow-hidden min-h-full">
        <img
          src={speaker.image}
          alt={speaker.name}
          className="absolute inset-0 w-full h-full object-cover"
        />
      </div>
      {/* Content */}
      <div className="flex-1 py-1 sm:py-2 flex flex-col justify-start relative">
        {/* Decorative Corner Line */}
        <div className="absolute top-0 right-0 w-6 sm:w-8 h-[1px] bg-[#E62B1E]" />

        <h3
          className="text-[#E62B1E] font-medium text-base sm:text-base md:text-lg lg:text-xl tracking-[0.05em] leading-tight mb-1"
          style={{ fontFamily: "'Clash Display', sans-serif" }}
        >
          {speaker.name}
        </h3>
        <p
          className={`${isDark ? "text-white" : "text-black"} text-xs sm:text-sm tracking-[0.08em] uppercase opacity-80`}
          style={{ fontFamily: "'Clash Display', sans-serif" }}
        >
          {speaker.title}
        </p>
        <div className="w-6 sm:w-8 h-[1px] bg-white/20 my-1.5 sm:my-3 group-hover:w-full group-hover:bg-[#E62B1E] transition-all duration-300" />
        <p
          className={`${isDark ? "text-gray-400" : "text-gray-600"} text-xs sm:text-sm leading-relaxed tracking-[0.04em] line-clamp-5 w-[95%]`}
          style={{ fontFamily: "'Clash Display', sans-serif" }}
        >
          {speaker.description}
        </p>
      </div>
    </div>
  );
};

// Main EchoesHero Component
const EchoesHero: React.FC<EchoesHeroProps> = ({ startAnimation = false }) => {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [[page, direction], setPage] = useState<[number, number]>([0, 0]);
  const [speakersPerPage, setSpeakersPerPage] = useState<number>(4);
  const [isMounted, setIsMounted] = useState<boolean>(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Handle mounting and resize
  useEffect(() => {
    setIsMounted(true);

    const handleResize = () => {
      setSpeakersPerPage(window.innerWidth < 768 ? 3 : 4);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Scroll-based animations - only active when mounted
  const { scrollYProgress } = useScroll({
    target: isMounted ? containerRef : undefined,
    offset: ["start end", "end start"],
  });

  // Animation values based on scroll
  const glowRotate = useTransform(scrollYProgress, [0, 0.5, 1], [0, -15, 15]);
  const glowScale = useTransform(scrollYProgress, [0, 0.5], [0.8, 1.2]);
  const textScale = useTransform(scrollYProgress, [0.3, 0.6], [1, 0.75]);
  const textY = useTransform(scrollYProgress, [0.3, 0.6], ["0%", "-30%"]);
  const speakersOpacity = useTransform(scrollYProgress, [0.35, 0.5], [0, 1]);
  const speakersY = useTransform(scrollYProgress, [0.35, 0.5], ["50px", "0px"]);

  const totalPages = Math.ceil(speakers.length / speakersPerPage);
  const currentPage = wrap(0, totalPages, page);
  const currentSpeakers = speakers.slice(
    currentPage * speakersPerPage,
    (currentPage + 1) * speakersPerPage
  );

  const paginate = useCallback((newDirection: number) => {
    setPage(([prevPage]) => [prevPage + newDirection, newDirection]);
  }, []);

  const handleDragEnd = useCallback(
    (
      _e: MouseEvent | TouchEvent | PointerEvent,
      { offset, velocity }: PanInfo
    ) => {
      const swipe = swipePower(offset.x, velocity.x);
      if (swipe < -swipeConfidenceThreshold) {
        paginate(1);
      } else if (swipe > swipeConfidenceThreshold) {
        paginate(-1);
      }
    },
    [paginate]
  );

  // Skeleton while not mounted
  if (!isMounted) {
    return (
      <div className={`relative min-h-[200vh] ${isDark ? "bg-black" : "bg-white"}`}>
        <div className="h-screen" />
      </div>
    );
  }

  return (
    <div ref={containerRef} className={`relative ${isDark ? "bg-black" : "bg-white"}`}>
      {/* Hero Title Section - Sticky */}
      <div className="sticky top-0 h-screen flex flex-col justify-center items-center overflow-hidden z-10">
        <motion.div
          className="absolute inset-0 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: startAnimation ? 1 : 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Red Glow Background */}
          <motion.div
            style={{ rotate: glowRotate, scale: glowScale }}
            className="absolute inset-0 flex items-center justify-center pointer-events-none"
          >
            <Image
              src="/images/red1.svg"
              alt=""
              width={700}
              height={700}
              priority
              className="w-[350px] h-[350px] sm:w-[450px] sm:h-[450px] md:w-[550px] md:h-[550px] lg:w-[700px] lg:h-[700px]"
            />
          </motion.div>

          {/* Hero Text */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{
              scale: startAnimation ? 1 : 0.8,
              opacity: startAnimation ? 1 : 0,
            }}
            style={{ scale: textScale, y: textY }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="relative z-20 text-center px-4"
          >
            <h1
              className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-[84px] font-medium leading-none tracking-tight"
              style={{
                fontFamily: "var(--font-orbitron), 'Orbitron', sans-serif",
                letterSpacing: "-0.02em",
              }}
            >
              <span className={`font-bold ${isDark ? "text-white" : "text-black"}`}>Imprints of </span>
              <span className="text-[#EB0028] font-bold">&apos;25</span>
            </h1>
          </motion.div>
        </motion.div>
      </div>

      {/* Speakers Section */}
      <motion.div
        className={`relative z-20 h-screen flex items-center justify-center px-4 sm:px-8 md:px-12 lg:px-16 py-safe ${isDark ? "bg-black" : "bg-white"}`}
        style={{ opacity: speakersOpacity }}
      >
        <section className="relative w-full max-w-6xl mx-auto flex flex-col items-stretch h-full justify-center max-h-[800px]">
          {/* Speakers Header */}
          <div className="flex items-center justify-between mb-4 sm:mb-6 md:mb-8 flex-shrink-0">
            <h2 className={`font-clash text-sm sm:text-base md:text-lg tracking-[0.15em] sm:tracking-[0.2em] font-light ${isDark ? "text-white" : "text-black"}`}>
              <span className={`border-y ${isDark ? "border-white/20" : "border-black/10"} py-1 sm:py-2`}>
                SPEAKERS . <span className="font-[500]">2025</span>
              </span>
            </h2>
            <div className="flex gap-3 sm:gap-4">
              <motion.button
                type="button"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => paginate(-1)}
                className="w-9 h-9 sm:w-10 sm:h-10 bg-[#EB0028] flex items-center justify-center hover:bg-[#B71C1C] transition-colors duration-300 rounded-sm"
                aria-label="Previous speakers"
              >
                <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </motion.button>
              <motion.button
                type="button"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => paginate(1)}
                className="w-9 h-9 sm:w-10 sm:h-10 bg-[#EB0028] flex items-center justify-center hover:bg-[#B71C1C] transition-colors duration-300 rounded-sm"
                aria-label="Next speakers"
              >
                <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </motion.button>
            </div>
          </div>

          {/* Speakers Carousel */}
          <div className="relative w-full min-h-[650px] sm:min-h-[400px] overflow-hidden">
            <AnimatePresence initial={false} custom={direction} mode="popLayout">
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
                className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 cursor-grab active:cursor-grabbing w-full"
              >
                {currentSpeakers.map((speaker) => (
                  <div key={speaker.id}>
                    <SpeakerCard speaker={speaker} />
                  </div>
                ))}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Pagination Dots */}
          <div className="flex justify-center mt-6 sm:mt-8 gap-2 sm:gap-3 flex-shrink-0">
            {Array.from({ length: totalPages }).map((_, index) => (
              <button
                key={index}
                onClick={() => setPage([index, index > currentPage ? 1 : -1])}
                className={`h-1.5 sm:h-2 rounded-full transition-all duration-300 ${index === currentPage
                  ? "bg-[#E62B1E] w-8 sm:w-10"
                  : `${isDark ? "bg-white/20 hover:bg-white/40" : "bg-black/10 hover:bg-black/20"} w-4 sm:w-6`
                  }`}
                aria-label={`Go to page ${index + 1}`}
              />
            ))}
          </div>
        </section>
      </motion.div>
    </div>
  );
};

export default EchoesHero;
