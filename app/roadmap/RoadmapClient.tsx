"use client";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import EventRoadmap from "../components/EventRoadmap";

export default function RoadmapClient() {
  return (
    <main className="min-h-screen bg-black text-white flex flex-col justify-between">
      <Navbar startAnimation={true} />
      <div className="pt-24 pb-12">
        <EventRoadmap />
      </div>
      <Footer startAnimation={true} />
    </main>
  );
}
