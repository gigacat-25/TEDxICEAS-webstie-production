import SponsorsClient from "./SponsorsClient";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Our Partners & Sponsors | Support TEDxICEAS 2026",
  description: "Meet the sponsors and partners of TEDxICEAS 2026. Discover the organizations enabling innovation, ideas, and creativity in Sahakar Nagar, Bengaluru.",
};

export default function SponsorsPage() {
  return <SponsorsClient />;
}
