"use client";

import { motion } from "framer-motion";
import { Icon } from "@iconify/react";
import { useEffect, useState } from "react";

export default function SwipeGuide() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if this is the first visit
    const hasVisited = localStorage.getItem('hasVisitedBefore');
    if (!hasVisited) {
      setIsVisible(true);
      localStorage.setItem('hasVisitedBefore', 'true');
    }
  }, []);

  if (!isVisible) return null;

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="fixed left-4 top-1/2 -translate-y-1/2 z-50 bg-[#2A2A2A] p-4 rounded-xl shadow-lg border border-white/10 w-[200px] lg:hidden"
    >
      <button 
        onClick={() => setIsVisible(false)}
        className="absolute top-2 right-2 text-white/50 hover:text-white/80"
      >
        <Icon icon="ph:x-bold" className="text-sm" />
      </button>
      
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Icon icon="ph:hand-pointing-bold" className="text-[#6fc7ba] text-xl" />
          <p className="text-xs font-medium text-white/90">Swipe right to open menu</p>
        </div>
        <motion.div
          animate={{
            x: [0, 20, 0]
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="bg-white/10 h-1 w-12 rounded-full"
        />
      </div>
    </motion.div>
  );
} 