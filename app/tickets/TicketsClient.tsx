"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import Footer from "../components/Footer";
import { motion, AnimatePresence } from "framer-motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { useAuth, UserButton } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import BookingModal from "./components/BookingModal";

gsap.registerPlugin(ScrollTrigger);

interface TicketCategory {
  type: string;
  price: string;
  numericPrice: number;
  description: string;
  soldOut: boolean;
  disabled: boolean;
}

const tickets: TicketCategory[] = [
  {
    type: "Attendees",
    price: "₹599",
    numericPrice: 599,
    description: "Access for general public and all attendees.",
    soldOut: false,
    disabled: false,
  },
  {
    type: "Impact College Students",
    price: "₹499",
    numericPrice: 499,
    description: "Access for students with a valid USN.",
    soldOut: false,
    disabled: false,
  }
];

const faqs = [
  {
    question: "How can I find out more about the speakers or the event schedule?",
    answer: "You can visit the TEDxICEAS website or follow our social media channels for updates on the event schedule and speaker lineup.",
  },
  {
    question: "Is there a limit to the number of tickets I can buy?",
    answer: "Yes, you can purchase up to 5 tickets per transaction. If you need more, you can make another purchase.",
  },
  {
    question: "When will I receive my ticket?",
    answer: "Once payment is completed and verified by our admins, your e-ticket code will be sent to your registered email within 1-2 days. Please check your spam/junk folder.",
  },
  {
    question: "Who can I contact for ticket-related issues?",
    answer: "For any ticket-related inquiries, message or call Thejaswin P - +91 98457 14699",
  },
  {
    question: "What do I need to bring to the event?",
    answer: "Bring a digital copy of your e-ticket code received on email, and a Student ID if you registered under the student category.",
  },
];

