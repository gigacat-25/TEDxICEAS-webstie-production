"use client";

import { useState } from "react";
import Navbar from "../components/Navbar";
import { motion, AnimatePresence, Variants } from "framer-motion";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Image from "next/image";

type TeamMember = {
  name: string;
  role: string;
  image?: string;
};

const coreTeam: TeamMember[] = [
  { name: "Thejaswin P", role: "Lead Organizer and Licensee", image: "/team/Thejaswin P.jpg" },
  { name: "Mohammed Raif", role: "Co Organizer", image: "/team/Raif.jpg" },
  { name: "Samuel Melvin", role: "Event Manager", image: "/team/Samuel Melvin.jpeg" },
  { name: "Joshua Nikhil", role: "Event Producer & Sponsorship Lead", image: "/team/Joshua.jpg" },
  { name: "Saraswati Nag H", role: "Event Co Producer", image: "/team/Saraswathi Nag.jpg" },
  { name: "Syed Saihan Zaheer Hussainy", role: "Marketing Team Lead", image: "/team/Saihaan.jpg" },
  { name: "Irthiqua Zain", role: "Marketing Team Lead", image: "/team/Zain.jpg" },
  { name: "Dhayan Balagopal", role: "Sponsorship Team Co-Lead", image: "/team/Dhyan.jpg" },
  { name: "Aarcha U", role: "Curation Team Lead", image: "/team/Aarcha.jpg" },
  { name: "Mohammed Sauwam", role: "Production Team Lead", image: "/team/Sauwam.jpg" },
  { name: "Joann Debi R", role: "Logistics Lead", image: "/team/Joann Debi.jpg" },
  { name: "Mohammed Rumaiz Sakardey", role: "Hospitality Team Lead", image: "/team/Rumaiz.jpg" },
  { name: "Yogitha", role: "Hospitality Co-Lead", image: "/team/Yogita.jpg" },
  { name: "Arshad Khaif", role: "Social Media Team Lead", image: "/team/Arshad Khaif.jpg" },
  { name: "Mohammed Muddasir", role: "Design Co-Lead", image: "/team/Mohammed Mudassir.jpg" }
];

const facultyCoordinators: TeamMember[] = [
  { name: "Disha B G Rao", role: "Faculty Coordinator", image: "/team/Disha_maam.JPG" },
  { name: "Ramesh Kulkarni", role: "Faculty Coordinator", image: "/team/Ramesh_sir.JPG" },
];

const teamsData = [
  {
    name: "Sponsorship Team",
    members: ["Mohtih E", "Harshitha SL", "Lakshmi Ashok", "Sachin Mani", "Venkatesh R Naik", "Subhashini HK", "Varsha SK", "Gufran", "Shivam Pratap Singh", "Mohammed Rumaiz Sakardey"]
  },
  {
    name: "Curation Team",
    members: ["Sahrish Adil", "Saariya Arif", "Joann Debi R"]
  },
  {
    name: "Production Team",
    members: ["Yashas gowda", "R Pradeep", "Vinay kumar kr", "Rishi Jayaram", "Prajwal CJ", "Yashasgowda p.n"]
  },
  {
    name: "Marketing Team",
    members: ["Madeeha Fathima", "Varsha SK", "Mahassam Rida I Sarang", "Mohammed Ibrahim", "Mohammed Owaiz Baig", "Shaik Mohammed Afnaan"]
  },
  {
    name: "Social Media Team",
    members: ["Sahrish Adil", "Mohammedi Saariya Arif", "Madeeha Fathima", "Sheikh Mohammed Afnaan"]
  }
];

