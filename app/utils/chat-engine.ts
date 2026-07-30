import { knowledgeBase, type KnowledgeEntry } from "@/app/data/chat-knowledge"

export interface MatchResult {
  entry: KnowledgeEntry
  score: number
}

function normalize(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
}

function scoreByKeywords(input: string, entry: KnowledgeEntry): number {
  const normalized = normalize(input)
  let score = 0

  for (const trigger of entry.triggers) {
    const normalizedTrigger = normalize(trigger)
    if (normalized.includes(normalizedTrigger)) {
      score += normalizedTrigger.split(/\s+/).length
    }
  }

  return score
}

function scoreByPatterns(input: string, entry: KnowledgeEntry): number {
  for (const pattern of entry.patterns) {
    if (pattern.test(input)) {
      return entry.priority * 3
    }
  }
  return 0
}

function scoreByWordOverlap(input: string, entry: KnowledgeEntry): number {
  const inputWords = new Set(normalize(input).split(/\s+/).filter((w) => w.length > 2))
  const triggerWords = new Set(
    entry.triggers.flatMap((t) => normalize(t).split(/\s+/).filter((w) => w.length > 2))
  )

  let overlap = 0
  for (const word of inputWords) {
    if (triggerWords.has(word)) {
      overlap++
    }
  }

  return overlap * 2
}

function getFallbackResponse(input: string): string {
  const normalized = normalize(input)
  const wordCount = normalized.split(/\s+/).length

  if (wordCount < 3) {
    return "I'm not sure I understand. Try asking me about the event, speakers, tickets, venue, or contact info!"
  }

  return "I'm not sure about that yet, but I can help you with:\n\n• **Event info** — date, venue, theme \"What shapes us?\"\n• **Speakers** — who's speaking, their bios\n• **Tickets** — pricing (Impact College Students ₹499 / Attendees & Faculty ₹500)\n• **Venue** — location, parking\n• **Contact** — email, social media\n\nWhat would you like to know?"
}

export function findBestMatch(input: string): MatchResult | null {
  let best: MatchResult | null = null

  for (const entry of knowledgeBase) {
    const keywordScore = scoreByKeywords(input, entry)
    const patternScore = scoreByPatterns(input, entry)
    const overlapScore = scoreByWordOverlap(input, entry)

    const totalScore = keywordScore + patternScore + overlapScore

    if (totalScore > 0 && (!best || totalScore > best.score)) {
      best = { entry, score: totalScore }
    }
  }

  return best
}

export function getResponse(input: string): string {
  const match = findBestMatch(input.trim())

  if (match && match.score >= 2) {
    return match.entry.response
  }

  return getFallbackResponse(input)
}

export function getSuggestedQuestions(): string[] {
  return [
    "When is the event?",
    "Who are the speakers?",
    "How much are tickets?",
    "Where is the venue?",
    "What is the theme?",
  ]
}