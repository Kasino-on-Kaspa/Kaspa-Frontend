"use client";

import { Icon } from "@iconify/react";
import { motion } from "framer-motion";
import useLogStore from "@/store/logStore";
import { formatAddress, formatKAS } from "@/lib/utils";

function formatTimeAgo(timestamp: number): string {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export default function Marquee() {
  const logs = useLogStore((state) => state.logs);

  // Only show winning logs
  const winningLogs = logs
    .filter((log) => parseFloat(log.payout) > parseFloat(log.bet))
    .slice(0, 10); // Show last 10 wins

  if (winningLogs.length === 0) return null;

  return (
    <div className="bg-[#222] border-b border-white/10 fixed top-0 w-full right-0 z-50">
      <div className="overflow-hidden text-white/70">
        <motion.div
          className="whitespace-nowrap py-2 inline-block pl-4 md:pl-0"
          animate={{
            x: ["100%", "-100%"],
          }}
          transition={{
            duration: 50,
            ease: "linear",
            repeat: Infinity,
          }}
        >
          {winningLogs.map((log, index) => {
            const payout = parseFloat(log.payout);
            const bet = parseFloat(log.bet);
            const multiplier = payout / bet;

            return (
              <span
                key={index}
                className="mx-4 text-[10px] md:text-xs font-medium space-x-1"
              >
                <Icon
                  icon="ph:coin-fill"
                  className="inline-block mr-1 text-[#6fc7ba]"
                />
                <span className="text-white/90">
                  {formatAddress(log.username)}
                </span>{" "}
                won{" "}
                <span className="text-[#6fc7ba]">
                  {formatKAS(BigInt(payout))} KAS
                </span>{" "}
                <span className="text-white/50">
                  ({multiplier.toFixed(2)}x - {formatKAS(BigInt(bet))} KAS)
                </span>{" "}
                on <span className="text-white/90">{log.game || "Game"}</span>{" "}
                <span className="text-white/50 text-[9px] md:text-[10px]">
                  {formatTimeAgo(log.timestamp)}
                </span>
                <span className="mx-2 text-white/20">•</span>
              </span>
            );
          })}
        </motion.div>
      </div>
    </div>
  );
}