export default function TeamPage() {
  const [activeSection, setActiveSection] = useState<"core" | "faculty">("core");
  const router = useRouter();

  const itemVariants: Variants = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 50, damping: 20 } },
  };

  return (
    <main>
      <section className="min-h-screen bg-black text-white px-[1.5rem] md:px-[3rem] py-[6rem]">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between gap-[1rem] flex-wrap">
            <motion.h1
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="text-3xl md:text-5xl font-semibold tracking-tight font-orbitron text-[#EB0028]"
            >
              Meet Our Team
            </motion.h1>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => router.push("/")}
              className="inline-flex items-center gap-[0.5rem] px-[1.25rem] py-[0.55rem] text-sm rounded-full border border-white/20 text-white/80 hover:text-white hover:border-[#EB0028] transition max-sm:hidden"
            >
              <ArrowLeft size={14} />
              <span className="hidden sm:inline">Back to Home</span>
            </motion.button>

            <motion.button
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => router.push("/")}
              className="inline-flex sm:hidden items-center justify-center p-2 rounded-full border border-white/20 text-white/80 hover:text-white hover:border-[#EB0028] transition"
            >
              <ArrowLeft size={20} />
            </motion.button>
          </div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="mt-[1rem] text-white/60 max-w-xl"
          >
            The people working behind the scenes to bring <span className="font-tedxiceas">TEDxICEAS</span> to life.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="mt-[2.5rem] inline-flex rounded-full border border-white/20 p-[0.25rem]"
          >
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setActiveSection("core")}
              className={`px-[1.5rem] py-[0.5rem] text-sm rounded-full transition ${
                activeSection === "core"
                  ? "bg-[#EB0028] text-white"
                  : "text-white/70 hover:text-white"
              }`}
            >
              Core Team
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setActiveSection("faculty")}
              className={`px-[1.5rem] py-[0.5rem] text-sm rounded-full transition ${
                activeSection === "faculty"
                  ? "bg-[#EB0028] text-white"
                  : "text-white/70 hover:text-white"
              }`}
            >
              Faculty
            </motion.button>


          </motion.div>

          <AnimatePresence mode="wait">
            {activeSection === "core" && (
              <motion.div
                key="core"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
                className="mt-[3.5rem] grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-[3rem]"
              >
                {coreTeam.map((member, idx) => (
                  <motion.div
                    key={idx}
                    variants={itemVariants}
                    initial="hidden"
                    whileInView="show"
                    viewport={{ once: true, margin: "-50px" }}
                    className="rounded-2xl border border-white/10 bg-white/[0.03] p-[1rem] flex flex-col hover:border-[#EB0028] transition group"
                  >
                    <div className="relative aspect-[3/4] w-full rounded-xl overflow-hidden bg-white/10 flex items-center justify-center">
                      {member.image ? (
                        <Image src={member.image} alt={member.name} fill className="object-cover" />
                      ) : (
                        <span className="text-white/20 text-6xl font-orbitron">?</span>
                      )}
                    </div>
                    <div className="mt-[1rem]">
                      <h3 className="text-base font-medium font-clash text-[#EB0028]">
                        {member.name}
                      </h3>
                      <p className="mt-[0.25rem] text-sm text-white/60">
                        {member.role}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}

            {activeSection === "faculty" && (
              <motion.div
                key="faculty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
                className="mt-[3.5rem] grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-[3rem] max-w-2xl"
              >
                {facultyCoordinators.map((member, idx) => (
                  <motion.div
                    key={idx}
                    variants={itemVariants}
                    initial="hidden"
                    whileInView="show"
                    viewport={{ once: true, margin: "-50px" }}
                    className="rounded-2xl border border-white/10 bg-white/[0.03] p-[1rem] flex flex-col hover:border-[#EB0028] transition group"
                  >
                    <div className="relative aspect-[3/4] w-full rounded-xl overflow-hidden bg-white/10 flex items-center justify-center">
                      {member.image ? (
                        <Image src={member.image} alt={member.name} fill className="object-cover" />
                      ) : (
                        <span className="text-white/20 text-6xl font-orbitron">?</span>
                      )}
                    </div>
                    <div className="mt-[1rem]">
                      <h3 className="text-base font-medium font-clash text-[#EB0028]">
                        {member.name}
                      </h3>
                      <p className="mt-[0.25rem] text-sm text-white/60">
                        {member.role}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}

          </AnimatePresence>

          <div className="mt-32">
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-2xl md:text-4xl font-semibold tracking-tight font-orbitron text-white mb-12"
            >
              The <span className="text-[#EB0028]">Team</span>
            </motion.h2>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="relative w-full aspect-video rounded-3xl overflow-hidden border border-white/10"
            >
              <Image 
                src="/team/TEAM.jpg" 
                alt="The Organizing Team" 
                fill 
                className="object-cover" 
              />
            </motion.div>
          </div>
        </div>
      </section>
    </main>
  );
}
