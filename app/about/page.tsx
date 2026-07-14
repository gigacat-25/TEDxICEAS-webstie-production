import AboutClient from "./AboutClient";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "About TEDxICEAS | Our Vision & Ideas Worth Spreading",
  description: "Learn about the history of TEDxICEAS, our mission, and our vision for bringing community leaders and changemakers together at Impact College, Bengaluru.",
};

export default function AboutPage() {
  return <AboutClient />;
}
