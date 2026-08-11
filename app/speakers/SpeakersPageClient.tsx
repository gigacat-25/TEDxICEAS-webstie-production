"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, ChevronRight, Sparkles, ArrowLeft, Ticket } from "lucide-react";
import { useTheme } from "../components/ThemeContext";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export interface SpeakerDetail {
  id: string;
  name: string;
  title: string;
  category: string;
  bio: string;
  img: string;
  highlights?: string[];
}

export const speakersData: SpeakerDetail[] = [
  {
    id: "huda-thamanna",
    name: "Huda Thamanna",
    title: "Content Creator",
    category: "Media & Content",
    bio: "Huda Thamanna is a content creator whose journey is rooted in authenticity, creativity, and connection. By transforming everyday moments into meaningful stories, she has cultivated a community that values honesty, growth, and self-expression. At TEDxICEAS, she brings her perspective on navigating life while staying true to oneself.",
    img: "/speakers/huda-thamanna.jpg",
    highlights: ["Digital Storytelling", "Authentic Content", "Youth Engagement"],
  },
  {
    id: "arun-prasanna",
    name: "Arun Prasanna",
    title: "Hospitality Business Leader & Entrepreneur",
    category: "Business & Leadership",
    bio: "A hospitality business leader with over a decade of experience in building, operating, and scaling premium restaurant and dining brands. Throughout his career, he has led business growth, brand launches, operational excellence, and guest experience initiatives across multiple hospitality concepts. Driven by empathy and purpose, he shares how seemingly ordinary people and moments in our lives profoundly shape who we become.",
    img: "/speakers/arun-prasanna.jpg",
    highlights: ["Hospitality Operations", "Brand Scaling", "Purpose-Driven Leadership"],
  },
  {
    id: "dr-saheer-nelliparamban",
    name: "Dr. Saheer Nelliparamban",
    title: "Founder & CEO, Paywint | Forbes Council Member",
    category: "Fintech & Healthcare",
    bio: "Dr. Saheer Nelliparamban is a doctor, entrepreneur, Founder and CEO of Paywint, Fichecks, and Gasdeck, and a member of the Forbes Business Council. His journey spans healthcare, technology, fintech innovation, and entrepreneurship, offering valuable insights on leadership, resilience, innovation, and creating impact in a rapidly evolving world.",
    img: "/speakers/dr-saheer-nelliparamban.jpg",
    highlights: ["Forbes Business Council", "Fintech Innovation", "Healthcare & Tech"],
  },
  {
    id: "fazlur-rahman-khan",
    name: "Fazlur Rahman Khan",
    title: "Technical Trainer, Linux Foundation | Kubestronaut",
    category: "Technology & Cloud",
    bio: "Fazlur Rahman Khan is a Technical Trainer at The Linux Foundation with over 20 years of experience across enterprise database architecture, cloud-native infrastructure, and technical education. He is India's first Technical Trainer, Course Maintainer, Author, and Kubestronaut holding all five active CNCF Kubernetes certifications. Spoken at KubeCon + CloudNativeCon India and Kubernetes Community Days worldwide.",
    img: "/speakers/fazlur-rahman-khan.jpg",
    highlights: ["Linux Foundation Trainer", "5x CNCF Certified", "Kubestronaut"],
  },
  {
    id: "dr-ghazala-ahmed-shafi",
    name: "Dr. Ghazala Ahmed Shafi",
    title: "Chief Dental Surgeon | Laser Specialist of the Year",
    category: "Medicine & Healthcare",
    bio: "Dr. Ghazala Ahmed Shafi is Head and Chief Dental Surgeon at Dr. Ghazala’s Dental, Implant and Laser Centre in Bangalore, bringing over 17 years of clinical and academic expertise in periodontology and laser therapy. An award-winning specialist and published author, she holds an MDS in Periodontology and has been recognized as the Laser Specialist of the Year 2022 and named among the Top 100 Doctors in the Doctors’ Choice Awards 2019.",
    img: "/speakers/dr-ghazala-ahmed-shafi.jpg",
    highlights: ["Laser Specialist of the Year 2022", "17+ Years Clinical Expertise", "Phototherapy Pioneer"],
  },
  {
    id: "neole-anna-cornelio",
    name: "Neole Anna Cornelio",
    title: "International Sprinter | Gold Medalist & Record Holder",
    category: "Sports & Performance",
    bio: "Neole Anna Cornelio is an international sprinter who has represented India in the 4×100 metres relay at prestigious events, including the Asian U20 Championships in Dubai, the World Athletics U20 Championships in Peru, and the South Asian Junior Athletics Championships (Junior SAAF gold medalist & national record holder). HYROX Women's Relay medalist and WWE tryout qualifier.",
    img: "/speakers/neole-anna-cornelio.jpg",
    highlights: ["National Record Holder", "Junior SAAF Gold Medalist", "WWE Tryout Qualifier"],
  },
  {
    id: "sanjay-r",
    name: "Sanjay R",
    title: "Community Manager, Google for Developers",
    category: "Community & Tech",
    bio: "Born and brought up in Bengaluru, Sanjay R is a community builder, entrepreneur, and youth leader. Alumnus of AIMS Institutes with an MBA in Marketing and 5+ years in community growth. Serves as Community Manager at Google for Developers and Youngest District Rotaract Representative of Rotary International District 3192 (2026-27), having inspired 5,000+ young professionals.",
    img: "/speakers/sanjay-r.jpg",
    highlights: ["Google for Developers", "Rotaract District Representative", "Startup Founder"],
  },
  {
    id: "shweta-vohra",
    name: "Shweta Vohra",
    title: "Architecture Leader, Booking.com | Author & Inventor",
    category: "Engineering & Systems",
    bio: "Shweta Vohra is a technology leader, author, inventor, and speaker with over 24 years of experience building cloud, platform, and AI systems across global enterprises. She currently serves as an architecture leader at Booking.com and is the author of Decoding Platform Engineering Patterns and Dear Software and AI Architect, exploring how people and systems grow through change.",
    img: "/speakers/shweta-vohra.jpg",
    highlights: ["Booking.com Tech Leader", "24+ Years Systems Architect", "Published Author & Inventor"],
  },
  {
    id: "dr-lokesh-b",
    name: "Dr. Lokesh B",
    title: "Senior Consultant in Neurology, Aster CMI Hospital",
    category: "Medicine & Healthcare",
    bio: "Dr. Lokesh B is a Senior Consultant in Neurology at Aster CMI Hospital, Bangalore. He holds an MBBS, MD, and DM in Neurology, and specializes in the diagnosis and treatment of disorders affecting the brain, spinal cord, nerves, and muscles. With his extensive expertise in neurology, he is dedicated to providing comprehensive and advanced neurological care to his patients.",
    img: "/speakers/dr-lokesh-b.jpg",
    highlights: ["Senior Consultant Neurology", "Aster CMI Hospital", "MBBS, MD, DM Neurology"],
  },
  {
    id: "manish-kankaria",
    name: "Manish Kankaria",
    title: "Founder, Bombay Kulfi | Entrepreneur & CA",
    category: "Business & Leadership",
    bio: "Manish Kankaria is the Founder of Bombay Kulfi Ice Creams, a brand that has transformed the way India experiences one of its most beloved traditional desserts. A Chartered Accountant by profession, Manish combined business acumen with a deep appreciation for authenticity to launch Bombay Kulfi in 2015. What began as a single outlet in Coimbatore has grown into a thriving brand with 100+ outlets, three national awards, and an international presence in Singapore.",
    img: "/speakers/manish-kankaria.jpg",
    highlights: ["Founder Bombay Kulfi", "100+ Outlets & Global Brand", "Chartered Accountant & Entrepreneur"],
  },
  {
    id: "dr-paul-mathulla",
    name: "Dr. Paul Mathulla",
    title: "Chairman of the Governing Council, Impact Group of Institutions | M.E., Ph.D.",
    category: "Education & Leadership",
    bio: "Dr. Paul Mathulla (M.E., Ph.D.) serves as the Chairman of the Governing Council at Impact Group of Institutions, Bengaluru, where he oversees the academic and administrative growth of the organization. Rejecting narrow specialization, his educational philosophy focuses on delivering a flexible, interdisciplinary learning environment that equips students with versatile problem-solving skills. Under his leadership, the institutions maintain high academic standards closely aligned with technological advances and the dynamic industry demands of Bengaluru.",
    img: "/speakers/dr-paul-mathulla.jpg",
    highlights: ["Chairman Governing Council", "Interdisciplinary Learning", "M.E., Ph.D."],
  },
  {
    id: "kapil-ahuja",
    name: "Kapil Ahuja",
    title: "CTO of Ventures & Studios, Nagarro | Author & Architect",
    category: "Engineering & Systems",
    bio: "Kapil Ahuja is the CTO of Ventures and Studios at Nagarro, where he has spent his career asking one enduring question: How do you architect something well? What began as a quest to build better technology systems evolved into leading high-performing teams and exploring principles that shape a meaningful life. Alongside his work in tech, Kapil writes at HowToArchitect.io, sharing perspectives on innovation, leadership, and personal growth.",
    img: "/speakers/kapil-ahuja.jpg",
    highlights: ["CTO Nagarro Ventures & Studios", "HowToArchitect.io Author", "Systems Architecture & Leadership"],
  },
];