export default function TicketsPage() {
  const { isSignedIn } = useAuth();
  const router = useRouter();

  const [footerInView, setFooterInView] = useState(false);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);
  const footerRef = useRef<HTMLDivElement>(null);

  // Booking Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<TicketCategory | null>(null);

  const toggleFaq = (index: number) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  useGSAP(() => {
    const tl = gsap.timeline();

    // Intro Animation: Title & Subtitle
    tl.fromTo(
      titleRef.current,
      { y: 100, opacity: 0, clipPath: "polygon(0 100%, 100% 100%, 100% 100%, 0 100%)" },
      {
        y: 0,
        opacity: 1,
        clipPath: "polygon(0 0, 100% 0, 100% 100%, 0 100%)",
        duration: 0.8,
        ease: "power4.out"
      }
    ).fromTo(
      subtitleRef.current,
      { y: 20, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.8, ease: "power2.out" },
    ).fromTo(
      ".ticket-card",
      {
        y: 80,
        opacity: 0,
        scale: 0.9,
        rotateX: -15,
        transformPerspective: 1000
      },
      {
        y: 0,
        opacity: 1,
        scale: 1,
        rotateX: 0,
        duration: 0.5,
        ease: "power3.out",
        scrollTrigger: {
          trigger: cardsRef.current,
          start: "top 85%",
        },
      },
    );

    ScrollTrigger.create({
      trigger: footerRef.current,
      start: "top 80%",
      onEnter: () => setFooterInView(true),
    });

  }, { scope: containerRef });

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Handle booking start
  const handleBookNow = (ticket: TicketCategory) => {
    if (!isSignedIn) {
      router.push("/sign-in?redirect_url=/tickets");
      return;
    }
    setSelectedTicket(ticket);
    setIsModalOpen(true);
  };

  // Close modal
  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedTicket(null);
  };

  return (
    <main ref={containerRef} className="min-h-screen bg-black text-white selection:bg-[#EB0028] selection:text-white overflow-x-hidden">
      {/* Back Button */}
      <div className="absolute top-8 left-8 z-50">
        <Link href="/">
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/20 text-white/80 hover:text-white hover:border-[#EB0028] transition bg-black/50 backdrop-blur-md cursor-pointer"
          >
            <ArrowLeft size={16} />
            <span className="font-clash text-sm tracking-wide hidden sm:inline">Back to Home</span>
          </motion.div>
        </Link>
      </div>

      {/* Top Right User Controls */}
      <div className="absolute top-8 right-8 z-50 flex items-center gap-4">
        {isSignedIn ? (
          <>
            <Link href="/my-tickets">
              <motion.div
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/20 text-white/80 hover:text-white hover:border-[#EB0028] transition bg-black/50 backdrop-blur-md cursor-pointer"
              >
                <span className="font-clash text-sm tracking-wide">My Tickets</span>
              </motion.div>
            </Link>
            <UserButton />
          </>
        ) : (
          <Link href="/sign-in?redirect_url=/tickets">
            <motion.div
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/20 text-white/80 hover:text-white hover:border-[#EB0028] transition bg-black/50 backdrop-blur-md cursor-pointer"
            >
              <span className="font-clash text-sm tracking-wide">Sign In</span>
            </motion.div>
          </Link>
        )}
      </div>

      {/* Background Noise & Texture */}
      <div className="fixed inset-0 z-0 pointer-events-none opacity-20" style={{ backgroundImage: "url('/noise.svg')" }}></div>
      <div className="fixed inset-0 z-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-gray-900 via-black to-black opacity-80 pointer-events-none"></div>

      <div className="relative z-10 pt-32 pb-20 px-6 md:px-24 max-w-[1440px] mx-auto min-h-screen flex flex-col justify-center">

        {/* Header */}
        <div className="text-center mb-20">
          <h1 ref={titleRef} className="font-orbitron font-black text-5xl md:text-7xl lg:text-8xl tracking-tight text-transparent bg-clip-text bg-gradient-to-b from-white to-gray-500">
            GET YOUR <span className="text-[#EB0028]">TICKETS</span>
          </h1>
          <p ref={subtitleRef} className="mt-6 font-clash text-gray-400 text-lg md:text-xl max-w-2xl mx-auto">
            Secure your spot at <span className="font-tedxiceas">TEDxICEAS</span>. Choose your category and join us for an unforgettable experience.
          </p>
        </div>

        {/* Ticket Cards Grid */}
        <div ref={cardsRef} className="flex flex-wrap justify-center gap-6 mb-32 max-w-7xl mx-auto">
          {tickets.map((ticket, index) => (
            <motion.div
              key={index}
              className="ticket-card opacity-0 relative group p-8 border backdrop-blur-sm flex flex-col justify-between min-h-[400px] w-full sm:w-[calc(50%-12px)] lg:w-[calc(33.333%-16px)] transition-all duration-300 bg-black/50 border-white/20 hover:border-white/50"
            >
              {/* Card Content */}
              <div>
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-orbitron font-bold text-2xl tracking-wider text-white">
                    {ticket.type}
                  </h3>
                </div>

                <div className="h-0.5 w-16 mb-6 bg-white/50"></div>

                <div className="flex flex-col mb-4">
                  <p className="font-clash text-5xl font-semibold text-white">
                    {ticket.price}
                  </p>
                </div>

                <p className="font-clash text-gray-400 leading-relaxed text-lg">
                  {ticket.description}
                </p>
              </div>

              <button
                onClick={() => handleBookNow(ticket)}
                disabled={ticket.soldOut || ticket.disabled}
                className={`w-full py-4 bg-transparent border font-clash font-medium tracking-wide transition-colors duration-300 uppercase mt-8
                  ${ticket.soldOut || ticket.disabled
                    ? 'border-white/20 text-white/40 cursor-not-allowed hidden'
                    : 'border-[#EB0028] text-white hover:bg-[#EB0028] cursor-pointer'
                  }
                `}
              >
                {ticket.soldOut ? 'Sold Out' : ticket.disabled ? 'Coming Soon' : 'Book Now'}
              </button>

              {/* Decorative Corners */}
              <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-white/30 group-hover:border-[#EB0028] transition-colors"></div>
              <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-white/30 group-hover:border-[#EB0028] transition-colors"></div>

              {/* Sold Out Overlay */}
              {ticket.soldOut && (
                <div className="absolute inset-0 bg-black/50 z-50 flex items-center justify-center backdrop-blur-[2px]">
                  <div className="-rotate-[30deg] opacity-90 text-center">
                    <span className="font-orbitron font-black text-4xl md:text-5xl">
                      <span className="text-white">SOLD</span> <span className="text-[#EB0028]">OUT</span>
                    </span>
                  </div>
                </div>
              )}
            </motion.div>
          ))}
        </div>

        {/* FAQ Section */}
        <div className="text-center pt-20 border-t border-white/10 mt-20">
          <h2 className="font-orbitron font-bold text-3xl md:text-4xl mb-12 tracking-wide text-white/80 uppercase">
            Frequently Asked <span className="text-[#EB0028]">Questions</span>
          </h2>

          <div className="max-w-4xl mx-auto text-left flex flex-col">
            {faqs.map((faq, index) => (
              <div key={index} className="border-b border-white/10 last:border-none">
                <button
                  onClick={() => toggleFaq(index)}
                  className="w-full py-6 flex items-center justify-between gap-4 group hover:bg-white/5 transition-colors px-4 cursor-pointer"
                >
                  <span className="font-clash font-medium text-lg md:text-xl text-white/90 group-hover:text-white text-left">
                    {faq.question}
                  </span>
                  <div className={`shrink-0 transition-transform duration-300 ${openFaqIndex === index ? 'rotate-180' : ''}`}>
                    {openFaqIndex === index ? (
                      <motion.div>
                        <ArrowLeft className="w-5 h-5 text-[#EB0028] rotate-90" />
                      </motion.div>
                    ) : (
                      <motion.div>
                        <ArrowLeft className="w-5 h-5 text-white/50 group-hover:text-white -rotate-90" />
                      </motion.div>
                    )}
                  </div>
                </button>
                <AnimatePresence>
                  {openFaqIndex === index && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                      className="overflow-hidden"
                    >
                      <p className="font-clash text-gray-400 pt-2 pb-6 px-4 leading-relaxed">
                        {faq.answer}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>

      </div>

      <div ref={footerRef} className="mt-32 lg:mt-0">
        <Footer startAnimation={footerInView} />
      </div>

      {/* Multistep Booking Modal */}
      <AnimatePresence>
        {isModalOpen && selectedTicket && (
          <BookingModal
            isOpen={isModalOpen}
            onClose={closeModal}
            selectedTicket={selectedTicket}
          />
        )}
      </AnimatePresence>
    </main>
  );
}