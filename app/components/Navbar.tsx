"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence, useScroll, useMotionValueEvent, Variants } from "framer-motion";
import { useTheme } from "./ThemeContext";
import { useCoreMetrics } from "./ThemeMetrics";
import { useAuth } from "@clerk/nextjs";

const navLinks = [
  { name: "MOSAIC", href: "/chat" },
  { name: "ABOUT", href: "/about" },
  { name: "SPEAKERS", href: "/speakers" },
  { name: "ROADMAP", href: "/roadmap" },
  { name: "SPONSORS", href: "/sponsors" },
  { name: "JOURNEY", href: "/#journey" },
  { name: "TEAM", href: "/team" },
];

const mobileItems = [
  { id: "1", name: "MOSAIC", href: "/chat" },
  { id: "2", name: "ABOUT", href: "/about" },
  { id: "3", name: "SPEAKERS", href: "/speakers" },
  { id: "4", name: "ROADMAP", href: "/roadmap" },
  { id: "5", name: "SPONSORS", href: "/sponsors" },
  { id: "6", name: "JOURNEY", href: "/#journey" },
  { id: "7", name: "TEAM", href: "/team" },
];

const Navbar = ({ startAnimation = true }: { startAnimation?: boolean }) => {
  const pathname = usePathname();
  const { isSignedIn } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showBookBtn, setShowBookBtn] = useState(false);
  const { scrollY } = useScroll();
  const { theme, toggleTheme } = useTheme();

  const currentNavLinks = [
    ...navLinks.slice(0, 5),
    ...(isSignedIn ? [{ name: "MY TICKETS", href: "/my-tickets" }] : []),
    ...navLinks.slice(5)
  ];

  const currentMobileItems = [
    ...mobileItems.slice(0, 5),
    ...(isSignedIn ? [{ id: "6", name: "MY TICKETS", href: "/my-tickets" }] : []),
    ...mobileItems.slice(5).map((item) => ({
      ...item,
      id: isSignedIn ? "7" : "6"
    }))
  ];

  if (pathname === "/team") return null;

  useMotionValueEvent(scrollY, "change", (latest) => {
    // Show button after scrolling past 80vh
    if (latest > window.innerHeight * 0.8 && !showBookBtn) {
      setShowBookBtn(true);
    } else if (latest <= window.innerHeight * 0.8 && showBookBtn) {
      setShowBookBtn(false);
    }
  });

  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  }, [isMenuOpen]);

  // Mobile Menu Variants
  const menuVariants: Variants = {
    closed: {
      opacity: 0,
      transition: { duration: 0.3, ease: "easeInOut", when: "afterChildren" }
    },
    open: {
      opacity: 1,
      transition: { duration: 0.3, ease: "easeInOut", when: "beforeChildren" }
    }
  };

  const metrics = useCoreMetrics();

  const menuItemVariants: Variants = {
    closed: { y: metrics.y, opacity: metrics.opacity - 1 },
    open: (i: number) => ({
      y: 0,
      opacity: metrics.opacity,
      transition: { delay: i * metrics.stagger, duration: 0.5, ease: "easeOut" }
    })
  };

  return (
    <>
      <motion.nav
        id="navbar"
        initial={{ y: -100, opacity: 0 }}
        animate={startAnimation ? { y: 0, opacity: 1 } : { y: -100, opacity: 0 }}
        transition={{ duration: 1, ease: "easeOut", delay: 0.5 }} // Delay for loader
        className={`w-full h-[70px] flex items-center justify-between px-6 md:px-10 z-[120] fixed top-0 left-0 pointer-events-auto ${theme === "dark" ? "bg-black" : "bg-white"}`}
      >
        {/* Logo */}
        <AnimatePresence>
          {!isMenuOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex-shrink-0 flex items-center cursor-default select-none -ml-8 md:ml-0"
            >
              <Image
                src={theme === "dark" ? "/logo-white.png" : "/logo-black.png"}
                alt="TEDxICEAS Logo"
                width={180}
                height={40}
                className="object-contain h-[32px] md:h-[40px]"
                priority
                unoptimized
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Mobile Menu Trigger (Hamburger) */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="md:hidden ml-auto flex flex-col justify-center items-center gap-1.5 w-9 h-9 focus:outline-none z-[120] relative"
          aria-label={isMenuOpen ? "Close menu" : "Open menu"}
        >
          <motion.span
            animate={isMenuOpen ? { rotate: 45, y: 4.5, backgroundColor: theme === "dark" ? "#ffffff" : "#000000" } : { rotate: 0, y: 0, backgroundColor: theme === "dark" ? "#ffffff" : "#000000" }}
            className={`block w-6 h-[3px] rounded-sm origin-center ${theme === "dark" ? "bg-white" : "bg-black"}`}
          />
          <motion.span
            animate={isMenuOpen ? { rotate: -45, y: -4.5, backgroundColor: theme === "dark" ? "#ffffff" : "#000000" } : { rotate: 0, y: 0, backgroundColor: theme === "dark" ? "#ffffff" : "#000000" }}
            className={`block w-6 h-[3px] rounded-sm origin-center ${theme === "dark" ? "bg-white" : "bg-black"}`}
          />
        </motion.button>

        {/* Desktop Navigation Links */}
        <div className="hidden md:flex items-center mt-1 mr-10">
          <div className="flex items-center gap-12">
            {currentNavLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                onClick={(e) => {
                  if (pathname === '/' && link.href.startsWith('/#')) {
                    e.preventDefault();
                    const targetId = link.href.substring(2);
                    const elem = document.getElementById(targetId);
                    if (elem) elem.scrollIntoView({ behavior: 'smooth' });
                  }
                }}
                className={`font-clash font-normal text-[14px] leading-[100%] tracking-[-0.02em] hover:text-[#EB0028] transition-colors cursor-pointer py-4 ${theme === "dark" ? "text-white" : "text-black"}`}
              >
                {link.name}
              </Link>
            ))}
          </div>

          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            className={`ml-6 p-2 rounded-full transition-colors cursor-pointer ${theme === "dark" ? "bg-white/10 hover:bg-white/20" : "bg-black/10 hover:bg-black/20"}`}
            aria-label="Toggle theme"
          >
            {theme === "dark" ? (
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-white">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-black">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z" />
              </svg>
            )}
          </button>

          {/* Book Now Button (appears on scroll) */}
          <motion.div
            className="overflow-hidden"
            initial={{ width: 0, opacity: 0, marginLeft: 0 }}
            animate={showBookBtn ? { width: "auto", opacity: 1, marginLeft: "2rem" } : { width: 0, opacity: 0, marginLeft: 0 }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
          >
            <Link href="/tickets">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="relative bg-[#EB0028] hover:bg-[#B71C1C] text-white font-clash font-normal text-[14px] leading-[100%] tracking-[-0.02em] py-4 px-8 transition-colors duration-300 z-[100] cursor-pointer whitespace-nowrap"
              >
                BOOK NOW
              </motion.button>
            </Link>
          </motion.div>
        </div>
      </motion.nav>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            key="mobile-menu"
            initial="closed"
            animate="open"
            exit="closed"
            variants={menuVariants}
            className={`fixed inset-0 z-[110] flex flex-col pointer-events-auto ${theme === "dark" ? "bg-black" : "bg-white"}`}
          >
            {/* Menu Items */}
            <div className="flex-1 flex flex-col justify-start pt-24 px-8 overflow-y-auto">
              <div className="space-y-8">
                {currentMobileItems.map((item, i) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={(e) => {
                      setIsMenuOpen(false);
                      if (pathname === '/' && item.href.startsWith('/#')) {
                        e.preventDefault();
                        const targetId = item.href.substring(2);
                        const elem = document.getElementById(targetId);
                        if (elem) elem.scrollIntoView({ behavior: 'smooth' });
                      }
                    }}
                    className="flex items-center gap-6 group"
                  >
                    <motion.div
                      custom={i}
                      variants={menuItemVariants}
                      className="bg-[#EB0028] text-white font-clash text-sm w-8 h-8 flex items-center justify-center"
                    >
                      {item.id}
                    </motion.div>
                    <motion.span
                      custom={i}
                      variants={menuItemVariants}
                      className={`font-clash font-light text-3xl tracking-wide group-hover:text-[#EB0028] transition-colors ${theme === "dark" ? "text-white" : "text-black"}`}
                    >
                      {item.name}
                    </motion.span>
                  </Link>
                ))}
              </div>

              <motion.div
                variants={menuItemVariants}
                custom={4}
                className={`w-full h-[1px] my-8 ${theme === "dark" ? "bg-gray-800" : "bg-gray-300"}`}
              />

              {/* Theme Toggle in Mobile Menu */}
              <motion.div variants={menuItemVariants} custom={5} className="mb-4">
                <button
                  onClick={toggleTheme}
                  className={`flex items-center gap-4 py-2 px-4 rounded-lg transition-colors cursor-pointer ${theme === "dark" ? "bg-white/10 text-white" : "bg-black/10 text-black"}`}
                >
                  {theme === "dark" ? (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z" />
                    </svg>
                  )}
                  <span className="font-clash text-lg">
                    {theme === "dark" ? "Light Mode" : "Dark Mode"}
                  </span>
                </button>
              </motion.div>

              {/* Bottom Section */}
              <motion.div variants={menuItemVariants} custom={5}>
                <p className="text-gray-400 text-sm font-clash pb-1">Join the experience!</p>
                <Link href="/tickets" onClick={() => setIsMenuOpen(false)}>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.95 }}
                    className="w-full bg-[#EB0028] text-white font-clash font-bold py-6 text-3xl tracking-wider hover:bg-[#c00020] transition-colors uppercase"
                  >
                    Book Now
                  </motion.button>
                </Link>
              </motion.div>
            </div>

            {/* Footer Socials */}
            <motion.div variants={menuItemVariants} custom={6} className="px-8 pb-8 flex items-center gap-6">
              <a href="https://www.instagram.com/tedxiceas/" target="_blank" rel="noopener noreferrer" className="transition-colors hover:opacity-80">
                <Image
                  src="/instagram.svg"
                  alt="Instagram"
                  width={20}
                  height={20}
                  className="w-5 h-5 text-white"
                />
              </a>
              <a href="https://www.linkedin.com/company/tedxiceas" target="_blank" rel="noopener noreferrer" className="transition-colors hover:opacity-80">
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
              </a>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;