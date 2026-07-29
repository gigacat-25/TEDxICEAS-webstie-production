import SpeakersPageClient from "./SpeakersPageClient";
import { Metadata } from "next";
import { event } from "@/lib/venue";

export const metadata: Metadata = {
  title: "Official Speakers 2026 | Lineup & Bios | TEDxICEAS Bengaluru",
  description:
    "Discover the official speaker lineup for TEDxICEAS 2026. Read full bios and profiles for Huda Thamanna, Arun Prasanna, Dr. Saheer Nelliparamban, Fazlur Rahman Khan, Dr. Ghazala Ahmed Shafi, Neole Anna Cornelio, Sanjay R, Shweta Vohra, Dr. Lokesh B, Manish Kankaria, and Kapil Ahuja.",
  keywords: event.keywords,
  alternates: {
    canonical: "https://tedxiceas.com/speakers",
  },
  openGraph: {
    title: "Official Speakers 2026 | TEDxICEAS Bengaluru",
    description:
      "Meet the visionary speakers, creators, leaders, and champions speaking at TEDxICEAS 2026 at Visvesvaraya Auditorium, Bengaluru.",
    url: "https://tedxiceas.com/speakers",
    siteName: "TEDxICEAS",
    images: [
      {
        url: "https://tedxiceas.com/logo-white.png",
        width: 1200,
        height: 630,
        alt: "TEDxICEAS 2026 Speakers",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Official Speakers 2026 | TEDxICEAS Bengaluru",
    description: "Discover the official speaker lineup for TEDxICEAS 2026.",
    images: ["https://tedxiceas.com/logo-white.png"],
  },
};

export default function SpeakersPage() {
  return <SpeakersPageClient />;
}
