"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowLeft, Plus, Minus, X, Upload, Check, Loader2, CreditCard } from "lucide-react";
import Link from "next/link";
import Footer from "../components/Footer";
import { motion, AnimatePresence } from "framer-motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { useAuth, UserButton } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

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
    type: "Faculty",
    price: "₹599",
    numericPrice: 599,
    description: "Access for faculty members and staff.",
    soldOut: false,
    disabled: false,
  },
  {
    type: "Student",
    price: "₹499",
    numericPrice: 499,
    description: "Access for students with valid ID.",
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
    answer: "For any ticket-related inquiries, message or call Rayif - +91 97464 02973",
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
  const [currentStep, setCurrentStep] = useState(1); // 1: Form, 2: Payment, 3: Success

  // Form Field States
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [ticketCount, setTicketCount] = useState(1);
  const [screenshot, setScreenshot] = useState<File | null>(null);
  const [screenshotPreview, setScreenshotPreview] = useState<string | null>(null);
  const [usn, setUsn] = useState("");
  const [additionalAttendees, setAdditionalAttendees] = useState<{ name: string; email: string; usn: string }[]>([]);
  const [isValidatingUsn, setIsValidatingUsn] = useState(false);
  const [usnStatus, setUsnStatus] = useState<"idle" | "verifying" | "valid" | "invalid">("idle");
  const [usnStatusMessage, setUsnStatusMessage] = useState("");

  // Debounced effect for checking USN
  useEffect(() => {
    if (selectedTicket?.type !== "Student") {
      setUsnStatus("idle");
      setUsnStatusMessage("");
      return;
    }

    const cleanUsn = usn.trim();
    if (cleanUsn.length < 5) {
      setUsnStatus("idle");
      setUsnStatusMessage("");
      return;
    }

    setUsnStatus("verifying");
    setUsnStatusMessage("Verifying USN...");

    const delayDebounce = setTimeout(async () => {
      try {
        const res = await fetch(`/api/tickets/verify-usn?usn=${encodeURIComponent(cleanUsn)}`);
        const data = await res.json();
        
        if (res.ok && data.success) {
          if (data.valid) {
            if (data.alreadyRegistered) {
              setUsnStatus("invalid");
              setUsnStatusMessage("This USN is already registered.");
            } else {
              setUsnStatus("valid");
              setUsnStatusMessage("Valid student USN!");
            }
          } else {
            setUsnStatus("invalid");
            setUsnStatusMessage("Invalid or unauthorized student USN.");
          }
        } else {
          setUsnStatus("invalid");
          setUsnStatusMessage("Error checking USN.");
        }
      } catch (err) {
        console.error(err);
        setUsnStatus("invalid");
        setUsnStatusMessage("Connection error.");
      }
    }, 600); // 600ms debounce

    return () => clearTimeout(delayDebounce);
  }, [usn, selectedTicket]);

  // Sync additional attendees array size to ticketCount - 1
  useEffect(() => {
    setAdditionalAttendees((prev) => {
      const targetLength = ticketCount - 1;
      if (targetLength <= 0) return [];
      
      const newAttendees = [...prev];
      if (newAttendees.length < targetLength) {
        while (newAttendees.length < targetLength) {
          newAttendees.push({ name: "", email: "", usn: "" });
        }
      } else if (newAttendees.length > targetLength) {
        newAttendees.length = targetLength;
      }
      return newAttendees;
    });
  }, [ticketCount]);

  // API Submission States
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);

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
    setCurrentStep(1);
    setName("");
    setEmail("");
    setPhone("");
    setTicketCount(1);
    setUsn("");
    setUsnStatus("idle");
    setUsnStatusMessage("");
    setAdditionalAttendees([]);
    setScreenshot(null);
    setScreenshotPreview(null);
    setErrorMessage("");
    setAgreedToTerms(false);
  };

  // Close modal
  const closeModal = () => {
    if (isSubmitting) return; // Prevent closing while API request is in progress
    setIsModalOpen(false);
    setSelectedTicket(null);
  };

  // Handle file select
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (!file.type.startsWith("image/")) {
        setErrorMessage("Please upload an image file (PNG, JPG, JPEG, WEBP).");
        return;
      }
      setScreenshot(file);
      setErrorMessage("");
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setScreenshotPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Validate Step 1
  const handleNextStep = () => {
    if (!name.trim()) {
      setErrorMessage("Please enter your full name.");
      return;
    }
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setErrorMessage("Please enter a valid email address.");
      return;
    }
    if (!phone.trim() || phone.trim().length < 10) {
      setErrorMessage("Please enter a valid phone number (at least 10 digits).");
      return;
    }

    // Validate USN if Category is Student
    if (selectedTicket?.type === "Student") {
      if (!usn.trim()) {
        setErrorMessage("Please enter your University Seat Number (USN).");
        return;
      }
      if (usnStatus === "verifying") {
        setErrorMessage("Please wait while we verify your USN.");
        return;
      }
      if (usnStatus !== "valid") {
        setErrorMessage(usnStatusMessage || "Please enter a valid, authorized Student USN.");
        return;
      }
    }

    // Validate additional attendees
    if (ticketCount > 1) {
      for (let i = 0; i < additionalAttendees.length; i++) {
        const att = additionalAttendees[i];
        if (!att.name.trim()) {
          setErrorMessage(`Please enter the full name for Attendee #${i + 2}.`);
          return;
        }
        if (!att.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(att.email)) {
          setErrorMessage(`Please enter a valid email address for Attendee #${i + 2}.`);
          return;
        }
        if (selectedTicket?.type === "Student") {
          if (!att.usn || !att.usn.trim()) {
            setErrorMessage(`Please enter the University Seat Number (USN) for Attendee #${i + 2}.`);
            return;
          }
        }
      }
    }

    if (!agreedToTerms) {
      setErrorMessage("You must agree to the Terms & Conditions and DPDP Privacy Policy to proceed.");
      return;
    }
    setErrorMessage("");
    setCurrentStep(2);
  };

  // Handle registration API submission
  const handleSubmitBooking = async () => {
    if (!screenshot || !selectedTicket) {
      setErrorMessage("Please upload your payment transaction screenshot.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage("");

    try {
      const totalAmount = selectedTicket.numericPrice * ticketCount;
      const formData = new FormData();
      formData.append("name", name);
      formData.append("email", email);
      formData.append("phone", phone);
      formData.append("category", selectedTicket.type);
      formData.append("ticketCount", ticketCount.toString());
      formData.append("pricePaid", totalAmount.toString());
      formData.append("screenshot", screenshot);

      if (selectedTicket.type === "Student") {
        formData.append("usn", usn.trim().toUpperCase());
      }

      if (ticketCount > 1) {
        formData.append("additionalAttendees", JSON.stringify(additionalAttendees));
      }

      const response = await fetch("/api/tickets/register", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setCurrentStep(3);
      } else {
        setErrorMessage(data.error || "Failed to submit registration. Please try again.");
      }
    } catch (err) {
      console.error(err);
      setErrorMessage("An unexpected network error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Dynamic values
  const upiId = process.env.NEXT_PUBLIC_UPI_ID || "tedxiceas@upi";
  const upiName = process.env.NEXT_PUBLIC_UPI_NAME || "TEDxICEAS";
  const totalAmount = selectedTicket ? selectedTicket.numericPrice * ticketCount : 0;
  const upiLink = selectedTicket 
    ? `upi://pay?pa=${upiId}&pn=${encodeURIComponent(upiName)}&am=${totalAmount}&cu=INR` 
    : "";
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(upiLink)}`;

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
                      <Minus size={20} className="text-[#EB0028]" />
                    ) : (
                      <Plus size={20} className="text-white/50 group-hover:text-white" />
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
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto"
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 350 }}
              className="relative w-full max-w-2xl bg-zinc-950 border border-white/10 rounded-2xl p-6 md:p-8 overflow-hidden shadow-2xl my-8"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Corner Accents */}
              <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-[#EB0028]"></div>
              <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-[#EB0028]"></div>

              {/* Close Button */}
              <button
                onClick={closeModal}
                disabled={isSubmitting}
                className="absolute top-6 right-6 text-white/50 hover:text-white hover:bg-white/10 p-2 rounded-full transition-colors cursor-pointer"
              >
                <X size={20} />
              </button>

              {/* Modal Header */}
              <div className="mb-6 border-b border-white/10 pb-4">
                <span className="text-xs uppercase tracking-widest text-[#EB0028] font-orbitron font-semibold">
                  TEDxICEAS Ticket Registration
                </span>
                <h2 className="text-2xl md:text-3xl font-orbitron font-bold text-white mt-1">
                  {selectedTicket.type} Pass
                </h2>
              </div>

              {errorMessage && (
                <div className="mb-6 p-4 bg-red-950/30 border border-red-500/50 rounded-lg text-red-400 font-clash text-sm">
                  {errorMessage}
                </div>
              )}

              {/* Steps Indicator */}
              <div className="flex items-center gap-4 mb-8">
                <div className="flex items-center gap-2">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-orbitron text-xs font-bold transition-all duration-300
                    ${currentStep >= 1 ? 'bg-[#EB0028] text-white' : 'bg-zinc-900 text-white/40 border border-white/10'}
                  `}>
                    1
                  </div>
                  <span className={`font-clash text-xs tracking-wider uppercase hidden sm:inline ${currentStep >= 1 ? 'text-white' : 'text-white/40'}`}>
                    Details
                  </span>
                </div>
                <div className="h-px bg-white/10 flex-1"></div>
                <div className="flex items-center gap-2">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-orbitron text-xs font-bold transition-all duration-300
                    ${currentStep >= 2 ? 'bg-[#EB0028] text-white' : 'bg-zinc-900 text-white/40 border border-white/10'}
                  `}>
                    2
                  </div>
                  <span className={`font-clash text-xs tracking-wider uppercase hidden sm:inline ${currentStep >= 2 ? 'text-white' : 'text-white/40'}`}>
                    Payment
                  </span>
                </div>
                <div className="h-px bg-white/10 flex-1"></div>
                <div className="flex items-center gap-2">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-orbitron text-xs font-bold transition-all duration-300
                    ${currentStep >= 3 ? 'bg-[#EB0028] text-white' : 'bg-zinc-900 text-white/40 border border-white/10'}
                  `}>
                    3
                  </div>
                  <span className={`font-clash text-xs tracking-wider uppercase hidden sm:inline ${currentStep >= 3 ? 'text-white' : 'text-white/40'}`}>
                    Done
                  </span>
                </div>
              </div>

              {/* Step 1: Attendee Info */}
              {currentStep === 1 && (
                <div className="space-y-5">
                  <div className="space-y-2">
                    <label className="block text-sm font-clash font-medium text-white/75">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. John Doe"
                      className="w-full bg-zinc-900 border border-white/10 rounded-lg py-3 px-4 text-white font-clash placeholder-white/30 focus:outline-none focus:border-[#EB0028] transition-colors"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="block text-sm font-clash font-medium text-white/75">
                        Email Address
                      </label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="john@example.com"
                        className="w-full bg-zinc-900 border border-white/10 rounded-lg py-3 px-4 text-white font-clash placeholder-white/30 focus:outline-none focus:border-[#EB0028] transition-colors"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-sm font-clash font-medium text-white/75">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="e.g. 9876543210"
                        className="w-full bg-zinc-900 border border-white/10 rounded-lg py-3 px-4 text-white font-clash placeholder-white/30 focus:outline-none focus:border-[#EB0028] transition-colors"
                      />
                    </div>
                  </div>

                  {/* Student USN field */}
                  {selectedTicket.type === "Student" && (
                    <div className="space-y-2 mt-4">
                      <label className="block text-sm font-clash font-medium text-white/75">
                        University Seat Number (USN)
                      </label>
                      <input
                        type="text"
                        required
                        value={usn}
                        onChange={(e) => setUsn(e.target.value)}
                        placeholder="e.g. 1MS21CS001"
                        className={`w-full bg-zinc-900 border rounded-lg py-3 px-4 text-white font-clash placeholder-white/30 uppercase tracking-wider focus:outline-none transition-colors
                          ${usnStatus === "valid" ? "border-emerald-500/50 focus:border-emerald-500" :
                            usnStatus === "invalid" ? "border-red-500/50 focus:border-red-500" :
                            usnStatus === "verifying" ? "border-amber-500/50 focus:border-amber-500" :
                            "border-white/10 focus:border-[#EB0028]"}
                        `}
                      />
                      {usnStatusMessage ? (
                        <p className={`text-xs font-semibold font-clash mt-1 flex items-center gap-1.5
                          ${usnStatus === "valid" ? "text-emerald-400" :
                            usnStatus === "invalid" ? "text-red-400" :
                            "text-amber-400 animate-pulse"}
                        `}>
                          {usnStatus === "verifying" && <Loader2 size={12} className="animate-spin text-amber-400" />}
                          {usnStatus === "valid" && <Check size={12} className="text-emerald-400" />}
                          {usnStatus === "invalid" && <X size={12} className="text-red-400" />}
                          {usnStatusMessage}
                        </p>
                      ) : (
                        <p className="text-[10px] text-white/40 font-clash">
                          Only pre-authorized student USNs are permitted to purchase Student passes.
                        </p>
                      )}
                    </div>
                  )}

                  {/* Quantity Selector */}
                  <div className="bg-zinc-900/50 border border-white/5 rounded-xl p-4 flex items-center justify-between mt-6">
                    <div>
                      <h4 className="font-clash font-semibold text-white">Quantity</h4>
                      <p className="text-xs text-white/50 font-clash mt-0.5">
                        {selectedTicket.type === "Student"
                          ? "Student tickets are limited to 1 per booking"
                          : "Maximum 5 tickets per booking"}
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <button
                        onClick={() => setTicketCount(Math.max(1, ticketCount - 1))}
                        disabled={ticketCount <= 1 || selectedTicket.type === "Student"}
                        className="w-10 h-10 rounded-lg border border-white/10 flex items-center justify-center text-white hover:bg-white/10 disabled:opacity-30 disabled:hover:bg-transparent transition-colors cursor-pointer"
                      >
                        <Minus size={16} />
                      </button>
                      <span className="font-orbitron font-bold text-lg text-white w-6 text-center">
                        {selectedTicket.type === "Student" ? 1 : ticketCount}
                      </span>
                      <button
                        onClick={() => setTicketCount(Math.min(5, ticketCount + 1))}
                        disabled={ticketCount >= 5 || selectedTicket.type === "Student"}
                        className="w-10 h-10 rounded-lg border border-white/10 flex items-center justify-center text-white hover:bg-white/10 disabled:opacity-30 disabled:hover:bg-transparent transition-colors cursor-pointer"
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                  </div>

                  {/* Additional Attendees Fields */}
                  {ticketCount > 1 && (
                    <div className="space-y-4 pt-4 border-t border-white/10">
                      <h4 className="font-orbitron font-bold text-xs uppercase tracking-wider text-white/50">
                        Additional Attendee Details
                      </h4>
                      <div className="space-y-3 max-h-[220px] overflow-y-auto pr-2 custom-scrollbar">
                        {additionalAttendees.map((att, idx) => (
                          <div key={idx} className="p-4 bg-zinc-900/60 border border-white/5 rounded-xl space-y-3">
                            <p className="font-clash text-xs font-semibold text-[#EB0028] uppercase tracking-wider">
                              Attendee #{idx + 2}
                            </p>
                            <div className={`grid grid-cols-1 ${selectedTicket.type === "Student" ? "md:grid-cols-3" : "md:grid-cols-2"} gap-3`}>
                              <div className="space-y-1">
                                <label className="block text-[11px] font-clash text-white/60">
                                  Full Name
                                </label>
                                <input
                                  type="text"
                                  required
                                  value={att.name}
                                  onChange={(e) => {
                                    const updated = [...additionalAttendees];
                                    updated[idx].name = e.target.value;
                                    setAdditionalAttendees(updated);
                                  }}
                                  placeholder="Attendee Name"
                                  className="w-full bg-zinc-950 border border-white/5 rounded-lg py-2 px-3 text-xs text-white font-clash placeholder-white/20 focus:outline-none focus:border-[#EB0028] transition-colors"
                                />
                              </div>
                              <div className="space-y-1">
                                <label className="block text-[11px] font-clash text-white/60">
                                  Email Address
                                </label>
                                <input
                                  type="email"
                                  required
                                  value={att.email}
                                  onChange={(e) => {
                                    const updated = [...additionalAttendees];
                                    updated[idx].email = e.target.value;
                                    setAdditionalAttendees(updated);
                                  }}
                                  placeholder="attendee@example.com"
                                  className="w-full bg-zinc-950 border border-white/5 rounded-lg py-2 px-3 text-xs text-white font-clash placeholder-white/20 focus:outline-none focus:border-[#EB0028] transition-colors"
                                />
                              </div>
                              {selectedTicket.type === "Student" && (
                                <div className="space-y-1">
                                  <label className="block text-[11px] font-clash text-white/60">
                                    USN
                                  </label>
                                  <input
                                    type="text"
                                    required
                                    value={att.usn}
                                    onChange={(e) => {
                                      const updated = [...additionalAttendees];
                                      updated[idx].usn = e.target.value;
                                      setAdditionalAttendees(updated);
                                    }}
                                    placeholder="Attendee USN"
                                    className="w-full bg-zinc-950 border border-white/5 rounded-lg py-2 px-3 text-xs text-white font-clash placeholder-white/20 uppercase tracking-wider focus:outline-none focus:border-[#EB0028] transition-colors"
                                  />
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Price Calculation Summary */}
                  <div className="border-t border-white/10 pt-4 flex justify-between items-center text-lg mt-6">
                    <span className="font-clash text-white/60">Total Amount:</span>
                    <span className="font-orbitron font-black text-2xl text-[#EB0028]">
                      ₹{selectedTicket.numericPrice * ticketCount}
                    </span>
                  </div>

                  {/* Terms and Consent Checkbox */}
                  <div className="bg-zinc-900/40 border border-white/5 rounded-xl p-4 space-y-3 mt-6">
                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        id="termsConsent"
                        checked={agreedToTerms}
                        onChange={(e) => setAgreedToTerms(e.target.checked)}
                        className="mt-1 cursor-pointer w-4 h-4 rounded accent-[#EB0028] border-white/20 bg-zinc-950 text-white"
                      />
                      <label htmlFor="termsConsent" className="font-clash text-[11px] text-white/70 leading-relaxed select-none cursor-pointer">
                        I agree to the <button type="button" onClick={() => setShowTermsModal(true)} className="text-[#EB0028] hover:underline font-semibold cursor-pointer">Terms & Conditions</button> and give my explicit consent to process my data in accordance with the <button type="button" onClick={() => setShowTermsModal(true)} className="text-[#EB0028] hover:underline font-semibold cursor-pointer">DPDP Privacy Notice</button>. I understand that <strong>tickets are non-refundable</strong>.
                      </label>
                    </div>
                  </div>

                  {/* Step 1 Actions */}
                  <div className="pt-6">
                    <button
                      onClick={handleNextStep}
                      disabled={isValidatingUsn}
                      className="w-full bg-[#EB0028] hover:bg-[#c30020] disabled:bg-zinc-800 disabled:text-white/45 disabled:cursor-not-allowed text-white font-clash py-4 rounded-lg font-medium tracking-wide uppercase transition-colors duration-300 flex items-center justify-center gap-2 cursor-pointer"
                    >
                      {isValidatingUsn ? (
                        <>
                          <Loader2 size={16} className="animate-spin" />
                          <span>Verifying Student USN...</span>
                        </>
                      ) : (
                        <span>Proceed to Payment</span>
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* Step 2: Payment Section */}
              {currentStep === 2 && (
                <div className="space-y-6">
                  {/* Payment Details Container */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                    {/* QR Code Container */}
                    <div className="flex flex-col items-center justify-center bg-white p-4 rounded-xl shadow-inner border border-zinc-800">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={qrCodeUrl}
                        alt="UPI Payment QR Code"
                        className="w-48 h-48 md:w-56 md:h-56 select-none"
                      />
                      <span className="text-[10px] text-zinc-500 font-sans tracking-wide mt-2">
                        Scan QR code with any UPI App
                      </span>
                    </div>

                    {/* Instruction Panel */}
                    <div className="space-y-4">
                      <div className="bg-zinc-900 border border-white/5 rounded-xl p-4 space-y-2">
                        <div className="flex items-center gap-2 text-white/70 text-xs uppercase tracking-wider font-orbitron font-bold">
                          <CreditCard size={14} className="text-[#EB0028]" />
                          Payment Details
                        </div>
                        <div className="space-y-1 font-clash text-sm">
                          <div className="flex justify-between">
                            <span className="text-white/50">Amount:</span>
                            <span className="text-white font-semibold">₹{totalAmount}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-white/50">UPI ID:</span>
                            <span className="text-white font-mono select-all">{upiId}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-white/50">Name:</span>
                            <span className="text-white">{upiName}</span>
                          </div>
                        </div>
                      </div>

                      <div className="text-xs text-white/50 font-clash leading-relaxed">
                        <p className="font-semibold text-white/80 mb-1">Steps:</p>
                        1. Scan the QR code or pay to the UPI ID.<br />
                        2. Transfer the exact amount of <strong className="text-white">₹{totalAmount}</strong>.<br />
                        3. Take a screenshot showing transaction status, amount, and UTR/Transaction ID.<br />
                        4. Upload the screenshot below and click Submit.
                      </div>
                    </div>
                  </div>

                  {/* Screenshot Upload Container */}
                  <div className="space-y-2">
                    <label className="block text-sm font-clash font-medium text-white/75">
                      Upload Payment Screenshot
                    </label>

                    <div className="relative border-2 border-dashed border-white/10 rounded-xl p-6 hover:border-[#EB0028] transition-colors bg-zinc-900/30 flex flex-col items-center justify-center group">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        disabled={isSubmitting}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10 disabled:cursor-not-allowed"
                      />
                      
                      {screenshotPreview ? (
                        <div className="text-center space-y-3">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={screenshotPreview}
                            alt="Screenshot Preview"
                            className="max-h-36 mx-auto rounded-lg border border-white/10 shadow-lg object-contain"
                          />
                          <p className="text-xs text-[#EB0028] font-clash font-semibold flex items-center justify-center gap-1">
                            <Check size={14} /> Ready to submit: {screenshot?.name}
                          </p>
                        </div>
                      ) : (
                        <div className="text-center space-y-3 py-2">
                          <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mx-auto text-white/50 group-hover:text-[#EB0028] group-hover:bg-[#EB0028]/10 transition-colors">
                            <Upload size={20} />
                          </div>
                          <div>
                            <p className="font-clash text-sm text-white font-medium">
                              Click or Drag screenshot image to upload
                            </p>
                            <p className="font-clash text-xs text-white/40 mt-1">
                              Supports PNG, JPG, JPEG, WEBP
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Step 2 Actions */}
                  <div className="pt-6 grid grid-cols-2 gap-4">
                    <button
                      onClick={() => setCurrentStep(1)}
                      disabled={isSubmitting}
                      className="w-full bg-transparent border border-white/20 hover:border-white text-white font-clash py-4 rounded-lg font-medium tracking-wide uppercase transition-colors duration-300 cursor-pointer disabled:opacity-50"
                    >
                      Back
                    </button>
                    <button
                      onClick={handleSubmitBooking}
                      disabled={isSubmitting || !screenshot}
                      className="w-full bg-[#EB0028] hover:bg-[#c30020] disabled:bg-zinc-800 disabled:text-white/45 disabled:border-transparent disabled:cursor-not-allowed text-white font-clash py-4 rounded-lg font-medium tracking-wide uppercase transition-colors duration-300 flex items-center justify-center gap-2 cursor-pointer"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 size={16} className="animate-spin" />
                          <span>Submitting...</span>
                        </>
                      ) : (
                        <span>Submit Booking</span>
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* Step 3: Success Screen */}
              {currentStep === 3 && (
                <div className="text-center py-10 space-y-6">
                  <div className="w-20 h-20 rounded-full bg-emerald-500/10 border-2 border-emerald-500 flex items-center justify-center mx-auto text-emerald-500">
                    <Check size={40} className="stroke-[3]" />
                  </div>

                  <div className="space-y-2">
                    <h3 className="font-orbitron font-bold text-2xl text-white">
                      Registration Submitted!
                    </h3>
                    <p className="font-clash text-white/60 max-w-md mx-auto leading-relaxed">
                      Thank you, <strong className="text-white">{name}</strong>. We have received your payment proof details.
                    </p>
                  </div>

                  <div className="bg-zinc-900 border border-white/5 rounded-xl p-5 max-w-md mx-auto text-left space-y-3">
                    <p className="font-clash text-sm text-white/80 leading-relaxed">
                      🎟️ A **Payment Verification Pending** confirmation email has been dispatched to your email address: <strong className="text-white">{email}</strong>.
                    </p>
                    <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-2.5 text-[11px] text-amber-300 font-clash leading-normal">
                      ⚠️ <strong>Check your Spam or Promotions folder:</strong> Automated emails can sometimes be misclassified. If you don't receive it in 5 minutes, check your Spam folder.
                    </div>
                    <div className="h-px bg-white/5"></div>
                    <p className="font-clash text-xs text-white/50 leading-relaxed">
                      Our support team will verify your transaction. Once verified, a second confirmation email containing your official entry ticket code will be sent to you (usually within 1-2 days).
                    </p>
                  </div>

                  <div className="pt-6">
                    <button
                      onClick={closeModal}
                      className="px-8 py-3 bg-white text-black hover:bg-white/90 rounded-lg font-clash font-semibold transition-colors cursor-pointer"
                    >
                      Close Window
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Terms & DPDP Privacy Modal */}
      <AnimatePresence>
        {showTermsModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/95 backdrop-blur-md overflow-y-auto"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-2xl bg-zinc-950 border border-white/10 rounded-2xl p-6 md:p-8 shadow-2xl flex flex-col max-h-[85vh] z-[101]"
            >
              {/* Header */}
              <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-6 shrink-0">
                <h3 className="font-orbitron font-bold text-xl text-white tracking-wide uppercase">
                  Terms & <span className="text-[#EB0028]">Privacy Notice</span>
                </h3>
                <button
                  onClick={() => setShowTermsModal(false)}
                  className="text-white/40 hover:text-white transition-colors cursor-pointer"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Scrollable Content */}
              <div className="overflow-y-auto space-y-6 font-clash text-xs md:text-sm text-white/70 leading-relaxed pr-2 scrollbar-thin scrollbar-thumb-white/10">
                
                {/* Terms and Conditions Section */}
                <div className="space-y-3">
                  <h4 className="font-orbitron font-semibold text-white text-sm md:text-base tracking-wide uppercase border-b border-white/5 pb-1">
                    1. Terms of Booking
                  </h4>
                  <ul className="list-disc pl-5 space-y-2">
                    <li><strong>Non-Refundable Policy:</strong> All ticket bookings are final. Under no circumstances will tickets be refunded, cancelled, or returned.</li>
                    <li><strong>Admission Verification:</strong> Event organizers reserve the right of admission. Student ticket holders must present a valid physical student ID card at the registration desk. Failure to present a valid ID will result in the ticket being voided without a refund.</li>
                    <li><strong>Non-Transferable:</strong> Tickets are non-transferable. Only the attendee whose name is printed on the pass will be permitted entry.</li>
                  </ul>
                </div>

                {/* DPDP Act Section */}
                <div className="space-y-3">
                  <h4 className="font-orbitron font-semibold text-white text-sm md:text-base tracking-wide uppercase border-b border-white/5 pb-1">
                    2. DPDP Act (2023) Consent & Privacy Notice
                  </h4>
                  <p>
                    In compliance with the <strong>Digital Personal Data Protection (DPDP) Act, 2023 (India)</strong>, we are committed to safeguarding your personal data. By submitting this form, you provide your explicit and informed consent to the processing of your personal data as outlined below:
                  </p>
                  <ul className="list-disc pl-5 space-y-2">
                    <li><strong>Data Controller:</strong> The TEDxICEAS 2025 Organizing Committee.</li>
                    <li><strong>Data Collected:</strong> Full Name, Email Address, Phone Number, and Transaction/Payment Proof Screenshot.</li>
                    <li><strong>Purpose of Processing:</strong> Your data is processed solely for verifying payments, generating your official entry ticket codes, managing your check-in, and sending you event flows, scheduling updates, and logistical communications.</li>
                    <li><strong>Storage and Security:</strong> Your personal details are stored securely in our protected database, and your payment screenshot is kept in a secure, private storage bucket. Only authorized administrators have access to this information.</li>
                    <li><strong>Retention Period:</strong> All personal data collected will be permanently deleted from our servers within 30 days after the conclusion of the TEDxICEAS event, except where required for accounting or legal compliance.</li>
                    <li><strong>Your Rights:</strong> As a "Data Principal" under the DPDP Act, you have the right to access your data, request correction of any inaccurate details, request erasure of your data, or withdraw your consent.</li>
                    <li><strong>Grievances and Support:</strong> If you wish to withdraw consent, erase your data, or report any grievance, you can write directly to our designated Grievance Officer, Rayif, at <a href="mailto:tedxiceas.alerts@gmail.com" className="text-[#EB0028] hover:underline font-medium">tedxiceas.alerts@gmail.com</a> or via phone at +91 97464 02973.</li>
                  </ul>
                </div>
              </div>

              {/* Close Action */}
              <div className="pt-6 border-t border-white/10 mt-6 flex justify-end shrink-0">
                <button
                  onClick={() => setShowTermsModal(false)}
                  className="px-6 py-2.5 bg-[#EB0028] hover:bg-[#c30020] text-white font-semibold rounded-lg font-clash transition-colors cursor-pointer"
                >
                  I Understand
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}