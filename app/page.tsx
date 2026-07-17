import HomeClient from "./HomeClient";
import { Metadata } from "next";
import { event } from "@/lib/venue";

export const metadata: Metadata = {
  title: "TEDxICEAS 2026 | What shapes us? | Official TEDx Event Bengaluru",
  description:
    "Join TEDxICEAS 2026 at Visvesvaraya Auditorium, Impact College of Engineering, Sahakar Nagar, Bengaluru. Featuring inspiring talks from Huda Thamanna, Arun Prasanna, Dr. Saheer Nelliparamban, Fazlur Rahman Khan, Dr. Ghazala Ahmed Shafi, Neole Anna Cornelio, Sanjay R, Shweta Vohra & more.",
  keywords: event.keywords,
  alternates: {
    canonical: "https://tedxiceas.com",
  },
  openGraph: {
    title: "TEDxICEAS 2026 | What shapes us? | Official TEDx Event Bengaluru",
    description:
      "Join TEDxICEAS 2026 at Visvesvaraya Auditorium, Impact College of Engineering, Sahakar Nagar, Bengaluru. Book your passes today!",
    url: "https://tedxiceas.com",
    siteName: "TEDxICEAS",
    images: [
      {
        url: "https://tedxiceas.com/logo-white.png",
        width: 1200,
        height: 630,
        alt: "TEDxICEAS 2026 - What shapes us?",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "TEDxICEAS 2026 | What shapes us?",
    description: "Join TEDxICEAS 2026 at Visvesvaraya Auditorium, Bengaluru. Book your passes today!",
    images: ["https://tedxiceas.com/logo-white.png"],
  },
};

export default function Home() {
  return <HomeClient />;
}
