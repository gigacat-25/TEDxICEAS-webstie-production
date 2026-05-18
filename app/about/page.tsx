"use client";

import { useTheme } from "../components/ThemeContext";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Image from "next/image";
import Link from "next/link";

export default function AboutPage() {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <main className={`min-h-screen ${isDark ? "bg-black text-white" : "bg-white text-black"}`}>
      <Navbar startAnimation={true} />

      <div className="pt-32 pb-20 px-6 md:px-16 max-w-5xl mx-auto">
        {/* What is TEDxICEAS */}
        <section className="mb-20">
          <h2 className="font-clash text-2xl md:text-3xl font-bold mb-8 flex items-center gap-3">
            <span>What is</span>
            <Image
              src={isDark ? "/logo-white.png" : "/logo-black.png"}
              alt="TEDxICEAS"
              className="h-[40px] w-auto"
              width={200}
              height={40}
            />
          </h2>
          <div className={`p-6 md:p-8 rounded-lg ${isDark ? "bg-white/5" : "bg-black/5"}`}>
            <p className="font-clash text-base md:text-lg leading-relaxed mb-4">
              <span className="font-bold">TEDxICEAS</span> is a dynamic platform where the brightest minds come together to share ideas that have the power to inspire meaningful change. Hosted at Impact College of Engineering and Applied Sciences, Bengaluru, TEDxICEAS brings together thinkers, innovators, and change-makers for a day of inspiration and connection.
            </p>
          </div>
        </section>

        {/* What is TEDx */}
        <section className="mb-20">
          <h2 className="font-clash text-2xl md:text-3xl font-bold mb-4 flex items-center gap-3">
            <span>What is</span>
            <Image
              src={isDark ? "/logo-white.png" : "/logo-black.png"}
              alt="TEDx"
              className="h-[40px] w-auto"
              style={{ clipPath: "inset(0 55% 0 0)" }}
              width={400}
              height={40}
            />
          </h2>
          <p className="font-orbitron text-base md:text-lg text-[#EB0028] font-bold mb-8">
            x = independently organized TED event
          </p>
          <div className={`p-6 md:p-8 rounded-lg ${isDark ? "bg-white/5" : "bg-black/5"}`}>
            <p className="font-clash text-base md:text-lg leading-relaxed">
              In the spirit of discovering and spreading ideas, TEDx is a program of local, self-organized events that bring people together to share a TED-like experience. At a TEDx event, TED Talks video and live speakers combine to spark deep discussion and connection. These local, self-organized events are branded TEDx, where x = independently organized TED event. The TED Conference provides general guidance for the TEDx program, but individual TEDx events are self-organized. (Subject to certain rules and regulations.)
            </p>
          </div>

          {/* YouTube Video */}
          <div className="mt-8">
            <div className="relative w-full aspect-video rounded-lg overflow-hidden group cursor-pointer"
              onClick={(e) => {
                const target = e.currentTarget;
                const iframe = document.createElement("iframe");
                iframe.className = "absolute inset-0 w-full h-full";
                iframe.src = "https://www.youtube.com/embed/d0NHOpeczUU?autoplay=1";
                iframe.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture";
                iframe.allowFullscreen = true;
                target.innerHTML = "";
                target.appendChild(iframe);
              }}
            >
              <img
                src="https://img.youtube.com/vi/d0NHOpeczUU/maxresdefault.jpg"
                alt="What is TEDx?"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-[#EB0028]/90 flex items-center justify-center transition-transform duration-300 group-hover:scale-110 shadow-lg">
                  <svg className="w-6 h-6 md:w-8 md:h-8 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z"/>
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* What is TED */}
        <section className="mb-20">
          <h2 className="font-clash text-2xl md:text-3xl font-bold mb-8 flex items-center gap-3">
            <span>What is</span>
            <Image
              src="/ted-logo.svg"
              alt="TED"
              className="h-[30px] w-auto"
              width={120}
              height={40}
            />
          </h2>
          <div className={`p-6 md:p-8 rounded-lg ${isDark ? "bg-white/5" : "bg-black/5"}`}>
            <p className="font-clash text-base md:text-lg leading-relaxed mb-4">
              TED is a nonprofit, nonpartisan organization dedicated to discovering, debating and spreading ideas that spark conversation, deepen understanding and drive meaningful change. Our organization is devoted to curiosity, reason, wonder and the pursuit of knowledge — without an agenda. We welcome people from every discipline and culture who seek a deeper understanding of the world and connection with others, and we invite everyone to engage with ideas and activate them in your community.
            </p>
            <p className="font-clash text-base md:text-lg leading-relaxed mb-4">
              TED began in 1984 as a conference where Technology, Entertainment and Design converged, but today it spans a multitude of worldwide communities and initiatives exploring everything from science and business to education, arts and global issues. In addition to the TED Talks curated from our annual conferences and published on TED.com, we produce original podcasts, short video series, animated educational lessons (TED-Ed) and TV programs that are translated into more than 100 languages and distributed via partnerships around the world. Each year, thousands of independently run TEDx events bring people together to share ideas and bridge divides in communities on every continent. Through the Audacious Project, TED has helped catalyze more than $3 billion in funding for projects that seek to make the world more beautiful, sustainable and just. In 2020, TED launched Countdown, an initiative to accelerate solutions to the climate crisis and mobilize a movement for a net-zero future, and in 2023 TED launched TED Democracy to spark a new kind of conversation focused on realistic pathways towards a more vibrant and equitable future. View a full list of TED&apos;s many programs and initiatives.
            </p>
          </div>
        </section>

        {/* Follow TED */}
        <section className="mb-20">
          <h2 className="font-orbitron text-2xl md:text-3xl font-bold mb-8">
            Follow TED
          </h2>
          <div className="flex flex-wrap gap-4">
            <a
              href="https://www.facebook.com/TED"
              target="_blank"
              rel="noopener noreferrer"
              className={`flex items-center gap-3 px-5 py-3 rounded-lg font-clash text-sm transition-colors ${isDark ? "bg-white/10 hover:bg-white/20" : "bg-black/10 hover:bg-black/20"}`}
            >
              <img src="/facebook.svg" alt="Facebook" className="w-5 h-5" />
              Facebook
            </a>
            <a
              href="https://www.instagram.com/ted"
              target="_blank"
              rel="noopener noreferrer"
              className={`flex items-center gap-3 px-5 py-3 rounded-lg font-clash text-sm transition-colors ${isDark ? "bg-white/10 hover:bg-white/20" : "bg-black/10 hover:bg-black/20"}`}
            >
              <img src="/instagram.svg" alt="Instagram" className="w-5 h-5" />
              Instagram
            </a>
            <a
              href="https://www.linkedin.com/company/ted-conferences"
              target="_blank"
              rel="noopener noreferrer"
              className={`flex items-center gap-3 px-5 py-3 rounded-lg font-clash text-sm transition-colors ${isDark ? "bg-white/10 hover:bg-white/20" : "bg-black/10 hover:bg-black/20"}`}
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
              LinkedIn
            </a>
            <a
              href="https://www.tiktok.com/@ted"
              target="_blank"
              rel="noopener noreferrer"
              className={`flex items-center gap-3 px-5 py-3 rounded-lg font-clash text-sm transition-colors ${isDark ? "bg-white/10 hover:bg-white/20" : "bg-black/10 hover:bg-black/20"}`}
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/></svg>
              TikTok
            </a>
            <a
              href="https://x.com/TEDChampions"
              target="_blank"
              rel="noopener noreferrer"
              className={`flex items-center gap-3 px-5 py-3 rounded-lg font-clash text-sm transition-colors ${isDark ? "bg-white/10 hover:bg-white/20" : "bg-black/10 hover:bg-black/20"}`}
            >
              <img src="/twitter.svg" alt="X" className="w-5 h-5" />
              X
            </a>
          </div>
        </section>

        {/* Back to Home */}
        <div className="mt-16">
          <Link
            href="/"
            className="inline-flex items-center gap-2 font-clash text-sm text-[#EB0028] hover:underline"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
            Back to Home
          </Link>
        </div>
      </div>

      <Footer />
    </main>
  );
}
