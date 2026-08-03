import RoadmapClient from "./RoadmapClient";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Event Roadmap & Schedule | TEDxICEAS 2026",
  description:
    "Explore the complete interactive event flow and talk schedule for TEDxICEAS 2026: What Shapes Us. Discover session timings, speaker keynotes, performances, and break schedules.",
  openGraph: {
    title: "Event Roadmap & Schedule | TEDxICEAS 2026",
    description: "Interactive timeline & event flow for TEDxICEAS 2026 at Visvesvaraya Auditorium, Bengaluru.",
    url: "https://tedxiceas.com/roadmap",
  },
};

export default function RoadmapPage() {
  return <RoadmapClient />;
}
