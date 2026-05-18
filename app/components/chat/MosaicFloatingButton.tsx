"use client"

import { motion } from "framer-motion"
import { MessageCircle } from "lucide-react"
import Link from "next/link"

export default function MosaicFloatingButton() {
  return (
    <Link href="/chat">
      <motion.button
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 2, duration: 0.4, ease: "easeOut" }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        className="fixed bottom-6 right-6 z-[200] bg-[#EB0028] text-white p-4 rounded-full shadow-lg shadow-[#EB0028]/30 cursor-pointer"
        aria-label="Open Mosaic Chat"
      >
        <MessageCircle size={24} />
        <motion.span
          className="absolute -top-1 -right-1 w-3 h-3 bg-white rounded-full"
          animate={{ scale: [1, 1.3, 1] }}
          transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
        />
      </motion.button>
    </Link>
  )
}