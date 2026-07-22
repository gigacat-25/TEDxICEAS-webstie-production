"use client";

import { useEffect, useState, useMemo } from "react";
import { Plus, Minus, X, Upload, Check, Loader2, CreditCard, ExternalLink, Smartphone } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface TicketCategory {
  type: string;
  price: string;
  numericPrice: number;
  description: string;
  soldOut: boolean;
  disabled: boolean;
}

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedTicket: TicketCategory | null;
  remainingSeats?: number;
}

export default function BookingModal({
  isOpen,
  onClose,
  selectedTicket,
  remainingSeats = 100,
}: BookingModalProps) {
  const isStudentTicket = selectedTicket?.type === "Impact College Students" || selectedTicket?.type === "Student";
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
  const [usnStatus, setUsnStatus] = useState<"idle" | "verifying" | "valid" | "invalid">("idle");
  const [usnStatusMessage, setUsnStatusMessage] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);

  // Reset form when modal opens with a different ticket or is closed
  useEffect(() => {
    if (isOpen) {
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
    }
  }, [isOpen, selectedTicket]);

  // Debounced effect for checking USN with active control flag to avoid race conditions
  useEffect(() => {
    if (!selectedTicket || !isStudentTicket) {
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

    let active = true;

    const delayDebounce = setTimeout(async () => {
      try {
        const res = await fetch(`/api/tickets/verify-usn?usn=${encodeURIComponent(cleanUsn)}`);
        const data = await res.json();
        
        if (!active) return;

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
        if (!active) return;
        console.error(err);
        setUsnStatus("invalid");
        setUsnStatusMessage("Connection error.");
      }
    }, 600); // 600ms debounce

    return () => {
      active = false;
      clearTimeout(delayDebounce);
    };
  }, [usn, selectedTicket, isStudentTicket]);

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
    if (!selectedTicket) return;

    if (remainingSeats <= 0) {
      setErrorMessage("Tickets are sold out. The 100 seat limit has been reached.");
      return;
    }

    if (ticketCount > remainingSeats) {
      setErrorMessage(`Only ${remainingSeats} seat(s) remaining out of the 100 total seats. Please adjust ticket count.`);
      return;
    }

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
    if (isStudentTicket) {
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
        if (isStudentTicket) {
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

      if (isStudentTicket) {
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

  // Memoized derived calculations
  const upiId = process.env.NEXT_PUBLIC_UPI_ID || "tedxiceas@upi";
  const upiName = process.env.NEXT_PUBLIC_UPI_NAME || "TEDxICEAS";
  const totalAmount = useMemo(() => {
    return selectedTicket ? selectedTicket.numericPrice * ticketCount : 0;
  }, [selectedTicket, ticketCount]);

  const upiLink = useMemo(() => {
    if (!selectedTicket) return "";
    const note = encodeURIComponent(`TEDxICEAS ${selectedTicket.type} Pass`);
    return `upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(upiName)}&am=${totalAmount}&cu=INR&tn=${note}`;
  }, [selectedTicket, upiId, upiName, totalAmount]);

  const qrCodeUrl = useMemo(() => {
    return `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(upiLink)}`;
  }, [upiLink]);

  if (!isOpen || !selectedTicket) return null;

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
        <motion.div
          initial={{ scale: 0.95, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.95, y: 20 }}
          transition={{ type: "spring", damping: 25, stiffness: 350 }}
          className="relative w-full max-w-2xl bg-zinc-950 border border-white/10 rounded-2xl p-6 md:p-8 flex flex-col max-h-[90vh] md:max-h-[95vh] overflow-hidden shadow-2xl my-8"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Corner Accents */}
          <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-[#EB0028] pointer-events-none"></div>
          <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-[#EB0028] pointer-events-none"></div>

          {/* Close Button */}
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="absolute top-6 right-6 text-white/50 hover:text-white hover:bg-white/10 p-2 rounded-full transition-colors cursor-pointer z-20"
          >
            <X size={20} />
          </button>

          {/* Modal Header */}
          <div className="mb-6 border-b border-white/10 pb-4 shrink-0 pr-8">
            <span className="text-xs uppercase tracking-widest text-[#EB0028] font-orbitron font-semibold">
              TEDxICEAS Ticket Registration
            </span>
            <h2 className="text-2xl md:text-3xl font-orbitron font-bold text-white mt-1">
              {selectedTicket.type} Pass
            </h2>
          </div>

          {errorMessage && (
            <div className="mb-6 p-4 bg-red-950/30 border border-red-500/50 rounded-lg text-red-400 font-clash text-sm shrink-0">
              {errorMessage}
            </div>
          )}

          {/* Steps Indicator */}
          <div className="flex items-center gap-4 mb-8 shrink-0 select-none">
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

          {/* Scrollable Form Body */}
          <div className="flex-1 overflow-y-auto pr-1 space-y-5 custom-scrollbar">
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
                {isStudentTicket && (
                  <div className="space-y-2">
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
                      <p className="text-xs text-white/50 font-clash">
                        Only pre-authorized student USNs are permitted to purchase Student/Impact College Student passes.
                      </p>
                    )}
                  </div>
                )}

                {/* Quantity Selector */}
                <div className="bg-zinc-900/50 border border-white/5 rounded-xl p-4 flex items-center justify-between">
                  <div>
                    <h4 className="font-clash font-semibold text-white">Quantity</h4>
                    <p className="text-xs text-white/50 font-clash mt-0.5">
                      {isStudentTicket
                        ? "Student tickets are limited to 1 per booking"
                        : `Max 5 per booking (${remainingSeats} seat(s) remaining out of 100 limit)`}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => setTicketCount(Math.max(1, ticketCount - 1))}
                      disabled={ticketCount <= 1 || isStudentTicket}
                      className="w-10 h-10 rounded-lg border border-white/10 flex items-center justify-center text-white hover:bg-white/10 disabled:opacity-30 disabled:hover:bg-transparent transition-colors cursor-pointer"
                    >
                      <Minus size={16} />
                    </button>
                    <span className="font-orbitron font-bold text-lg text-white w-6 text-center">
                      {isStudentTicket ? 1 : ticketCount}
                    </span>
                    <button
                      onClick={() => setTicketCount(Math.min(Math.min(5, remainingSeats), ticketCount + 1))}
                      disabled={ticketCount >= Math.min(5, remainingSeats) || isStudentTicket}
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
                          <div className={`grid grid-cols-1 ${isStudentTicket ? "md:grid-cols-3" : "md:grid-cols-2"} gap-3`}>
                            <div className="space-y-1">
                              <label className="block text-xs font-clash text-white/60">
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
                                className="w-full bg-zinc-950 border border-white/5 rounded-lg py-2 px-3 text-sm text-white font-clash placeholder-white/20 focus:outline-none focus:border-[#EB0028] transition-colors"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="block text-xs font-clash text-white/60">
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
                                className="w-full bg-zinc-950 border border-white/5 rounded-lg py-2 px-3 text-sm text-white font-clash placeholder-white/20 focus:outline-none focus:border-[#EB0028] transition-colors"
                              />
                            </div>
                            {isStudentTicket && (
                              <div className="space-y-1">
                                <label className="block text-xs font-clash text-white/60">
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
                                  className="w-full bg-zinc-950 border border-white/5 rounded-lg py-2 px-3 text-sm text-white font-clash placeholder-white/20 uppercase tracking-wider focus:outline-none focus:border-[#EB0028] transition-colors"
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
                <div className="border-t border-white/10 pt-4 flex justify-between items-center text-lg">
                  <span className="font-clash text-white/60">Total Amount:</span>
                  <span className="font-orbitron font-black text-2xl text-[#EB0028]">
                    ₹{totalAmount}
                  </span>
                </div>

                {/* Terms and Consent Checkbox */}
                <div className="bg-zinc-900/40 border border-white/5 rounded-xl p-4 space-y-3">
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      id="termsConsent"
                      checked={agreedToTerms}
                      onChange={(e) => setAgreedToTerms(e.target.checked)}
                      className="mt-1 cursor-pointer w-4 h-4 rounded accent-[#EB0028] border-white/20 bg-zinc-950 text-white"
                    />
                    <label htmlFor="termsConsent" className="font-clash text-xs text-white/70 leading-relaxed select-none cursor-pointer">
                      I agree to the <button type="button" onClick={() => setShowTermsModal(true)} className="text-[#EB0028] hover:underline font-semibold cursor-pointer">Terms & Conditions</button> and give my explicit consent to process my data in accordance with the <button type="button" onClick={() => setShowTermsModal(true)} className="text-[#EB0028] hover:underline font-semibold cursor-pointer">DPDP Privacy Notice</button>. I understand that <strong>tickets are non-refundable</strong>.
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Payment Section */}
            {currentStep === 2 && (
              <div className="space-y-6">
                {/* Pay via UPI App Action Box */}
                <div className="bg-gradient-to-r from-zinc-900 via-zinc-900 to-[#18181b] border border-[#EB0028]/30 rounded-xl p-4 md:p-5 shadow-lg space-y-3.5">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] uppercase font-orbitron font-bold text-[#EB0028] tracking-widest block">
                        Fast & Direct Payment
                      </span>
                      <h4 className="text-base md:text-lg font-orbitron font-bold text-white">
                        Pay via UPI App
                      </h4>
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-[#EB0028]/10 border border-[#EB0028]/30 text-[11px] font-clash text-[#EB0028] font-semibold">
                      GPay • PhonePe • Paytm
                    </span>
                  </div>

                  <p className="text-xs text-white/60 font-clash leading-relaxed">
                    Click below to open Google Pay, PhonePe, Paytm, BHIM, or any UPI app with pre-filled details.
                  </p>

                  <a
                    href={upiLink}
                    target="_self"
                    className="w-full bg-gradient-to-r from-[#EB0028] to-[#ff2b4a] hover:from-[#c30020] hover:to-[#eb0028] text-white font-clash py-3.5 px-5 rounded-lg font-bold text-sm md:text-base shadow-md flex items-center justify-center gap-2 transition-all transform active:scale-[0.98] cursor-pointer"
                  >
                    <Smartphone size={18} />
                    <span>Pay ₹{totalAmount} via UPI App</span>
                    <ExternalLink size={16} />
                  </a>

                  <div className="text-[11px] font-clash text-white/50 pt-1 border-t border-white/5">
                    <span>Scan QR code below if using Desktop</span>
                  </div>
                </div>

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
                      <div className="space-y-1.5 font-clash text-sm">
                        <div className="flex justify-between items-center">
                          <span className="text-white/50">Amount:</span>
                          <span className="text-white font-semibold">₹{totalAmount}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-white/50">UPI ID:</span>
                          <span className="text-white font-mono select-all">{upiId}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-white/50">Name:</span>
                          <span className="text-white">{upiName}</span>
                        </div>
                      </div>
                    </div>

                    <div className="text-xs text-white/50 font-clash leading-relaxed bg-zinc-900/50 p-3 rounded-lg border border-white/5">
                      <p className="font-semibold text-white/80 mb-1">Payment & Proof Steps:</p>
                      1. Click <strong className="text-white">&quot;Pay ₹{totalAmount} via UPI App&quot;</strong> above (or scan QR).<br />
                      2. Complete the payment in your UPI app.<br />
                      3. Take a screenshot of the successful payment receipt.<br />
                      4. Upload the screenshot below & click <strong className="text-[#EB0028]">&quot;Submit Booking&quot;</strong>.
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
                  <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-2.5 text-xs text-amber-300 font-clash leading-normal">
                    ⚠️ <strong>Check your Spam or Promotions folder:</strong> Automated emails can sometimes be misclassified. If you don&apos;t receive it in 5 minutes, check your Spam folder.
                  </div>
                  <div className="h-px bg-white/5"></div>
                  <p className="font-clash text-xs text-white/50 leading-relaxed">
                    Our support team will verify your transaction. Once verified, a second confirmation email containing your official entry ticket code will be sent to you (usually within 1-2 days).
                  </p>
                </div>

                <div className="pt-6">
                  <button
                    onClick={onClose}
                    className="px-8 py-3 bg-white text-black hover:bg-white/90 rounded-lg font-clash font-semibold transition-colors cursor-pointer"
                  >
                    Close Window
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Sticky Actions Footer */}
          {currentStep === 1 && (
            <div className="pt-6 border-t border-white/10 mt-6 shrink-0 z-10">
              <button
                onClick={handleNextStep}
                disabled={usnStatus === "verifying"}
                className="w-full bg-[#EB0028] hover:bg-[#c30020] disabled:bg-zinc-800 disabled:text-white/45 disabled:cursor-not-allowed text-white font-clash py-4 rounded-lg font-medium tracking-wide uppercase transition-colors duration-300 flex items-center justify-center gap-2 cursor-pointer"
              >
                {usnStatus === "verifying" ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>Verifying Student USN...</span>
                  </>
                ) : (
                  <span>Proceed to Payment</span>
                )}
              </button>
            </div>
          )}

          {currentStep === 2 && (
            <div className="pt-6 border-t border-white/10 mt-6 grid grid-cols-2 gap-4 shrink-0 z-10">
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
          )}
        </motion.div>
      </div>

      {/* Terms & DPDP Privacy Modal */}
      <AnimatePresence>
        {showTermsModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/95 backdrop-blur-md overflow-y-auto">
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
                    <li><strong>Your Rights:</strong> As a &quot;Data Principal&quot; under the DPDP Act, you have the right to access your data, request correction of any inaccurate details, request erasure of your data, or withdraw your consent.</li>
                    <li><strong>Grievances and Support:</strong> If you wish to withdraw consent, erase your data, or report any grievance, you can write directly to our designated Grievance Officer, Thejaswin P, at <a href="mailto:tedxiceas.alerts@gmail.com" className="text-[#EB0028] hover:underline font-medium">tedxiceas.alerts@gmail.com</a> or via phone at +91 98457 14699.</li>
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
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
