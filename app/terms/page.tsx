"use client";

import Link from "next/link";
import { ArrowLeft, ShieldAlert, Scale, ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";
import { useTheme } from "../components/ThemeContext";
import Footer from "../components/Footer";

export default function TermsAndPrivacyPage() {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <main className="min-h-screen bg-black text-white selection:bg-[#EB0028] selection:text-white relative flex flex-col justify-between overflow-x-hidden">
      {/* Background Noise & Gradient */}
      <div className="fixed inset-0 z-0 pointer-events-none opacity-20" style={{ backgroundImage: "url('/noise.svg')" }}></div>
      <div className="fixed inset-0 z-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-gray-900 via-black to-black opacity-80 pointer-events-none"></div>

      {/* Header controls */}
      <div className="relative z-10 w-full px-6 md:px-12 py-8 flex items-center justify-between">
        <Link href="/">
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/20 text-white/80 hover:text-white hover:border-[#EB0028] transition bg-black/50 backdrop-blur-md cursor-pointer"
          >
            <ArrowLeft size={16} />
            <span className="font-clash text-sm tracking-wide">Back to Home</span>
          </motion.div>
        </Link>
        <Link href="/tickets">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-[#EB0028] hover:bg-[#c30020] text-white font-orbitron font-bold text-xs uppercase tracking-wider py-2 px-6 rounded-full transition cursor-pointer shadow-lg hover:shadow-[#EB0028]/20"
          >
            Book Tickets
          </motion.button>
        </Link>
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex-1 w-full max-w-4xl mx-auto px-6 py-10">
        
        {/* Title Header */}
        <div className="text-center mb-16">
          <span className="text-xs uppercase tracking-widest text-[#EB0028] font-orbitron font-semibold">
            Legal Documentation
          </span>
          <h1 className="font-orbitron font-black text-4xl md:text-5xl tracking-tight text-white mt-2">
            TERMS & <span className="text-[#EB0028]">PRIVACY POLICY</span>
          </h1>
          <p className="mt-4 font-clash text-gray-400 text-sm md:text-base max-w-lg mx-auto">
            Please read our ticketing terms and conditions and the DPDP data privacy notice carefully before purchasing passes.
          </p>
        </div>

        {/* Content Box */}
        <div className="bg-zinc-950/60 border border-white/10 rounded-2xl p-6 md:p-10 backdrop-blur-md shadow-2xl relative space-y-10">
          {/* Corner Accents */}
          <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-[#EB0028]"></div>
          <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-[#EB0028]"></div>

          {/* Section 1: Terms and Conditions */}
          <section className="space-y-6">
            <div className="flex items-center gap-3 border-b border-white/10 pb-3">
              <Scale className="text-[#EB0028] shrink-0" size={24} />
              <h2 className="font-orbitron font-bold text-lg md:text-xl text-white tracking-wide uppercase">
                1. Terms & Conditions of Booking
              </h2>
            </div>
            
            <div className="font-clash text-sm text-white/70 leading-relaxed space-y-4">
              <div className="p-4 bg-red-950/20 border border-red-500/20 rounded-xl text-red-400 text-xs md:text-sm font-semibold">
                ⚠️ IMPORTANT NOTICE: All ticket bookings are final. Tickets are strictly non-refundable and non-transferable under any circumstances.
              </div>
              <ul className="list-disc pl-5 space-y-3">
                <li>
                  <strong className="text-white">Non-Refundable Policy:</strong> Once a registration is submitted and the payment is verified, the transaction is closed. Refunds, cancellations, or ticket returns are not supported under any circumstances.
                </li>
                <li>
                  <strong className="text-white">Admission Verification:</strong> Event organizers reserve the right of admission. Student ticket holders must present a valid physical student ID card at the registration desk. Failure to present a valid ID card will result in the ticket being voided without a refund, and entry will be denied.
                </li>
                <li>
                  <strong className="text-white">Non-Transferability:</strong> Ticket codes are locked to the specific attendee names provided during registration. Only the attendee whose name is printed on the pass will be permitted entry.
                </li>
                <li>
                  <strong className="text-white">Event Modifications:</strong> The organizing committee reserves the right to alter the schedule, speaker lineup, or venue setup due to unforeseen events or circumstances beyond control, without being liable for refunds or compensation.
                </li>
              </ul>
            </div>
          </section>

          {/* Section 2: Privacy Policy & Consent */}
          <section className="space-y-6">
            <div className="flex items-center gap-3 border-b border-white/10 pb-3">
              <ShieldCheck className="text-[#EB0028] shrink-0" size={24} />
              <h2 className="font-orbitron font-bold text-lg md:text-xl text-white tracking-wide uppercase">
                2. DPDP Act (2023) Consent & Privacy Notice
              </h2>
            </div>

            <div className="font-clash text-sm text-white/70 leading-relaxed space-y-4">
              <p>
                In compliance with the <strong className="text-white">Digital Personal Data Protection (DPDP) Act, 2023 (India)</strong>, we are committed to safeguarding your personal data. By registering for TEDxICEAS 2025, you provide your explicit and informed consent to the processing of your personal data as outlined below:
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                <div className="space-y-1">
                  <span className="text-white/40 text-[10px] uppercase font-orbitron block">Data Controller</span>
                  <span className="text-white font-semibold">The TEDxICEAS 2025 Organizing Committee</span>
                </div>
                <div className="space-y-1">
                  <span className="text-white/40 text-[10px] uppercase font-orbitron block">Designated Grievance Officer</span>
                  <span className="text-white font-semibold">Rayif (+91 97464 02973)</span>
                </div>
              </div>

              <div className="h-px bg-white/5 my-4"></div>

              <ul className="list-disc pl-5 space-y-3">
                <li>
                  <strong className="text-white">Personal Data Collected:</strong> We collect your Full Name, Email Address, Phone Number, and Transaction/Payment Proof Screenshot. For multiple ticket bookings, the name and email of each attendee are also collected.
                </li>
                <li>
                  <strong className="text-white">Purpose of Processing:</strong> Your data is processed solely for verifying payments, generating your unique ticket QR codes, managing registration desk check-ins, and sending you event schedules, coffee/lunch passes, and logistical announcements.
                </li>
                <li>
                  <strong className="text-white">Storage and Security:</strong> Your personal details are stored securely in our protected database, and your payment screenshot is kept in a private storage bucket. Only authorized administrators have access to this information.
                </li>
                <li>
                  <strong className="text-white">Data Retention:</strong> All personal data collected will be permanently deleted from our servers within 30 days after the conclusion of the TEDxICEAS event, except where required for accounting or legal compliance.
                </li>
                <li>
                  <strong className="text-white">Your Rights:</strong> As a "Data Principal" under the DPDP Act, you have the right to access your data, request correction of any inaccurate details, request erasure of your data, or withdraw your consent. To exercise these rights, email us at <a href="mailto:tedxiceas.alerts@gmail.com" className="text-[#EB0028] hover:underline font-semibold font-mono">tedxiceas.alerts@gmail.com</a>.
                </li>
              </ul>
            </div>
          </section>
        </div>
      </div>

      <Footer startAnimation={true} />
    </main>
  );
}
