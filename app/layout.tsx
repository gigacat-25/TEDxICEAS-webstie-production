import type { Metadata, Viewport } from "next";
import { Orbitron } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { ThemeProvider } from "./components/ThemeContext";
import ThemeMetricsProvider from "./components/ThemeMetrics";
import { venue, event } from "@/lib/venue";
import ParticleCanvas from "./components/hero/ParticleCanvas";
import MosaicFloatingButton from "./components/chat/MosaicFloatingButton";
import { ClerkProvider } from "@clerk/nextjs";

// Initialize Orbitron
const orbitron = Orbitron({
  subsets: ["latin"],
  variable: "--font-orbitron",
  weight: ["400", "900"],
});


// Initialize Clash Display
const clashDisplay = localFont({
  src: "./fonts/Clash Display Variable.woff2",
  variable: "--font-clash",
  weight: "200 700",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#000000",
};

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || "https://tedxiceas.com"),
  title: {
    default: "TEDxICEAS 2026 | What shapes us? | Official TEDx Event Bengaluru",
    template: "%s | TEDxICEAS 2026",
  },
  description: event.description,
  keywords: event.keywords,
  authors: [{ name: "TEDxICEAS Team" }],
  creator: "TEDxICEAS",
  publisher: "TEDxICEAS",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: "https://tedxiceas.com",
  },
  openGraph: {
    type: "website",
    title: "TEDxICEAS 2026 | What shapes us? | Official TEDx Event Bengaluru",
    description: event.description,
    url: "https://tedxiceas.com",
    siteName: "TEDxICEAS",
    images: [
      {
        url: "https://tedxiceas.com/logo-white.png",
        width: 1200,
        height: 630,
        alt: "TEDxICEAS 2026 - What shapes us? Event in Bengaluru",
      },
    ],
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "TEDxICEAS 2026 | What shapes us?",
    description: event.description,
    images: ["https://tedxiceas.com/logo-white.png"],
    creator: "@TEDxICEAS",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const eventStructuredData = {
    "@context": "https://schema.org",
    "@type": "Event",
    name: "TEDxICEAS 2026 - What shapes us?",
    alternateName: ["TEDxICEAS", "TEDx ICEAS", "TEDx ICEAS 2026", "TEDx Bengaluru 2026"],
    description:
      "TEDxICEAS 2026 is an independently organized TEDx event under license from TED. Theme: 'What shapes us?'. Held at Visvesvaraya Auditorium, Impact College of Engineering and Applied Sciences, Bengaluru.",
    startDate: event.startDate,
    endDate: event.endDate,
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    eventStatus: "https://schema.org/EventScheduled",
    url: "https://tedxiceas.com",
    image: [
      "https://tedxiceas.com/logo-white.png",
      "https://tedxiceas.com/speakers/hospitality-leader.jpg",
      "https://tedxiceas.com/speakers/dr-saheer-nelliparamban.jpg",
      "https://tedxiceas.com/speakers/fazlur-rahman-khan.jpg",
    ],
    location: {
      "@type": "Place",
      name: venue.name,
      address: {
        "@type": "PostalAddress",
        streetAddress: venue.streetAddress,
        addressLocality: venue.locality,
        addressRegion: venue.region,
        postalCode: venue.postalCode,
        addressCountry: venue.country,
      },
      geo: {
        "@type": "GeoCoordinates",
        latitude: venue.coordinates.lat,
        longitude: venue.coordinates.lng,
      },
    },
    organizer: {
      "@type": "Organization",
      name: "TEDxICEAS",
      url: "https://tedxiceas.com",
      email: "tedxiceas@gmail.com",
    },
    performer: event.speakers.map((sp) => ({
      "@type": "Person",
      name: sp.name,
      jobTitle: sp.jobTitle,
      description: sp.description,
      image: sp.image,
    })),
    offers: [
      {
        "@type": "Offer",
        name: "Impact College Student Pass",
        price: "499",
        priceCurrency: "INR",
        url: "https://tedxiceas.com/tickets",
        availability: "https://schema.org/InStock",
        validFrom: "2026-01-01",
      },
      {
        "@type": "Offer",
        name: "Attendee Pass",
        price: "599",
        priceCurrency: "INR",
        url: "https://tedxiceas.com/tickets",
        availability: "https://schema.org/InStock",
        validFrom: "2026-01-01",
      },
    ],
  };

  const websiteStructuredData = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "TEDxICEAS",
    url: "https://tedxiceas.com",
    potentialAction: {
      "@type": "SearchAction",
      target: "https://tedxiceas.com/search?q={search_term_string}",
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning={true}>
        <head>
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(eventStructuredData) }}
          />
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteStructuredData) }}
          />
          <meta name="theme-color" content="#000000" />
          <meta property="og:type" content="website" />
          <link rel="icon" href="/favicon.ico" />
        </head>
        <body
          className={`${orbitron.variable} ${clashDisplay.variable} antialiased`}
        >
          <ThemeProvider>
            <ThemeMetricsProvider />
            <ParticleCanvas />
            {children}
            <MosaicFloatingButton />
          </ThemeProvider>
          <Analytics />
          <SpeedInsights />
        </body>
      </html>
    </ClerkProvider>
  );
}
