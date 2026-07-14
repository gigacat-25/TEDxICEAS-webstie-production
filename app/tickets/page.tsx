import TicketsClient from "./TicketsClient";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Get Tickets | TEDxICEAS 2026 Pass Registration | Bengaluru",
  description: "Book your entry pass for TEDxICEAS 2026. Choose from Faculty and pre-authorized Student tickets to attend the premier TEDx event in Sahakar Nagar, Bengaluru.",
};

export default function TicketsPage() {
  return <TicketsClient />;
}
