"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mic,
  Utensils,
  Zap,
  Music2,
  Sparkles,
  Users,
  Flame,
  MessageSquare,
  Gamepad2,
  Popcorn,
  Radio,
  Clock,
  Search,
  Calendar,
  ChevronDown,
  ChevronUp,
  Share2,
  Info,
  CheckCircle2,
  MapPin,
  ExternalLink,
  Award
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useTheme } from "./ThemeContext";

export type CategoryType = "all" | "talk" | "break" | "performance" | "ceremony";

export interface RoadmapItem {
  id: string;
  time: string;
  duration: string;
  title: string;
  subtitle?: string;
  speaker?: string;
  performer?: string;
  category: CategoryType;
  description: string;
  image?: string;
  specialStyle?: "monster" | "lunch" | "snack" | "default";
  speakerSlug?: string;
}

export const ROADMAP_DATA: RoadmapItem[] = [
  {
    id: "1",
    time: "09:30 AM",
    duration: "5 mins",
    title: "Welcome + Introduction",
    category: "ceremony",
    description: "Official welcome address to TEDxICEAS 2026. Opening remarks setting the stage for an extraordinary day of transformative ideas and human connection.",
  },
  {
    id: "2",
    time: "09:35 AM",
    duration: "5 mins",
    title: "Lighting the Lamp",
    category: "ceremony",
    description: "A cherished ceremonial tradition illuminating pathbreaking ideas, knowledge, and auspicious beginnings for the TEDx conference.",
  },
  {
    id: "3",
    time: "09:40 AM",
    duration: "18 mins",
    title: "Introduction to TEDx",
    category: "ceremony",
    description: "An inspiring briefing on the global TEDx movement, community values, and the underlying vision of our 2026 theme: 'What Shapes Us'.",
  },
  {
    id: "4",
    time: "09:58 AM",
    duration: "18 mins",
    title: "Talk by Paul Mathulla",
    speaker: "Paul Mathulla",
    category: "talk",
    description: "Exploring perspectives, mindset shifts, and how choices define our personal and collective destiny.",
  },
  {
    id: "5",
    time: "10:16 AM",
    duration: "18 mins",
    title: "Talk by Shwetha Vohra",
    speaker: "Shwetha Vohra",
    category: "talk",
    image: "/speakers/shweta-vohra.jpg",
    description: "Delving into personal transformation, courage, and how defining life moments shape our worldview.",
  },
  {
    id: "6",
    time: "10:34 AM",
    duration: "18 mins",
    title: "Talk by Dr. Lokesh",
    speaker: "Dr. Lokesh",
    category: "talk",
    image: "/speakers/dr-lokesh-b.jpg",
    description: "A deep dive into innovation, healthcare science, and the forces driving positive social impact.",
  },
  {
    id: "7",
    time: "10:52 AM",
    duration: "10 mins",
    title: "Game: TEDx Bingo Cards",
    category: "performance",
    description: "An energetic audience interaction game designed to break the ice, spark conversations, and test your TEDx knowledge.",
  },
  {
    id: "8",
    time: "11:02 AM",
    duration: "10 mins",
    title: "Monster Energy Break",
    subtitle: "High Energy Refreshment Session",
    category: "break",
    specialStyle: "monster",
    description: "Recharge your energy with ice-cold Monster Energy drinks, network with fellow attendees, and gear up for the next session.",
  },
  {
    id: "9",
    time: "11:12 AM",
    duration: "18 mins",
    title: "Talk by Kapil Ahuja",
    speaker: "Kapil Ahuja",
    category: "talk",
    image: "/speakers/kapil-ahuja.jpg",
    description: "Actionable insights on leadership resilience, innovation strategy, and navigating complex professional terrain.",
  },
  {
    id: "10",
    time: "11:30 AM",
    duration: "18 mins",
    title: "Talk by Dr. Ghazala Ahmed Shafi",
    speaker: "Dr. Ghazala Ahmed Shafi",
    category: "talk",
    image: "/speakers/dr-ghazala-ahmed-shafi.jpg",
    description: "Award-winning Periodontist and Laser Specialist sharing breakthrough perspectives in healthcare innovation and patient empathy.",
  },
  {
    id: "11",
    time: "11:48 AM",
    duration: "18 mins",
    title: "Talk by Sanjay R",
    speaker: "Sanjay R",
    category: "talk",
    image: "/speakers/sanjay-r.jpg",
    description: "District Rotaract Representative sharing powerful lessons on youth leadership, grassroots impact, and community service.",
  },
  {
    id: "12",
    time: "12:06 PM",
    duration: "8 mins",
    title: "Dance Performance",
    performer: "Ankitha, Gowri, Anushka",
    category: "performance",
    description: "A mesmerizing contemporary dance showcase depicting fluid emotion, artistic rhythm, and cultural harmony.",
  },
  {
    id: "13",
    time: "12:14 PM",
    duration: "18 mins",
    title: "Talk by Arun Prasanna",
    speaker: "Arun Prasanna",
    category: "talk",
    image: "/speakers/arun-prasanna.jpg",
    description: "Hospitality business leader on how empathy, everyday encounters, and purpose shape who we ultimately become.",
  },
  {
    id: "14",
    time: "12:32 PM",
    duration: "88 mins",
    title: "Lunch Break",
    subtitle: "Networking & Culinary Experience",
    category: "break",
    specialStyle: "lunch",
    description: "A relaxed 88-minute networking lunch. Enjoy gourmet cuisine while connecting with speakers, partners, and attendees.",
  },
  {
    id: "15",
    time: "02:00 PM",
    duration: "18 mins",
    title: "Talk by Manish Kankaria",
    speaker: "Manish Kankaria",
    category: "talk",
    image: "/speakers/manish-kankaria.jpg",
    description: "Prominent thought leader sharing key principles of entrepreneurial growth, adaptability, and vision execution.",
  },
  {
    id: "16",
    time: "02:18 PM",
    duration: "18 mins",
    title: "Talk by Dr. Saheer Nelliparamban",
    speaker: "Dr. Saheer Nelliparamban",
    category: "talk",
    image: "/speakers/dr-saheer-nelliparamban.jpg",
    description: "Forbes Council Member and CEO of Paywint on fintech transformation, global tech trends, and human-centric innovation.",
  },
  {
    id: "17",
    time: "02:36 PM",
    duration: "18 mins",
    title: "Talk by Neole Anna Cornelio",
    speaker: "Neole Anna Cornelio",
    category: "talk",
    image: "/speakers/neole-anna-cornelio.jpg",
    description: "International sprinter and national record holder on athletic discipline, overcoming limits, and competitive drive.",
  },
  {
    id: "18",
    time: "02:54 PM",
    duration: "18 mins",
    title: "Talk by Fazlur Rahman Khan",
    speaker: "Fazlur Rahman Khan",
    category: "talk",
    image: "/speakers/fazlur-rahman-khan.jpg",
    description: "Kubestronaut & Linux Foundation Trainer exploring cloud technology, enterprise architecture, and continuous learning.",
  },
  {
    id: "19",
    time: "03:12 PM",
    duration: "18 mins",
    title: "Talk by Huda Thamanna",
    speaker: "Huda Thamanna",
    category: "talk",
    image: "/speakers/huda-thamanna.jpg",
    description: "Renowned content creator sharing insights on staying authentic in digital spaces and turning creative vision into reality.",
  },
  {
    id: "20",
    time: "03:30 PM",
    duration: "20 mins",
    title: "Snack Break",
    subtitle: "Evening Tea & Snacks",
    category: "break",
    specialStyle: "snack",
    description: "Refreshments, hot tea/coffee, snacks, and casual networking before the grand musical finale.",
  },
  {
    id: "21",
    time: "03:50 PM",
    duration: "30 mins",
    title: "Music Performance",
    performer: "Karthik Boon",
    category: "performance",
    description: "A captivating musical grand finale performance by Karthik Boon, bringing TEDxICEAS 2026 to an unforgettable conclusion.",
  },
];