const categories = ["All", "Education & Leadership", "Media & Content", "Business & Leadership", "Fintech & Healthcare", "Technology & Cloud", "Medicine & Healthcare", "Sports & Performance", "Community & Tech", "Engineering & Systems"];

export default function SpeakersPageClient() {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeSpeaker, setActiveSpeaker] = useState<SpeakerDetail | null>(null);

  const filteredSpeakers = speakersData.filter((speaker) => {
    const matchesCategory =
      selectedCategory === "All" || speaker.category === selectedCategory;
    const matchesSearch =
      speaker.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      speaker.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      speaker.bio.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <main className={`min-h-screen ${isDark ? "bg-black text-white" : "bg-white text-black"} transition-colors duration-300`}>
      <Navbar startAnimation={true} />

      {/* JSON-LD Structured Data for Indexing */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "ItemList",
            name: "TEDxICEAS 2026 Speaker Lineup",
            description: "Official speakers presenting at TEDxICEAS 2026 in Bengaluru.",
            itemListElement: speakersData.map((s, index) => ({
              "@type": "ListItem",
              position: index + 1,
              item: {
                "@type": "Person",
                name: s.name,
                jobTitle: s.title,
                description: s.bio,
                image: `https://tedxiceas.com${s.img}`,
                url: `https://tedxiceas.com/speakers#${s.id}`,
              },
            })),
          }),
        }}
      />

      <div className="pt-28 md:pt-36 pb-20 px-6 md:px-16 max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="flex flex-col gap-4 mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EB0028]/10 text-[#EB0028] font-clash text-xs uppercase tracking-widest font-semibold w-fit">
            <Sparkles className="w-3.5 h-3.5" /> TEDxICEAS 2026 Lineup
          </div>
          <h1 className="font-orbitron text-4xl sm:text-5xl md:text-6xl font-black tracking-tight leading-tight">
            Echoes of <span className="text-[#EB0028]">&apos;26</span>
          </h1>
          <p className="font-clash text-base md:text-lg opacity-70 max-w-2xl leading-relaxed">
            Meet the extraordinary lineup of thinkers, creators, leaders, and champions sharing transformative ideas at TEDxICEAS 2026 under our theme <strong className="text-[#EB0028]">&quot;What shapes us?&quot;</strong>.
          </p>
        </div>

        {/* Search & Category Filter Controls */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-6 mb-12">
          {/* Search Bar */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search speaker by name, title, or keyword..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full pl-11 pr-4 py-3 text-sm font-clash rounded-xl border transition-all outline-none ${
                isDark
                  ? "bg-white/5 border-white/10 focus:border-[#EB0028] text-white placeholder:text-gray-500"
                  : "bg-black/5 border-black/10 focus:border-[#EB0028] text-black placeholder:text-gray-400"
              }`}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide shrink-0">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 text-xs font-clash font-medium rounded-full transition-all whitespace-nowrap ${
                  selectedCategory === cat
                    ? "bg-[#EB0028] text-white shadow-lg shadow-[#EB0028]/20"
                    : isDark
                    ? "bg-white/5 text-gray-300 hover:bg-white/10"
                    : "bg-black/5 text-gray-700 hover:bg-black/10"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Speaker Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {filteredSpeakers.map((speaker, index) => (
            <motion.div
              key={speaker.id}
              id={speaker.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.05 }}
              onClick={() => setActiveSpeaker(speaker)}
              className={`group cursor-pointer rounded-2xl border overflow-hidden flex flex-col transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl ${
                isDark
                  ? "bg-black/60 border-white/10 hover:border-[#EB0028]"
                  : "bg-white border-black/10 hover:border-[#EB0028]"
              }`}
            >
              {/* Speaker Image */}
              <div className="relative w-full aspect-[3/4] overflow-hidden bg-gray-900">
                <Image
                  src={speaker.img}
                  alt={speaker.name}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />
                <span className="absolute top-4 left-4 px-3 py-1 bg-[#EB0028] text-white font-clash text-[10px] font-semibold uppercase tracking-wider rounded-md">
                  {speaker.category}
                </span>
              </div>

              {/* Speaker Info */}
              <div className="p-6 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-clash font-bold text-xl mb-1 text-[#EB0028] group-hover:underline">
                    {speaker.name}
                  </h3>
                  <p className="font-clash text-xs uppercase tracking-wider opacity-80 mb-3 font-medium">
                    {speaker.title}
                  </p>
                  <p className="font-clash text-xs opacity-70 leading-relaxed line-clamp-3 mb-4">
                    {speaker.bio}
                  </p>
                </div>

                <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs font-clash text-[#EB0028] font-semibold">
                  <span>View Full Bio</span>
                  <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Empty state if search finds nothing */}
        {filteredSpeakers.length === 0 && (
          <div className="text-center py-20">
            <p className="font-clash text-lg opacity-70">
              No speakers found matching your search. Try resetting filters.
            </p>
            <button
              onClick={() => {
                setSelectedCategory("All");
                setSearchQuery("");
              }}
              className="mt-4 px-6 py-2 bg-[#EB0028] text-white font-clash text-xs font-semibold rounded-lg"
            >
              Reset Filters
            </button>
          </div>
        )}

        {/* Ticket CTA Banner */}
        <div
          className={`mt-20 p-8 md:p-12 rounded-2xl border flex flex-col md:flex-row items-center justify-between gap-6 ${
            isDark
              ? "bg-gradient-to-r from-[#EB0028]/20 via-black to-black border-white/10"
              : "bg-gradient-to-r from-[#EB0028]/10 via-white to-white border-black/10"
          }`}
        >
          <div>
            <div className="inline-flex items-center gap-2 text-[#EB0028] font-clash text-xs uppercase tracking-widest font-bold mb-2">
              <Ticket className="w-4 h-4" /> Live Event Access
            </div>
            <h2 className="font-orbitron text-2xl md:text-3xl font-bold mb-2">
              Experience These Talks <span className="text-[#EB0028]">Live</span>
            </h2>
            <p className="font-clash text-sm md:text-base opacity-70 max-w-xl">
              Join us on August 10, 2026 at Visvesvaraya Auditorium, Impact College of Engineering, Bengaluru.
            </p>
          </div>
        </div>

        {/* Back to Home */}
        <div className="mt-12">
          <Link
            href="/"
            className="inline-flex items-center gap-2 font-clash text-sm text-[#EB0028] hover:underline"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Home
          </Link>
        </div>
      </div>

      {/* Speaker Details Modal */}
      <AnimatePresence>
        {activeSpeaker && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setActiveSpeaker(null)}
            className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 md:p-8"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className={`relative w-full max-w-3xl rounded-3xl border overflow-hidden shadow-2xl max-h-[90vh] flex flex-col md:flex-row ${
                isDark ? "bg-black border-white/20 text-white" : "bg-white border-black/10 text-black"
              }`}
            >
              {/* Close Button */}
              <button
                onClick={() => setActiveSpeaker(null)}
                className="absolute top-4 right-4 z-20 w-10 h-10 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-[#EB0028] transition-colors"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Modal Image */}
              <div className="relative w-full md:w-1/2 aspect-[3/4] md:aspect-auto shrink-0 bg-gray-900">
                <Image
                  src={activeSpeaker.img}
                  alt={activeSpeaker.name}
                  fill
                  className="object-cover"
                />
              </div>

              {/* Modal Content */}
              <div className="p-6 md:p-10 flex-1 overflow-y-auto flex flex-col justify-between">
                <div>
                  <span className="inline-block px-3 py-1 bg-[#EB0028]/10 text-[#EB0028] font-clash text-xs uppercase tracking-widest font-bold rounded-md mb-3">
                    {activeSpeaker.category}
                  </span>
                  <h2 className="font-clash font-bold text-2xl md:text-3xl text-[#EB0028] mb-1">
                    {activeSpeaker.name}
                  </h2>
                  <p className="font-clash text-xs md:text-sm uppercase tracking-wider opacity-80 mb-6 font-semibold">
                    {activeSpeaker.title}
                  </p>

                  <div className="w-12 h-1 bg-[#EB0028] mb-6" />

                  <p className="font-clash text-sm md:text-base opacity-80 leading-relaxed mb-6">
                    {activeSpeaker.bio}
                  </p>

                  {activeSpeaker.highlights && (
                    <div className="mb-6">
                      <h4 className="font-clash text-xs font-bold uppercase tracking-widest text-[#EB0028] mb-2">
                        Highlights
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {activeSpeaker.highlights.map((h, i) => (
                          <span
                            key={i}
                            className={`px-3 py-1 text-xs font-clash rounded-full border ${
                              isDark
                                ? "bg-white/5 border-white/10 text-gray-300"
                                : "bg-black/5 border-black/10 text-gray-700"
                            }`}
                          >
                            {h}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <Footer startAnimation={true} />
    </main>
  );
}
