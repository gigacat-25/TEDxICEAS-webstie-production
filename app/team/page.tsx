"use client";

import { useState } from "react";
import Navbar from "../components/Navbar";
import { motion, AnimatePresence, Variants } from "framer-motion";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

type TeamMember = {
  name: string;
  role: string;
};

const coreTeam: TeamMember[] = Array.from({ length: 9 }, (_, i) => ({
  name: `Person ${i + 1}`,
  role: "Core Team Member",
}));

const facultyCoordinators: TeamMember[] = [
  { name: "Faculty Coordinator 1", role: "Faculty Coordinator" },
  { name: "Faculty Coordinator 2", role: "Faculty Coordinator" },
];

const volunteers: TeamMember[] = Array.from({ length: 20 }, (_, i) => ({
  name: `Volunteer ${i + 1}`,
  role: "Volunteer",
}));

export default function TeamPage() {
  const [activeSection, setActiveSection] = useState<"core" | "faculty" | "volunteers">("core");
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

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setActiveSection("volunteers")}
              className={`px-[1.5rem] py-[0.5rem] text-sm rounded-full transition ${
                activeSection === "volunteers"
                  ? "bg-[#EB0028] text-white"
                  : "text-white/70 hover:text-white"
              }`}
            >
              Volunteers
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
                      <span className="text-white/20 text-6xl font-orbitron">?</span>
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
                      <span className="text-white/20 text-6xl font-orbitron">?</span>
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

            {activeSection === "volunteers" && (
              <motion.div
                key="volunteers"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
                className="mt-[3.5rem] grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-[2rem]"
              >
                {volunteers.map((member, idx) => (
                  <motion.div
                    key={idx}
                    variants={itemVariants}
                    initial="hidden"
                    whileInView="show"
                    viewport={{ once: true, margin: "-50px" }}
                    className="rounded-2xl border border-white/10 bg-white/[0.03] p-[1rem] flex flex-col hover:border-[#EB0028] transition group"
                  >
                    <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-white/10 flex items-center justify-center">
                      <span className="text-white/20 text-4xl font-orbitron">?</span>
                    </div>
                    <div className="mt-[1rem]">
                      <h3 className="text-sm font-medium font-clash text-[#EB0028]">
                        {member.name}
                      </h3>
                      <p className="mt-[0.25rem] text-xs text-white/60">
                        {member.role}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>
    </main>
  );
}