export default function EventRoadmap() {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const [activeCategory, setActiveCategory] = useState<CategoryType>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Filtered Items
  const filteredData = useMemo(() => {
    return ROADMAP_DATA.filter((item) => {
      const matchesCategory =
        activeCategory === "all" || item.category === activeCategory;
      const query = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !query ||
        item.title.toLowerCase().includes(query) ||
        (item.speaker && item.speaker.toLowerCase().includes(query)) ||
        (item.performer && item.performer.toLowerCase().includes(query)) ||
        item.description.toLowerCase().includes(query) ||
        item.time.toLowerCase().includes(query);

      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, searchQuery]);

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const handleShare = (item: RoadmapItem, e: React.MouseEvent) => {
    e.stopPropagation();
    const shareText = `TEDxICEAS 2026: ${item.title} at ${item.time}! Check the official event flow at https://tedxiceas.in/roadmap`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(shareText);
      setCopiedId(item.id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  const generateGoogleCalendarUrl = (item: RoadmapItem) => {
    const title = encodeURIComponent(`TEDxICEAS 2026 - ${item.title}`);
    const details = encodeURIComponent(
      `${item.description}\n\nVenue: Visvesvaraya Auditorium, Impact College of Engineering, Sahakar Nagar, Bengaluru.`
    );
    const location = encodeURIComponent(
      "Visvesvaraya Auditorium, Impact College of Engineering, Sahakar Nagar, Bengaluru"
    );
    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${details}&location=${location}`;
  };

  const getIcon = (item: RoadmapItem) => {
    if (item.specialStyle === "monster") {
      return <Zap className="w-5 h-5 text-[#50B848] animate-pulse" />;
    }
    if (item.specialStyle === "lunch") {
      return <Utensils className="w-5 h-5 text-white" />;
    }
    if (item.specialStyle === "snack") {
      return <Popcorn className="w-5 h-5 text-amber-400" />;
    }

    switch (item.category) {
      case "talk":
        return <Mic className="w-5 h-5 text-[#E62B1E]" />;
      case "performance":
        return item.title.includes("Game") ? (
          <Gamepad2 className="w-5 h-5 text-purple-400" />
        ) : (
          <Music2 className="w-5 h-5 text-rose-400" />
        );
      case "ceremony":
        if (item.title.includes("Welcome")) return <Users className="w-5 h-5 text-amber-400" />;
        if (item.title.includes("Lamp")) return <Flame className="w-5 h-5 text-orange-400" />;
        return <Sparkles className="w-5 h-5 text-yellow-400" />;
      case "break":
        return <Utensils className="w-5 h-5 text-emerald-400" />;
      default:
        return <Clock className="w-5 h-5 text-gray-400" />;
    }
  };

  return (
    <div className={`w-full py-16 px-4 sm:px-6 lg:px-8 transition-colors duration-300 ${isDark ? "bg-black text-white" : "bg-black text-white"}`}>
      <div className="max-w-6xl mx-auto">
        
        {/* HEADER SECTION */}
        <div className="text-center mb-12 space-y-4">
          <motion.h2
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl sm:text-6xl font-extrabold uppercase tracking-tight"
          >
            What <span className="text-[#E62B1E] underline decoration-[#E62B1E]/40 underline-offset-8">Shapes Us</span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-gray-400 text-sm sm:text-base max-w-2xl mx-auto font-mono uppercase tracking-widest"
          >
            Ideas. Perspectives. Actions. That Shape Our World.
          </motion.p>
        </div>

        {/* CONTROLS & FILTER BAR */}
        <div className="mb-10 space-y-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-zinc-900/80 p-3 sm:p-4 rounded-2xl border border-zinc-800 backdrop-blur-md">
            
            {/* Category Pills */}
            <div className="flex flex-wrap items-center justify-center gap-2 w-full md:w-auto">
              {[
                { id: "all", label: "All Flow", count: 21 },
                { id: "talk", label: "Talks", count: 13 },
                { id: "break", label: "Breaks", count: 3 },
                { id: "performance", label: "Performances", count: 3 },
                { id: "ceremony", label: "Ceremonies", count: 2 },
              ].map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id as CategoryType)}
                  className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all duration-300 flex items-center gap-2 ${
                    activeCategory === cat.id
                      ? "bg-[#E62B1E] text-white shadow-lg shadow-[#E62B1E]/30 font-semibold"
                      : "bg-zinc-800/60 text-zinc-400 hover:text-white hover:bg-zinc-800"
                  }`}
                >
                  {cat.label}
                  <span
                    className={`px-1.5 py-0.5 rounded-full text-[10px] ${
                      activeCategory === cat.id
                        ? "bg-white/20 text-white"
                        : "bg-zinc-700/60 text-zinc-400"
                    }`}
                  >
                    {cat.count}
                  </span>
                </button>
              ))}
            </div>

            {/* Search Input */}
            <div className="relative w-full md:w-72">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
              <input
                type="text"
                placeholder="Search speaker, time, topic..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-700 focus:border-[#E62B1E] rounded-xl pl-10 pr-4 py-2 text-xs sm:text-sm text-white placeholder-zinc-500 focus:outline-none transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-zinc-400 hover:text-white"
                >
                  Clear
                </button>
              )}
            </div>

          </div>
        </div>

        {/* TIMELINE VIEW */}
        <div className="relative pl-4 sm:pl-8 border-l-2 border-zinc-800 space-y-6">
          {filteredData.length === 0 ? (
            <div className="text-center py-16 text-zinc-500 bg-zinc-900/30 rounded-2xl border border-zinc-800/50">
              <Info className="w-10 h-10 mx-auto mb-3 opacity-50" />
              <p className="text-base font-medium">No schedule items match your search.</p>
              <button
                onClick={() => {
                  setActiveCategory("all");
                  setSearchQuery("");
                }}
                className="mt-3 text-xs text-[#E62B1E] hover:underline"
              >
                Reset filters
              </button>
            </div>
          ) : (
            filteredData.map((item, index) => {
              const isExpanded = expandedId === item.id;
              const isMonster = item.specialStyle === "monster";
              const isLunch = item.specialStyle === "lunch";
              const isSnack = item.specialStyle === "snack";

              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.4, delay: index * 0.03 }}
                  className="relative group"
                >
                  {/* Timeline Node Ring */}
                  <div
                    className={`absolute -left-[25px] sm:-left-[41px] top-4 w-7 h-7 sm:w-9 sm:h-9 rounded-full flex items-center justify-center border-2 transition-all duration-300 z-10 ${
                      isMonster
                        ? "bg-black border-[#50B848] shadow-[0_0_15px_rgba(80,184,72,0.6)]"
                        : isLunch
                        ? "bg-[#E62B1E] border-white shadow-[0_0_15px_rgba(230,43,30,0.8)]"
                        : isSnack
                        ? "bg-zinc-900 border-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]"
                        : "bg-zinc-950 border-zinc-700 group-hover:border-[#E62B1E] group-hover:scale-110"
                    }`}
                  >
                    {getIcon(item)}
                  </div>

                  {/* Card Container */}
                  <div
                    onClick={() => toggleExpand(item.id)}
                    className={`cursor-pointer rounded-2xl transition-all duration-300 overflow-hidden border ${
                      isMonster
                        ? "bg-zinc-950/90 border-[#50B848]/40 hover:border-[#50B848] shadow-lg shadow-[#50B848]/10"
                        : isLunch
                        ? "bg-[#E62B1E]/90 text-white border-[#E62B1E] shadow-xl shadow-[#E62B1E]/30"
                        : isSnack
                        ? "bg-zinc-950 border-zinc-800 hover:border-amber-500/50"
                        : isExpanded
                        ? "bg-zinc-900 border-[#E62B1E]/60 shadow-xl shadow-black/60"
                        : "bg-zinc-900/60 border-zinc-800/80 hover:bg-zinc-900 hover:border-zinc-700"
                    }`}
                  >
                    {/* Header Row */}
                    <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      
                      <div className="flex items-start sm:items-center gap-4">
                        {/* Speaker Thumbnail */}
                        {item.image && (
                          <div className="relative w-12 h-12 rounded-full overflow-hidden shrink-0 border-2 border-white/10 shadow-md">
                            <Image
                              src={item.image}
                              alt={item.speaker || item.title}
                              fill
                              className="object-cover"
                            />
                          </div>
                        )}

                        {/* Title & Time */}
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span
                              className={`text-xs font-mono font-bold px-2.5 py-0.5 rounded-full ${
                                isLunch
                                  ? "bg-white text-[#E62B1E]"
                                  : isMonster
                                  ? "bg-[#50B848]/20 text-[#50B848] border border-[#50B848]/30"
                                  : "bg-zinc-800 text-zinc-300"
                              }`}
                            >
                              {item.time}
                            </span>
                            <span className="text-[11px] text-zinc-400 font-mono">
                              • {item.duration}
                            </span>
                            {item.category === "talk" && (
                              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-rose-500/10 text-rose-400 border border-rose-500/20">
                                Keynote Talk
                              </span>
                            )}
                            {isMonster && (
                              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-[#50B848]/20 text-[#50B848] border border-[#50B848]/40">
                                Sponsored Break
                              </span>
                            )}
                          </div>

                          <h3
                            className={`text-lg sm:text-xl font-bold mt-1 ${
                              isLunch ? "text-white" : isMonster ? "text-[#50B848]" : "text-white"
                            }`}
                          >
                            {item.title}
                          </h3>

                          {(item.speaker || item.performer || item.subtitle) && (
                            <p
                              className={`text-xs sm:text-sm mt-0.5 font-medium ${
                                isLunch ? "text-white/90" : "text-zinc-400"
                              }`}
                            >
                              {item.speaker && `Speaker: ${item.speaker}`}
                              {item.performer && `Performers: ${item.performer}`}
                              {item.subtitle && item.subtitle}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Right Action Icons */}
                      <div className="flex items-center gap-2 self-end sm:self-center">
                        <button
                          onClick={(e) => handleShare(item, e)}
                          title="Share schedule item"
                          className="p-2 rounded-xl bg-zinc-800/40 hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
                        >
                          {copiedId === item.id ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                          ) : (
                            <Share2 className="w-4 h-4" />
                          )}
                        </button>
                        <a
                          href={generateGoogleCalendarUrl(item)}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          title="Add to Google Calendar"
                          className="p-2 rounded-xl bg-zinc-800/40 hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
                        >
                          <Calendar className="w-4 h-4" />
                        </a>
                        <div className="p-2 text-zinc-400">
                          {isExpanded ? (
                            <ChevronUp className="w-5 h-5" />
                          ) : (
                            <ChevronDown className="w-5 h-5" />
                          )}
                        </div>
                      </div>

                    </div>

                    {/* Expandable Details Drawer */}
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.3 }}
                          className={`px-4 sm:px-5 pb-5 pt-2 border-t ${
                            isLunch ? "border-white/20" : "border-zinc-800"
                          }`}
                        >
                          <p className={`text-sm leading-relaxed ${isLunch ? "text-white/90" : "text-zinc-300"}`}>
                            {item.description}
                          </p>

                          <div className="mt-4 pt-3 border-t border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs">
                            <div className="flex items-center gap-2 text-zinc-400 font-mono">
                              <MapPin className="w-3.5 h-3.5 text-[#E62B1E]" />
                              <span>Visvesvaraya Auditorium, Bengaluru</span>
                            </div>

                            <div className="flex items-center gap-3">
                              <a
                                href={generateGoogleCalendarUrl(item)}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white font-medium transition-colors"
                              >
                                <Calendar className="w-3.5 h-3.5" />
                                Add to Calendar
                              </a>

                              {item.speaker && (
                                <Link
                                  href="/speakers"
                                  onClick={(e) => e.stopPropagation()}
                                  className="inline-flex items-center gap-1 text-[#E62B1E] hover:underline font-semibold"
                                >
                                  View Speakers <ExternalLink className="w-3 h-3" />
                                </Link>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                  </div>
                </motion.div>
              );
            })
          )}
        </div>

      </div>
    </div>
  );
}
