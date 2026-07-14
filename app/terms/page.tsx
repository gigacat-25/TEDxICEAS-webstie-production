import TermsClient from "./TermsClient";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Ticketing Terms & DPDP Privacy Policy | TEDxICEAS 2026",
  description: "Review the ticketing terms, refund policies, and DPDP Act (2023) privacy consent notice for TEDxICEAS registrations.",
};

export default function TermsPage() {
  return <TermsClient />;
}
