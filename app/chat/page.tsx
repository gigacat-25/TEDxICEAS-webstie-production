"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { ArrowLeft, Sparkles } from "lucide-react"
import { motion } from "framer-motion"
import { useTheme } from "@/app/components/ThemeContext"
import MosaicChat from "@/app/components/chat/MosaicChat"

export default function ChatPage() {
  const { theme } = useTheme()
  const isDark = theme === "dark"
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 100)
    return () => clearTimeout(timer)
  }, [])

  return (
    <main className={`min-h-screen flex flex-col ${isDark ? "bg-black" : "bg-white"}`}>
      <div className="fixed inset-0 z-0 pointer-events-none opacity-20"
        style={{ backgroundImage: "url('/noise.svg')" }}
      />

      <div className="relative z-10 flex flex-col h-screen">
        <header className={`flex items-center justify-between px-4 md:px-8 py-4 border-b ${isDark ? "border-white/10" : "border-black/10"}`}>
          <Link href="/">
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-sm border cursor-pointer transition-colors ${
                isDark
                  ? "border-white/20 text-white/70 hover:border-[#EB0028] hover:text-white"
                  : "border-black/20 text-black/70 hover:border-[#EB0028]"
              }`}
            >
              <ArrowLeft size={16} />
              <span className="font-clash text-sm tracking-wide hidden sm:inline">Back</span>
            </motion.div>
          </Link>

          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3"
          >
            <Sparkles size={18} className="text-[#EB0028]" />
            <div className="text-right">
              <h1 className="font-orbitron text-lg md:text-xl font-bold tracking-tight">
                <span className="text-[#EB0028]">MOSAIC</span>
              </h1>
              <p className={`font-clash text-[10px] md:text-xs tracking-widest uppercase ${isDark ? "text-white/40" : "text-black/40"}`}>
                What shapes us?
              </p>
            </div>
          </motion.div>

          <div className="w-[88px] hidden sm:block" />
        </header>

        <div className="flex-1 overflow-hidden">
          {mounted && <MosaicChat />}
        </div>
      </div>
    </main>
  )
}