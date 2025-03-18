"use client";

import { useState } from "react";
import { Icon } from "@iconify/react";
import { motion } from "framer-motion";

interface WinningData {
  username: string;
  amount: number;
  game: string;
  time: string;
  multiplier: number;
  betAmount: number;
  currency: string;
}

export default function Marquee() {
  const [winnings, _] = useState<WinningData[]>([
    {
      username: "Player123",
      amount: 1500,
      betAmount: 50,
      multiplier: 30,
      game: "Coin Flip",
      time: "2m ago",
      currency: "KAS",
    },
    {
      username: "LuckyWinner",
      amount: 2800,
      betAmount: 40,
      multiplier: 70,
      game: "Dice Roll",
      time: "5m ago",
      currency: "KAS",
    },
    {
      username: "CryptoKing",
      amount: 5000,
      betAmount: 100,
      multiplier: 50,
      game: "Coin Flip",
      time: "8m ago",
      currency: "KAS",
    },
    {
      username: "Dicemaster",
      amount: 1800,
      betAmount: 30,
      multiplier: 60,
      game: "Dice Roll",
      time: "12m ago",
      currency: "KAS",
    },
  ]);

  return (
    <div className="bg-[#222] border-b border-white/10 fixed top-0 w-full right-0 z-50">
      <div className="overflow-hidden text-white/70">
        <motion.div
          className="whitespace-nowrap py-2 inline-block pl-4 md:pl-0"
          animate={{
            x: ["100%", "-100%"],
          }}
          transition={{
            duration: 30,
            ease: "linear",
            repeat: Infinity,
          }}
        >
          {winnings.map((win, index) => (
            <span
              key={index}
              className="mx-4 text-[10px] md:text-xs font-medium space-x-1"
            >
              <Icon
                icon="ph:coin-fill"
                className="inline-block mr-1 text-[#6fc7ba]"
              />
              <span className="text-white/90">{win.username}</span> won{" "}
              <span className="text-[#6fc7ba]">
                {win.amount.toLocaleString()} {win.currency}
              </span>{" "}
              <span className="text-white/50">
                ({win.multiplier}x - ${win.betAmount.toLocaleString()})
              </span>{" "}
              on <span className="text-white/90">{win.game}</span>{" "}
              <span className="text-white/50 text-[9px] md:text-[10px]">
                {win.time}
              </span>
              <span className="mx-2 text-white/20">•</span>
            </span>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
