"use client";

import { Icon } from "@iconify/react";
import { useState, useEffect } from "react";
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useTransform,
} from "framer-motion";
import { Link } from "@tanstack/react-router";

import Logo from "../assets/Logo.png";

import AffiliateCard from "./AffiliateCard";
import PrizeFeed from "./PrizeFeed";
import KaspaPriceFeed from "./KaspaPriceFeed";
import SwipeGuide from "./SwipeGuide";
import WalletButton from "./WalletButton";

const navLinks = [
  {
    href: "#games",
    icon: "ph:club-fill",
    label: "Casino",
  },
  {
    href: "#about",
    icon: "ph:question-fill",
    label: "About",
  },
  {
    href: "/leaderboard",
    icon: "ph:trophy-fill",
    label: "Leaderboard",
  },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const dragX = useMotionValue(0);
  const dragOpacity = useTransform(dragX, [0, 100], [0, 1]);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartX, setDragStartX] = useState(0);

  // Close menu when screen size becomes large
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Prevent scroll when mobile menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const handleDragStart = (event: any) => {
    setIsDragging(true);
    setDragStartX(event.clientX);
  };

  const handleDrag = (_: any, info: any) => {
    if (!isOpen && info.offset.x > 0) {
      dragX.set(info.offset.x);
    }
  };

  const handleDragEnd = (event: any, _: any) => {
    setIsDragging(false);
    const dragDistance = event.clientX - dragStartX;

    if (!isOpen && dragDistance > 50) {
      setIsOpen(true);
    } else if (isOpen && dragDistance < -50) {
      setIsOpen(false);
    }

    dragX.set(0);
  };

  const sidebarContent = (
    <div className="flex flex-col h-full">
      <div className="flex flex-col gap-3">
        <Link to="/" className="flex items-center gap-2">
          <img
            src={Logo}
            alt="Kasino Logo"
            width={70}
            height={70}
            className=""
          />
        </Link>
        <KaspaPriceFeed />
        <div className="bg-[#2A2A2A] rounded-xl p-3 space-y-2">
          {navLinks.map((link, index) =>
            link.href.startsWith("#") ? (
              <a
                key={index}
                href={link.href}
                className="flex items-center gap-2.5 text-[11px] text-white/70 hover:text-[#6fc7ba] transition-colors p-2 rounded-lg hover:bg-white/5"
                onClick={() => setIsOpen(false)}
              >
                <div className="bg-white/10 p-1.5 rounded-lg">
                  <Icon icon={link.icon} className="text-sm" />
                </div>
                {link.label}
              </a>
            ) : (
              <Link
                key={index}
                to={link.href}
                className="flex items-center gap-2.5 text-[11px] text-white/70 hover:text-[#6fc7ba] transition-colors p-2 rounded-lg hover:bg-white/5"
                onClick={() => setIsOpen(false)}
              >
                <div className="bg-white/10 p-1.5 rounded-lg">
                  <Icon icon={link.icon} className="text-sm" />
                </div>
                {link.label}
              </Link>
            ),
          )}
        </div>
      </div>
      <div className="space-y-3 mt-3 flex-1 overflow-y-auto scrollbar rounded-xl">
        <PrizeFeed />
        <AffiliateCard />
      </div>
      <div className="mt-3">
        <WalletButton />
      </div>
    </div>
  );

  return (
    <>
      <SwipeGuide />

      {/* Desktop Sidebar */}
      <div className="fixed top-0 left-0 h-screen mt-10 w-[245px] bg-[#1A1A1A] border-r border-white/10 hidden md:block">
        <nav className="h-[calc(100vh-40px)] border-r border-white/10 flex-col p-4 z-30 bg-[#231f20] font-medium text-base w-[245px] overflow-y-auto scrollbar">
          {sidebarContent}
        </nav>
      </div>

      {/* Mobile Swipe Area */}
      <motion.div
        className="fixed left-0 top-0 w-16 h-screen z-40 lg:hidden touch-pan-right"
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.2}
        onDragStart={handleDragStart}
        onDrag={handleDrag}
        onDragEnd={handleDragEnd}
        style={{ x: dragX }}
      >
        {isDragging && (
          <motion.div
            className="absolute inset-0 bg-[#6fc7ba]/10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          />
        )}
      </motion.div>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm"
              onClick={() => setIsOpen(false)}
              style={{ opacity: dragOpacity }}
            />
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{
                type: "spring",
                stiffness: 300,
                damping: 30,
              }}
              className="fixed top-0 left-0 h-screen w-[300px] bg-[#231f20] z-50 lg:hidden p-4 pt-8 overflow-y-auto dark-scrollbar"
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.2}
              onDragEnd={(_, info) => {
                if (info.offset.x < -50) {
                  setIsOpen(false);
                }
              }}
            >
              {sidebarContent}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
