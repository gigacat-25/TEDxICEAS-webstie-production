"use client";

import { useEffect, useState } from "react";
import { useUser, UserButton } from "@clerk/nextjs";
import { ArrowLeft, Loader2, Printer, Ticket as TicketIcon, AlertTriangle } from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import Footer from "../components/Footer";

interface Ticket {
  id: string;
  name: string;
  email: string;
  phone: string;
  category: string;
  ticket_count: number;
  price_paid: number;
  status: "pending" | "approved" | "rejected";
  ticket_code: string | null;
  rejection_reason: string | null;
  created_at: string;
}

export default function MyTicketsPage() {
  const { user, isLoaded } = useUser();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isLoaded && user) {
      fetchUserTickets();
    }
  }, [isLoaded, user]);

  const fetchUserTickets = async () => {
    setIsLoading(true);
    setError("");
    try {
      const res = await fetch("/api/tickets/my-tickets");
      const data = await res.json();
      if (res.ok && data.success) {
        setTickets(data.tickets);
      } else {
        setError(data.error || "Failed to load your tickets.");
      }
    } catch (err) {
      console.error(err);
      setError("Failed to connect to the server. Please check your connection.");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  // Helper for status styling
  const getStatusBanner = (status: Ticket["status"]) => {
    switch (status) {
      case "approved":
        return "bg-emerald-500/10 border-emerald-500/30 text-emerald-400";
      case "rejected":
        return "bg-red-500/10 border-red-500/30 text-red-400";
      default:
        return "bg-amber-500/10 border-amber-500/30 text-amber-400 animate-pulse";
    }
  };

  return (
    <main className="min-h-screen bg-black text-white selection:bg-[#EB0028] selection:text-white relative flex flex-col justify-between overflow-x-hidden">
      {/* Background Noise & Gradient */}
      <div className="fixed inset-0 z-0 pointer-events-none opacity-20" style={{ backgroundImage: "url('/noise.svg')" }}></div>
      <div className="fixed inset-0 z-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-gray-900 via-black to-black opacity-80 pointer-events-none"></div>

      {/* Header controls (Screen-only, hidden in print) */}
      <div className="relative z-10 w-full px-6 md:px-12 py-8 flex items-center justify-between print:hidden">
        <Link href="/tickets">
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/20 text-white/80 hover:text-white hover:border-[#EB0028] transition bg-black/50 backdrop-blur-md cursor-pointer"
          >
            <ArrowLeft size={16} />
            <span className="font-clash text-sm tracking-wide">Back to Booking</span>
          </motion.div>
        </Link>
        <div className="flex items-center gap-4">
          {tickets.length > 0 && (
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/20 text-white/80 hover:text-white hover:border-emerald-500 transition bg-black/50 backdrop-blur-md cursor-pointer"
            >
              <Printer size={16} />
              <span className="font-clash text-sm tracking-wide">Print Passes</span>
            </button>
          )}
          <UserButton />
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex-1 flex flex-col justify-center items-center px-6 py-10 max-w-4xl mx-auto w-full">
        
        {/* Screen Header (Hidden in print) */}
        <div className="text-center mb-12 print:hidden">
          <h1 className="font-orbitron font-black text-4xl md:text-5xl tracking-tight text-transparent bg-clip-text bg-gradient-to-b from-white to-gray-500">
            MY <span className="text-[#EB0028]">PASSES</span>
          </h1>
          <p className="mt-4 font-clash text-gray-400 text-sm md:text-base max-w-md mx-auto">
            Welcome back, <strong className="text-white">{user?.fullName || "Attendee"}</strong>. Below are your registered event entry passes.
          </p>
        </div>

        {/* Dynamic Display states */}
        {isLoading ? (
          <div className="h-64 flex flex-col items-center justify-center text-white/50 gap-2">
            <Loader2 className="animate-spin text-[#EB0028]" size={36} />
            <p className="font-clash text-sm">Retrieving your passes...</p>
          </div>
        ) : error ? (
          <div className="bg-red-950/30 border border-red-500/40 p-6 rounded-xl text-red-400 font-clash text-center max-w-md w-full space-y-3">
            <AlertTriangle className="mx-auto" size={32} />
            <p className="text-sm font-semibold">{error}</p>
            <button 
              onClick={fetchUserTickets}
              className="px-4 py-2 border border-red-500/30 hover:border-red-500 text-white text-xs uppercase font-bold rounded-lg transition-colors cursor-pointer"
            >
              Retry
            </button>
          </div>
        ) : tickets.length === 0 ? (
          <div className="bg-zinc-950/50 border border-white/10 p-8 rounded-2xl text-center max-w-md w-full space-y-6 backdrop-blur-md">
            <TicketIcon className="mx-auto text-white/30" size={48} />
            <div className="space-y-2">
              <h3 className="font-orbitron font-bold text-xl text-white">No Tickets Booked Yet</h3>
              <p className="font-clash text-sm text-white/50 leading-relaxed">
                You haven&apos;t registered for any TEDxICEAS passes yet. Purchase one to secure your seat.
              </p>
            </div>
            <Link href="/tickets">
              <button className="w-full bg-[#EB0028] hover:bg-[#c30020] text-white py-3 rounded-lg font-clash font-semibold uppercase tracking-wider transition-colors cursor-pointer mt-2">
                Book Tickets Now
              </button>
            </Link>
          </div>
        ) : (
          /* Tickets List */
          <div className="w-full space-y-8">
            <AnimatePresence>
              {tickets.map((ticket, index) => (
                <motion.div
                  key={ticket.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="w-full bg-zinc-950/60 border border-white/10 rounded-2xl overflow-hidden shadow-2xl flex flex-col md:flex-row backdrop-blur-md border-collapse print:bg-white print:border-zinc-400 print:text-black print:shadow-none"
                >
                  
                  {/* Left Section: Boarding Pass Main Details */}
                  <div className="flex-1 p-6 md:p-8 space-y-6 relative print:p-4">
                    {/* Top corner accents (Screen-only) */}
                    <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-white/30 print:hidden"></div>
                    
                    {/* Brand / Event Logo header */}
                    <div className="flex justify-between items-start border-b border-white/10 pb-4 print:border-zinc-300">
                      <div>
                        <h2 className="font-orbitron font-black text-2xl tracking-tighter text-white print:text-black">
                          TEDx<span className="text-[#EB0028]">ICEAS</span>
                        </h2>
                        <span className="text-[10px] text-white/40 uppercase tracking-widest font-orbitron block print:text-zinc-500">
                          Official Entry Pass
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-bold font-clash text-white/80 print:text-zinc-700">
                          VISVESVARAYA AUDITORIUM
                        </span>
                        <span className="text-[10px] text-white/40 block tracking-wide font-clash print:text-zinc-500">
                          Impact Campus, Bengaluru, India
                        </span>
                      </div>
                    </div>

                    {/* Attendee details grid */}
                    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 font-clash text-sm">
                      <div>
                        <span className="text-white/40 block text-xs print:text-zinc-500">Attendee Name</span>
                        <span className="font-semibold text-white print:text-black">{ticket.name}</span>
                      </div>
                      <div>
                        <span className="text-white/40 block text-xs print:text-zinc-500">Contact Number</span>
                        <span className="font-semibold text-white/90 print:text-zinc-800">{ticket.phone}</span>
                      </div>
                      <div className="col-span-2 md:col-span-1">
                        <span className="text-white/40 block text-xs print:text-zinc-500">Registered Email</span>
                        <span className="font-semibold text-white/80 break-all print:text-zinc-700">{ticket.email}</span>
                      </div>
                    </div>

                    {/* Booking metadata */}
                    <div className="bg-zinc-900/40 border border-white/5 rounded-xl p-4 flex justify-between items-center text-xs print:bg-zinc-100 print:border-zinc-300">
                      <div>
                        <span className="text-white/40 block print:text-zinc-500">Registration Date</span>
                        <span className="font-mono font-semibold text-white/80 print:text-zinc-800">
                          {new Date(ticket.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-white/40 block print:text-zinc-500">Price Paid (Total)</span>
                        <span className="font-bold text-white/90 print:text-zinc-800">₹{ticket.price_paid}</span>
                      </div>
                    </div>
                  </div>

                  {/* Middle separator line (dashed, representing the stub tear) */}
                  <div className="relative flex flex-row md:flex-col items-center justify-between print:border-zinc-300">
                    {/* Circle cuts in desktop view (Screen-only) */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-black border-b border-white/10 hidden md:block print:hidden"></div>
                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-4 h-4 rounded-full bg-black border-t border-white/10 hidden md:block print:hidden"></div>
                    
                    {/* Dashed line */}
                    <div className="w-full md:w-px h-px md:h-full border-t md:border-l border-dashed border-white/20 print:border-zinc-400 py-1 flex-1"></div>
                  </div>

                  {/* Right Section: Ticket Stub / Entry Status */}
                  <div className="w-full md:w-[280px] p-6 md:p-8 flex flex-col justify-between items-center text-center bg-zinc-950/40 relative print:p-4 print:w-[200px]">
                    {/* Bottom corner accents (Screen-only) */}
                    <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-white/30 print:hidden"></div>

                    {/* Status Pill */}
                    <div className={`w-full py-1.5 px-3 border rounded-full text-[10px] font-black uppercase tracking-widest ${getStatusBanner(ticket.status)}`}>
                      {ticket.status === "approved" ? "Verified & Confirmed" : ticket.status === "rejected" ? "Verification Failed" : "Verification Pending"}
                    </div>

                    {/* Main Stub Content */}
                    <div className="my-6 flex-1 flex flex-col justify-center items-center">
                      {ticket.status === "approved" ? (
                        <>
                          {/* QR Code */}
                          <div className="bg-white p-2 rounded-lg shadow-inner select-none mb-3">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={`https://api.qrserver.com/v1/create-qr-code/?size=110x110&data=${ticket.ticket_code}`}
                              alt="Entry Pass Code QR"
                              className="w-24 h-24 select-none"
                            />
                          </div>
                          
                          {/* Monospace Code */}
                          <div className="font-mono text-sm font-black text-emerald-400 tracking-wider bg-emerald-950/20 border border-emerald-500/20 px-2 py-0.5 rounded select-all print:text-emerald-700 print:bg-emerald-50 print:border-emerald-200">
                            {ticket.ticket_code}
                          </div>
                        </>
                      ) : ticket.status === "rejected" ? (
                        <div className="space-y-2 py-2">
                          <AlertTriangle className="mx-auto text-red-400" size={32} />
                          <p className="text-xs text-red-300 italic font-clash leading-snug px-1">
                            {ticket.rejection_reason || "The payment transaction screenshot uploaded was invalid."}
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-3 py-2 flex flex-col items-center">
                          <Loader2 className="animate-spin text-amber-400" size={28} />
                          <p className="text-[10px] text-white/50 font-clash max-w-[180px] leading-snug">
                            Checking bank records. Pass QR will generate here upon confirmation.
                          </p>
                          <p className="text-[9px] text-amber-400/80 font-sans max-w-[180px] leading-normal print:hidden">
                            Note: Check your Spam or Promotions folder if you didn&apos;t receive your registration email.
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Stub Footer */}
                    <div className="font-clash text-xs">
                      <span className="text-white/40 block print:text-zinc-500">Pass Details</span>
                      <span className="font-bold text-white print:text-black uppercase tracking-wider">
                        {ticket.category} PASS &bull; ADMIT {ticket.ticket_count}
                      </span>
                    </div>

                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

      </div>

      <div className="print:hidden">
        <Footer startAnimation={true} />
      </div>
    </main>
  );
}
