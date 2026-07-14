import HomeClient from "./HomeClient";
import { Metadata } from "next";
import { event } from "@/lib/venue";

export const metadata: Metadata = {
  title: "TEDxICEAS 2026 | What shapes us? | TEDx Event Sahakar Nagar, Bengaluru",
  description: "Join TEDxICEAS 2026 at Visvesvaraya Auditorium, Bengaluru. Explore our theme 'What shapes us?' with inspiring live talks, innovational speakers, and creative performances.",
  keywords: event.keywords,
};

export default function Home() {
  return <HomeClient />;
}
