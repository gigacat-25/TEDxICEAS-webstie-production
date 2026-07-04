import type { Metadata } from "next";
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

export const metadata: Metadata = {
  title: event.name,
  description: event.description,
  keywords: event.keywords,
  authors: [{ name: "TEDxICEAS" }],
  creator: "TEDxICEAS",
  publisher: "TEDxICEAS",
  robots: "index, follow",
  viewport: "width=device-width, initial-scale=1, maximum-scale=5",
  openGraph: {
    type: "website",
    title: event.name,
    description: event.description,
    images: [
      {
        url: "/logo-white.png",
        width: 1200,
        height: 630,
        alt: "TEDxICEAS - What shapes us?",
      },
    ],
    locale: "en_US",
    siteName: "TEDxICEAS",
  },
  twitter: {
    card: "summary_large_image",
    title: event.name,
    description: event.description,
    images: ["/logo-white.png"],
    creator: "@TEDxICEAS",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Event",
    name: "TEDxICEAS - What shapes us?",
    description:
      "TEDxICEAS - What shapes us? An exclusive gathering of innovative minds at Visvesvaraya Auditorium, Impact College of Engineering and Applied Sciences, Bengaluru.",
    startDate: event.startDate,
    endDate: event.endDate,
    eventAttendanceMode: "OfflineEventAttendanceMode",
    eventStatus: "EventScheduled",
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
    },
    organizer: {
      "@type": "Organization",
      name: "TEDxICEAS",
    },
    image: ["/logo-white.png"],
  };

  return (
    <html lang="en" suppressHydrationWarning={true} className="snap-y snap-proximity">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
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
  );
}