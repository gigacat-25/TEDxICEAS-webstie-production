export interface KnowledgeEntry {
  id: string
  category: string
  triggers: string[]
  patterns: RegExp[]
  response: string
  priority: number
}

const speakersList = [
  { name: "Arun Prasanna", title: "Hospitality Business Leader & Entrepreneur" },
  { name: "Dr. Saheer Nelliparamban", title: "Founder & CEO, Paywint | Forbes Council Member" },
  { name: "Fazlur Rahman Khan", title: "Technical Trainer, Linux Foundation | Kubestronaut" },
  { name: "Dr. Ghazala Ahmed Shafi", title: "Chief Dental Surgeon | Laser Specialist of the Year" },
  { name: "Neole Anna Cornelio", title: "International Sprinter | Gold Medalist & Record Holder" },
  { name: "Sanjay R", title: "Community Manager, Google for Developers | Youth Leader" },
  { name: "Shweta Vohra", title: "Architecture Leader, Booking.com | Author & Inventor" },
]

const performersList = []

export const knowledgeBase: KnowledgeEntry[] = [
  {
    id: "event-what",
    category: "Event",
    triggers: ["what is", "tedx", "event", "about"],
    patterns: [/what (is|does).*(tedx|event|this)/i, /tell me about (tedx|the event)/i, /about tedx/i],
    response:
      'TEDxICEAS is an independently organized TEDx event under license from TED. Our theme is **"What shapes us?"** — exploring the ideas, experiences, and people that mold who we become. The event takes place at Visvesvaraya Auditorium, Impact College of Engineering and Applied Sciences, Bengaluru.',
    priority: 3,
  },
  {
    id: "event-what-tedx",
    category: "Event",
    triggers: ["what is tedx", "tedx meaning", "tedx vs ted"],
    patterns: [/what (is|does).*tedx/i, /tell me about tedx/i, /difference.*ted.*tedx/i, /how.*tedx.*different/i],
    response:
      "TEDx is a program of local, self-organized events that bring people together to share a TED-like experience. While TED is a global conference, TEDx events are independently organized in communities worldwide — like TEDxICEAS. Both share the mission of spreading ideas worth sharing. This event is operated under license from TED.",
    priority: 3,
  },
  {
    id: "event-theme",
    category: "Event",
    triggers: ["theme", "what shapes us", "imprints", "meaning"],
    patterns: [/what (is|'s) the theme/i, /theme of (tedx|event)/i, /what shapes us/i, /imprints/i],
    response:
      'The theme of TEDxICEAS is **"What shapes us?"** — a deep dive into the experiences, people, and moments that define who we are. The 2026 edition also celebrates **"Imprints of \'25"**, honoring the lasting impact of last year\'s edition "Threads of Change."',
    priority: 3,
  },
  {
    id: "event-date",
    category: "Event",
    triggers: ["date", "when", "august", "schedule", "day"],
    patterns: [/when (is|will|does) (the |)event/i, /what date/i, /when.*happening/i, /event (date|day)/i, /schedule/i, /timing/i],
    response:
      "TEDxICEAS is scheduled for **August 10, 2026**, from 9:00 AM to 6:00 PM at Visvesvaraya Auditorium. Mark your calendar — it's going to be an unforgettable day of ideas and inspiration!",
    priority: 5,
  },
  {
    id: "event-location",
    category: "Venue",
    triggers: ["venue", "location", "where", "address", "place", "auditorium"],
    patterns: [/where (is|will|does)/i, /(venue|location|address)/i, /how (do i |to )?get there/i, /find/i, /map/i, /directions/i],
    response:
      "The event is at **Visvesvaraya Auditorium**, Impact College of Engineering and Applied Sciences, Kodigehalli, South, 60 Feet Rd, Sahakar Nagar, Koti Hosahalli, Bengaluru, Karnataka 560092. Free parking is available!",
    priority: 5,
  },
  {
    id: "event-parking",
    category: "Venue",
    triggers: ["parking", "car", "park", "drive", "transport"],
    patterns: [/parking/i, /park/i, /car/i, /drive/i, /transport/i, /how (to )?(reach|come|get)/i],
    response:
      "Yes! **Free parking space is available** at the venue. The auditorium is at Impact College of Engineering and Applied Sciences, Bengaluru.",
    priority: 2,
  },
  {
    id: "speakers-list",
    category: "Speakers",
    triggers: ["speaker", "who is", "lineup", "talks", "performers"],
    patterns: [/who (is |are |'s )?(speaking|the speakers)/i, /list of speakers/i, /speaker lineup/i, /who.*talk/i, /any speaker/i, /performers/i, /lineup/i],
    response: `TEDxICEAS 2026 features **7 inspiring speakers**:\n${speakersList.map((s) => `• **${s.name}** — ${s.title}`).join("\n")}\n\nEach speaker brings a unique perspective on what shapes us.`,
    priority: 4,
  },
  ...speakersList.map(
    (speaker): KnowledgeEntry => ({
      id: `speaker-${speaker.name.toLowerCase().replace(/\s+/g, "-")}`,
      category: "Speakers",
      triggers: [speaker.name.toLowerCase().split(" ")[0]],
      patterns: [
        new RegExp(speaker.name.split(" ")[0], "i"),
        new RegExp(speaker.name.replace(/\s+/g, "\\s*"), "i"),
      ],
      response: `**${speaker.name}** is a ${speaker.title} speaking at TEDxICEAS 2026 as part of the "Imprints of '25" edition.`,
      priority: 1,
    })
  ),
  {
    id: "tickets-price",
    category: "Tickets",
    triggers: ["ticket", "price", "cost", "buy", "book", "register", "fee"],
    patterns: [/how much (is|are|does)/i, /ticket (price|cost|fee)/i, /buy.*ticket/i, /book.*(now|ticket)/i, /(student|attendee|faculty).*(price|cost)/i, /purchase/i, /registration/i],
    response:
      "Here are the ticket prices:\n• **Impact College Students**: ₹499 (valid USN required)\n• **Attendees**: ₹599\n\nBook your tickets on the tickets page: /tickets",
    priority: 5,
  },
  {
    id: "tickets-student",
    category: "Tickets",
    triggers: ["student ticket", "student discount", "student price", "impact college student"],
    patterns: [/student.*(ticket|price|discount)/i, /(is there|any) student/i, /impact college.*student/i],
    response:
      "Yes! Impact College Student tickets are **₹499**. You will need a valid USN to register. Book here: /tickets",
    priority: 2,
  },
  {
    id: "tickets-faculty",
    category: "Tickets",
    triggers: ["attendees ticket", "faculty ticket", "professional", "general access"],
    patterns: [/attendee.*(ticket|price)/i, /faculty.*(ticket|price)/i, /professional.*ticket/i, /general.*access/i],
    response:
      "Attendee tickets are **₹599**. Book here: /tickets",
    priority: 2,
  },
  {
    id: "tickets-sold-out",
    category: "Tickets",
    triggers: ["sold out", "available", "availability"],
    patterns: [/sold out/i, /still available/i, /any tickets left/i],
    response:
      "Tickets are currently available! Check the tickets page for real-time availability: /tickets",
    priority: 2,
  },
  {
    id: "contact-email",
    category: "Contact",
    triggers: ["email", "mail", "contact", "reach out"],
    patterns: [/email/i, /contact/i, /reach/i, /get in touch/i, /how (do|can) i (contact|reach)/i],
    response: "You can reach us at **tedxiceas@gmail.com**. We'd love to hear from you!",
    priority: 4,
  },
  {
    id: "contact-social",
    category: "Contact",
    triggers: ["instagram", "linkedin", "social", "follow", "media"],
    patterns: [/instagram/i, /linkedin/i, /social media/i, /follow/i, /social/i],
    response:
      "Follow TEDxICEAS on social media:\n• **Instagram**: instagram.com/tedxiceas\n• **LinkedIn**: linkedin.com/company/tedxiceas\n\nStay tuned for updates, speaker announcements, and behind-the-scenes content!",
    priority: 3,
  },
  {
    id: "team",
    category: "Team",
    triggers: ["team", "organizer", "who runs", "who organizes", "committee", "lead organizer"],
    patterns: [/who (organizes|runs|is behind)/i, /organizing team/i, /core team/i, /volunteer/i, /lead organizer/i, /organizer name/i],
    response:
      "TEDxICEAS is organized by a dedicated team of students and faculty from Impact College of Engineering and Applied Sciences.\n\n• **Thejaswin P** is the Lead Organizer and Licensee.\n• **Mohammed Raif** is the Co Organizer.\n• **Samuel Melvin** is the Event Manager.\n• **Joshua Nikhil** is the Event Producer & Sponsorship Lead.\n• **Saraswati Nag H** is the Event Co-Producer.\n\nYou can visit the **Team** page to learn more about our core team, leads, faculty coordinators, and volunteers!",
    priority: 2,
  },
  {
    id: "grievance-support",
    category: "Support",
    triggers: ["grievance", "support", "officer", "phone number", "contact number", "call", "phone", "help desk"],
    patterns: [/grievance/i, /support/i, /officer/i, /phone/i, /call/i, /contact number/i, /number/i],
    response:
      "For any ticket-related inquiries, support, or grievances, you can contact our Designated Grievance Officer, **Thejaswin P**, at **+91 98457 14699** or write to us at **tedxiceas.alerts@gmail.com**.",
    priority: 4,
  },
  {
    id: "about-college",
    category: "Venue",
    triggers: ["impact college", "college", "iceas", "campus"],
    patterns: [/impact college/i, /iceas/i, /campus/i, /college/i],
    response:
      "Impact College of Engineering and Applied Sciences (ICEAS) is located in Bengaluru, Karnataka. The event is held at **Visvesvaraya Auditorium** on campus. Free parking available!",
    priority: 1,
  },
  {
    id: "faq-tickets-bring",
    category: "Tickets",
    triggers: ["bring to event", "need to bring", "carry", "id required", "entry requirements"],
    patterns: [/what (do|should) i (bring|need)/i, /what to (bring|carry)/i, /entry (requirements|needs)/i, /id.*required/i],
    response:
      "Please bring a **digital or printed copy of your e-ticket** and a **valid Student ID** (if you purchased a student ticket).",
    priority: 2,
  },
  {
    id: "faq-multiple-tickets",
    category: "Tickets",
    triggers: ["limit", "multiple", "more than one", "quantity"],
    patterns: [/how many (tickets|can i)/i, /limit.*ticket/i, /more than one/i, /multiple.*ticket/i, /buy.*multiple/i],
    response:
      "You can purchase **up to 1 ticket per transaction**. If you need more, simply make another purchase.",
    priority: 1,
  },
  {
    id: "faq-ticket-receipt",
    category: "Tickets",
    triggers: ["receive", "delivery", "email ticket", "after payment", "e-ticket"],
    patterns: [/when.*(receive|get) (ticket|it)/i, /after.*payment/i, /e.?ticket/i, /digital.*ticket/i, /where.*(ticket|it)/i],
    response:
      "Once your payment is confirmed, your **e-ticket will be sent to your registered email within 1-2 days**. Please check your spam/junk folder if it doesn't appear in your inbox.",
    priority: 1,
  },
  {
    id: "faq-refund",
    category: "Tickets",
    triggers: ["refund", "cancel", "cancellation", "money back"],
    patterns: [/cancel/i, /refund/i, /money back/i, /cancellation/i],
    response:
      "For ticket cancellations and refunds, please contact the organizing team at **tedxiceas@gmail.com** with your ticket details.",
    priority: 2,
  },
  {
    id: "merchandise",
    category: "General",
    triggers: ["merch", "merchandise", "store", "shop"],
    patterns: [/merch/i, /merchandise/i, /store/i, /shop/i, /buy.*(t.?shirt|hoodie)/i],
    response:
      "Merchandise details will be announced soon! Follow us on Instagram for updates: instagram.com/tedxiceas",
    priority: 1,
  },
  {
    id: "greeting",
    category: "General",
    triggers: ["hi", "hello", "hey", "greetings"],
    patterns: [/^(hi|hello|hey|greetings|yo|sup|good\s*(morning|afternoon|evening))/i],
    response:
      "Hey there! I'm **Mosaic** — your guide to TEDxICEAS. Ask me about the event, speakers, tickets, venue, or anything else you'd like to know!",
    priority: 6,
  },
  {
    id: "thanks",
    category: "General",
    triggers: ["thanks", "thank you", "appreciate"],
    patterns: [/thanks/i, /thank you/i, /appreciate/i, /grateful/i, /thx/i, /ty/i],
    response:
      "You're welcome! If you have more questions, I'm here to help. See you at TEDxICEAS!",
    priority: 2,
  },
  {
    id: "goodbye",
    category: "General",
    triggers: ["bye", "goodbye", "see you"],
    patterns: [/bye/i, /goodbye/i, /see (you|ya)/i, /gotta go/i, /talk later/i, /cya/i],
    response:
      "Goodbye! Can't wait to see you at TEDxICEAS. Remember: it's the pieces that shape us that make the whole!",
    priority: 2,
  },
  {
    id: "help",
    category: "General",
    triggers: ["help", "what can you do", "capabilities", "what do you know"],
    patterns: [/help/i, /what can you (do|tell)/i, /what do you know/i, /capabilities/i, /what (are|is) you/i],
    response:
      "I can help you with:\n• **Event info** — date, venue, theme\n• **Speakers** — lineup, bios\n• **Tickets** — pricing, booking\n• **Venue** — location, parking, directions\n• **Contact** — email, social media\n\nJust ask me anything!",
    priority: 3,
  },
  {
    id: "greeting-name",
    category: "General",
    triggers: ["who are you", "your name", "what is your name", "mosaic"],
    patterns: [/who are you/i, /your name/i, /what('s| is) your name/i, /who.*mosaic/i, /tell me about mosaic/i],
    response:
      "I'm **Mosaic** — the TEDxICEAS chatbot! My name comes from the idea that everything that shapes us — every experience, person, and idea — comes together like pieces of a mosaic to create who we are. Ask me anything about the event!",
    priority: 5,
  },
  {
    id: "journey",
    category: "Event",
    triggers: ["journey", "history", "previous edition", "threads of change"],
    patterns: [/journey/i, /history.*(tedx|event)/i, /previous.*(year|edition)/i, /past.*event/i, /threads of change/i],
    response:
      'TEDxICEAS has grown from past editions. The 2025 edition was themed **"Threads of Change"**, and this year we celebrate **"Imprints of \'25"** — honoring the lasting impact of those who came before. Visit the **Journey** section on the homepage to explore more!',
    priority: 1,
  },
]