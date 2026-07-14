"use client";

import { useRef, useState, useEffect } from "react";
import Navbar from "./components/Navbar";
import Loader from "./components/Loader";
import Hero from "./components/Hero";
import Countdown from "./components/countdown/Countdown";
import Speakers from "./components/Speakers/Speakers";
import Footer from "./components/Footer";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import About from "./components/about";
import EchoesHero from "./components/EchoesHero";
import Journey from "./components/journey";


gsap.registerPlugin(ScrollTrigger);

export default function Home() {
  const containerRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const aboutRef = useRef<HTMLDivElement>(null);
  const speakersRef = useRef<HTMLDivElement>(null);
  const countdownRef = useRef<HTMLDivElement>(null);
  const echoesHeroRef = useRef<HTMLDivElement>(null);
  const footerRef = useRef<HTMLDivElement>(null);
  const [loaderFinished, setLoaderFinished] = useState(false);
  const [heroFinished, setHeroFinished] = useState(false);
  const [aboutInView, setAboutInView] = useState(false);
  const [speakersInView, setSpeakersInView] = useState(false);
  const [countdownInView, setCountdownInView] = useState(false);
  const [footerInView, setFooterInView] = useState(false);
  const [navbarFinished, setNavbarFinished] = useState(false);
  const [echoesHeroInView, setEchoesHeroInView] = useState(false);

  useEffect(() => {
    if (!heroFinished && !loaderFinished) {
    }
  }, []);

  useEffect(() => {
    if (!heroFinished) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
      // Refresh ScrollTrigger after unlocking overflow to ensure calculations are correct
      ScrollTrigger.refresh();
    }
  }, [heroFinished]);

  useEffect(() => {
    window.history.scrollRestoration = "manual";
    if (window.location.hash) {
      const id = window.location.hash.substring(1);
      setTimeout(() => {
        const el = document.getElementById(id);
        if (el) el.scrollIntoView({ behavior: "smooth" });
      }, 500); // Wait for loader and layout to settle
    } else {
      window.scrollTo(0, 0);
    }
  }, []);

  useGSAP(() => {
    if (navbarFinished && !loaderFinished) {
    }
  }, [navbarFinished, loaderFinished]);

  useGSAP(() => {
    if (loaderFinished) {
      // Triggers for components
      ScrollTrigger.create({
        trigger: aboutRef.current,
        start: "top 60%",
        onEnter: () => setAboutInView(true),
      });

      ScrollTrigger.create({
        trigger: speakersRef.current,
        start: "top 60%",
        onEnter: () => setSpeakersInView(true),
      });

      ScrollTrigger.create({
        trigger: countdownRef.current,
        start: "top 60%",
        onEnter: () => setCountdownInView(true),
      });

      ScrollTrigger.create({
        trigger: footerRef.current,
        start: "top 60%",
        onEnter: () => setFooterInView(true),
      });

      ScrollTrigger.create({
        trigger: echoesHeroRef.current,
        start: "top 60%",
        onEnter: () => setEchoesHeroInView(true),
      });
    }
  }, [loaderFinished]);

  return (
    <main ref={containerRef}>
      <Loader onComplete={() => setLoaderFinished(true)} />
      <Navbar startAnimation={loaderFinished} />

      <section
        ref={heroRef}
        className="panel min-h-screen w-full relative snap-start"
      >
        <Hero
          startAnimation={loaderFinished}
          onComplete={() => {
            setHeroFinished(true);
          }}
        />
      </section>

      <section id="about" ref={aboutRef} className="panel min-h-screen w-full relative bg-black snap-start">
        <About startAnimation={aboutInView} />
      </section>

      <section
        ref={countdownRef}
        className="panel min-h-screen w-full relative bg-black snap-start"
      >
        <Countdown startAnimation={countdownInView} />
      </section>

      <section id="speakers" ref={speakersRef} className="panel min-h-screen w-full relative bg-black snap-start">
        <Speakers startAnimation={speakersInView} />
      </section>

      <section
        ref={echoesHeroRef}
        className="panel min-h-[125vh] w-full relative bg-black snap-start"
      >
        <EchoesHero startAnimation={echoesHeroInView} />
      </section>

      <section id="journey" className="panel min-h-screen w-full relative bg-black snap-start">
        <Journey />
      </section>

      <section id="contact" ref={footerRef} className="panel min-h-screen w-full relative bg-black snap-start">
        <Footer startAnimation={footerInView} />
      </section>

      </main>
  );
}
