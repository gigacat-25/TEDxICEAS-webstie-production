"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Send } from "lucide-react"
import { useTheme } from "@/app/components/ThemeContext"
import { getResponse, getSuggestedQuestions } from "@/app/utils/chat-engine"

interface Message {
  id: string
  role: "user" | "bot"
  content: string
}

let messageCounter = 0

export default function MosaicChat() {
  const { theme } = useTheme()
  const isDark = theme === "dark"
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "bot",
      content:
        "Hey there! I'm **Mosaic** — your guide to TEDxICEAS. Ask me about the event, speakers, tickets, venue, or anything else you'd like to know!",
    },
  ])
  const [input, setInput] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages, scrollToBottom])

  const handleSend = (text: string) => {
    const trimmed = text.trim()
    if (!trimmed || isTyping) return

    messageCounter += 1
    const id = messageCounter

    const userMsg: Message = {
      id: `user-${id}`,
      role: "user",
      content: trimmed,
    }

    setMessages((prev) => [...prev, userMsg])
    setInput("")
    setIsTyping(true)

    setTimeout(() => {
      const response = getResponse(trimmed)
      messageCounter += 1
      const botMsg: Message = {
        id: `bot-${messageCounter}`,
        role: "bot",
        content: response,
      }
      setMessages((prev) => [...prev, botMsg])
      setIsTyping(false)
    }, 500)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend(input)
    }
  }

  const suggestedQuestions = getSuggestedQuestions()

  return (
    <div className="flex flex-col h-full w-full max-w-3xl mx-auto">
      <div className={`flex-1 overflow-y-auto px-4 md:px-6 py-6 space-y-4`}>
        <AnimatePresence initial={false}>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[85%] md:max-w-[75%] rounded-sm px-4 py-3 ${
                  msg.role === "user"
                    ? "bg-[#EB0028] text-white"
                    : `${isDark ? "bg-white/5 border border-white/10" : "bg-black/5 border border-black/10"}`
                }`}
              >
                <p className="font-clash text-sm md:text-base leading-relaxed whitespace-pre-line">
                  {formatMessage(msg.content)}
                </p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {isTyping && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-start"
          >
            <div
              className={`rounded-sm px-4 py-3 ${
                isDark ? "bg-white/5 border border-white/10" : "bg-black/5 border border-black/10"
              }`}
            >
              <div className="flex gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#EB0028] animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="w-2 h-2 rounded-full bg-[#EB0028] animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="w-2 h-2 rounded-full bg-[#EB0028] animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          </motion.div>
        )}

        {messages.length === 1 && (
          <div className="mt-6 space-y-2">
            <p className={`font-clash text-xs tracking-widest uppercase ${isDark ? "text-white/40" : "text-black/40"}`}>
              Try asking:
            </p>
            <div className="flex flex-wrap gap-2">
              {suggestedQuestions.map((q) => (
                <button
                  key={q}
                  onClick={() => handleSend(q)}
                  className={`font-clash text-xs md:text-sm px-3 py-1.5 rounded-sm border transition-colors cursor-pointer ${
                    isDark
                      ? "border-white/20 text-white/70 hover:border-[#EB0028] hover:text-[#EB0028]"
                      : "border-black/20 text-black/70 hover:border-[#EB0028] hover:text-[#EB0028]"
                  }`}
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <div className={`border-t p-4 md:p-6 ${isDark ? "border-white/10" : "border-black/10"}`}>
        <div className="flex items-end gap-3">
          <div className="flex-1 relative">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask me anything..."
              disabled={isTyping}
              className={`w-full font-clash text-sm md:text-base px-4 py-3 rounded-sm outline-none transition-colors ${
                isDark
                  ? "bg-white/5 border border-white/10 text-white placeholder-white/30 focus:border-[#EB0028]"
                  : "bg-black/5 border border-black/10 text-black placeholder-black/30 focus:border-[#EB0028]"
              } disabled:opacity-50`}
            />
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleSend(input)}
            disabled={!input.trim() || isTyping}
            className="bg-[#EB0028] text-white p-3 rounded-sm disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed flex-shrink-0"
          >
            <Send size={18} />
          </motion.button>
        </div>
      </div>
    </div>
  )
}

function formatMessage(content: string): React.ReactNode {
  const parts = content.split(/(\*\*[^*]+\*\*)/g)
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={i} className="font-semibold">
          {part.slice(2, -2)}
        </strong>
      )
    }
    return part
  })
}