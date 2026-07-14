import TeamClient from "./TeamClient";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Organizing Committee & Team | Behind TEDxICEAS 2026",
  description: "Meet the organizers, creators, and core team members bringing TEDxICEAS 2026 to life. Discover the village behind the ideas worth spreading.",
};

export default function TeamPage() {
  return <TeamClient />;
}
