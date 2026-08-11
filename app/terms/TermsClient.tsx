"use client";

import Link from "next/link";
import {
  ArrowLeft,
  Scale,
  ShieldCheck,
  Building2,
  Camera,
  ShieldAlert,
  Ban,
  Utensils,
  Smartphone,
  HeartHandshake,
  Armchair,
  Search,
  Leaf,
  UserCheck
} from "lucide-react";
import { motion } from "framer-motion";
import Footer from "../components/Footer";

export default function TermsAndPrivacyPage() {
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
            Please read our ticketing terms, code of conduct, venue safety rules, and DPDP data privacy notice carefully.
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

          {/* Section 2: Venue Guidelines, Decorum & Code of Conduct */}
          <section className="space-y-6">
            <div className="flex items-center gap-3 border-b border-white/10 pb-3">
              <Building2 className="text-[#EB0028] shrink-0" size={24} />
              <h2 className="font-orbitron font-bold text-lg md:text-xl text-white tracking-wide uppercase">
                2. Venue Rules, Safety & Attendee Code of Conduct
              </h2>
            </div>

            <div className="font-clash text-sm text-white/70 leading-relaxed space-y-6">
              <div className="p-4 bg-amber-950/30 border border-amber-500/30 rounded-xl text-amber-400 text-xs md:text-sm font-semibold">
                🏛️ CAMPUS DECORUM & SAFETY: Attendees must maintain strict discipline, respect college property, and adhere to venue safety rules at all times.
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* 1. Photography & Videography */}
                <div className="bg-zinc-900/50 p-4 rounded-xl border border-white/5 space-y-2">
                  <div className="flex items-center gap-2 text-white font-semibold text-sm">
                    <Camera className="text-[#EB0028] w-4 h-4 shrink-0" />
                    <span>1. Photography & Videography</span>
                  </div>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    The event will be professionally photographed and recorded. By entering the venue, attendees consent to the use of their image, voice, and likeness in TEDxICEAS promotional materials, social media, and future event documentation without additional compensation.
                  </p>
                </div>

                {/* 2. Emergency & Safety Procedures */}
                <div className="bg-zinc-900/50 p-4 rounded-xl border border-white/5 space-y-2">
                  <div className="flex items-center gap-2 text-white font-semibold text-sm">
                    <ShieldAlert className="text-[#EB0028] w-4 h-4 shrink-0" />
                    <span>2. Emergency & Safety Procedures</span>
                  </div>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    In case of an emergency, attendees must remain calm and immediately follow the instructions of event staff, volunteers, security personnel, or emergency responders. Emergency exits should remain unobstructed at all times.
                  </p>
                </div>

                {/* 3. Restricted Items */}
                <div className="bg-zinc-900/50 p-4 rounded-xl border border-white/5 space-y-2">
                  <div className="flex items-center gap-2 text-white font-semibold text-sm">
                    <Ban className="text-[#EB0028] w-4 h-4 shrink-0" />
                    <span>3. Restricted Items</span>
                  </div>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    Weapons, alcohol, illegal substances, smoking materials, fireworks, laser pointers, drones, hazardous materials, and any item deemed unsafe by security are strictly prohibited inside the venue.
                  </p>
                </div>

                {/* 4. Food & Drinks */}
                <div className="bg-zinc-900/50 p-4 rounded-xl border border-white/5 space-y-2">
                  <div className="flex items-center gap-2 text-white font-semibold text-sm">
                    <Utensils className="text-[#EB0028] w-4 h-4 shrink-0" />
                    <span>4. Food & Beverages</span>
                  </div>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    Outside food and beverages may be restricted inside the auditorium. Please use designated refreshment areas during lunch and coffee breaks and dispose of waste responsibly.
                  </p>
                </div>

                {/* 5. Mobile Phone Etiquette */}
                <div className="bg-zinc-900/50 p-4 rounded-xl border border-white/5 space-y-2">
                  <div className="flex items-center gap-2 text-white font-semibold text-sm">
                    <Smartphone className="text-[#EB0028] w-4 h-4 shrink-0" />
                    <span>5. Mobile Phone Etiquette</span>
                  </div>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    Mobile phones must be switched to silent mode during speaker sessions. Phone calls should only be taken outside the main auditorium.
                  </p>
                </div>

                {/* 6. Respect for Speakers */}
                <div className="bg-zinc-900/50 p-4 rounded-xl border border-white/5 space-y-2">
                  <div className="flex items-center gap-2 text-white font-semibold text-sm">
                    <HeartHandshake className="text-[#EB0028] w-4 h-4 shrink-0" />
                    <span>6. Respect for Speakers</span>
                  </div>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    Interruptions, shouting, inappropriate comments, or disruptive behavior during talks are strictly prohibited. Attendees are expected to respect all speakers and fellow participants.
                  </p>
                </div>

                {/* 7. Seating Policy */}
                <div className="bg-zinc-900/50 p-4 rounded-xl border border-white/5 space-y-2">
                  <div className="flex items-center gap-2 text-white font-semibold text-sm">
                    <Armchair className="text-[#EB0028] w-4 h-4 shrink-0" />
                    <span>7. Seating & Entry Policy</span>
                  </div>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    Seating is on a first-come, first-served basis unless otherwise specified. Late arrivals may be asked to wait until an appropriate session break before entering the auditorium.
                  </p>
                </div>

                {/* 8. Lost & Found & Valuables */}
                <div className="bg-zinc-900/50 p-4 rounded-xl border border-white/5 space-y-2">
                  <div className="flex items-center gap-2 text-white font-semibold text-sm">
                    <Search className="text-[#EB0028] w-4 h-4 shrink-0" />
                    <span>8. Lost & Found & Valuables</span>
                  </div>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    Attendees are solely responsible for their personal belongings. Lost items may be reported to the Help Desk during the event. Unclaimed items will be handled according to college policy.
                  </p>
                </div>

                {/* 9. Environmental Responsibility */}
                <div className="bg-zinc-900/50 p-4 rounded-xl border border-white/5 space-y-2">
                  <div className="flex items-center gap-2 text-white font-semibold text-sm">
                    <Leaf className="text-[#EB0028] w-4 h-4 shrink-0" />
                    <span>9. Environmental Responsibility</span>
                  </div>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    Please help us maintain a clean and sustainable event by using designated waste bins, keeping the campus litter-free, and minimizing unnecessary waste.
                  </p>
                </div>

                {/* 10. Compliance with Staff & College Property Protection */}
                <div className="bg-zinc-900/50 p-4 rounded-xl border border-white/5 space-y-2">
                  <div className="flex items-center gap-2 text-white font-semibold text-sm">
                    <UserCheck className="text-[#EB0028] w-4 h-4 shrink-0" />
                    <span>10. Event Authority & Property Protection</span>
                  </div>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    Attendees must comply with all instructions issued by TEDxICEAS organizers, volunteers, security personnel, and college authorities. College property must be protected; any vandalism or destruction will result in immediate removal without refund and full financial liability for damages.
                  </p>
                </div>

              </div>
            </div>
          </section>

          {/* Section 3: Privacy Policy & Consent (DPDP Act 2023 Compliant) */}
          <section className="space-y-6">
            <div className="flex items-center gap-3 border-b border-white/10 pb-3">
              <ShieldCheck className="text-[#EB0028] shrink-0" size={24} />
              <h2 className="font-orbitron font-bold text-lg md:text-xl text-white tracking-wide uppercase">
                3. DPDP Act (2023) Consent & Data Privacy Notice
              </h2>
            </div>

            <div className="font-clash text-sm text-white/70 leading-relaxed space-y-4">
              <p>
                In compliance with the <strong className="text-white">Digital Personal Data Protection (DPDP) Act, 2023 (India)</strong>, we are committed to safeguarding your personal data. This notice forms part of the TEDxICEAS Registration Terms & Conditions and should be read together with the Event Terms and Privacy Policy available on the official registration portal.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                <div className="space-y-1">
                  <span className="text-white/40 text-[10px] uppercase font-orbitron block">Data Fiduciary / Controller</span>
                  <span className="text-white font-semibold">The TEDxICEAS Organizing Committee</span>
                </div>
                <div className="space-y-1">
                  <span className="text-white/40 text-[10px] uppercase font-orbitron block">Designated Grievance Officer</span>
                  <span className="text-white font-semibold">Thejaswin P (+91 98457 14699)</span>
                </div>
              </div>

              <div className="h-px bg-white/5 my-4"></div>

              <ul className="list-disc pl-5 space-y-3">
                <li>
                  <strong className="text-white">Lawful Basis & Explicit Consent:</strong> By registering for TEDxICEAS, you voluntarily provide your explicit consent for the collection, processing, storage, and limited use of your personal data solely for purposes related to the organization, entry verification, and execution of the event.
                </li>
                <li>
                  <strong className="text-white">Personal Data Collected:</strong> We collect your Full Name, Email Address, Phone Number, and Payment Transaction Proof/Screenshot. For group or multi-ticket bookings, the name and email of each attendee are also collected.
                </li>
                <li>
                  <strong className="text-white">Third-Party Service Providers:</strong> Certain personal information may be processed through trusted third-party platforms used for payment processing, cloud storage, email communication, QR code generation, or registration management (including Supabase, Clerk, AWS, and Nodemailer). These providers process data only as necessary to deliver the requested services.
                </li>
                <li>
                  <strong className="text-white">Data Sharing & Non-Commercialization:</strong> TEDxICEAS does not sell, rent, or commercially distribute attendee personal data to third parties. Information will only be shared where legally required or when necessary for essential event operations.
                </li>
                <li>
                  <strong className="text-white">Storage & Security Measures:</strong> Personal information is stored using secure access-controlled systems. Access is restricted to authorized members of the TEDxICEAS organizing committee strictly for event administration purposes. Payment proof, where applicable, is stored separately with restricted access. Reasonable technical and organizational safeguards, including access controls, encrypted communications where applicable, and restricted administrator access, are implemented to protect your personal information from unauthorized access, disclosure, or misuse.
                </li>
                <li>
                  <strong className="text-white">Data Retention:</strong> Personal data will be retained only for as long as necessary to fulfill the purposes described in this notice or as required under applicable law. Registration data not required for legal, financial, or tax compliance will ordinarily be deleted within 30 days after the conclusion of the event.
                </li>
                <li>
                  <strong className="text-white">Withdrawal of Consent:</strong> You may withdraw your consent at any time before the event by contacting the Grievance Officer. Withdrawal of consent may result in cancellation of your registration if the requested services can no longer be provided.
                </li>
                <li>
                  <strong className="text-white">Photography & Recording Consent:</strong> The event will be photographed and professionally recorded. By attending, you consent to the capture and use of your image, voice, and likeness for TEDxICEAS documentation, promotional content, archival purposes, and social media communications without additional compensation.
                </li>
                <li>
                  <strong className="text-white">Grievance Redressal & Your Rights:</strong> As a &quot;Data Principal&quot; under the DPDP Act, requests regarding correction, deletion, or withdrawal of consent may be submitted to <a href="mailto:tedxiceas.alerts@gmail.com" className="text-[#EB0028] hover:underline font-semibold font-mono">tedxiceas.alerts@gmail.com</a>. We aim to acknowledge requests within a reasonable time in accordance with applicable law.
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
