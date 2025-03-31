import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { LeaderboardEntry } from "@/types/leaderboard";
import { cn } from "@/lib/utils";

const formatKAS = (amount: bigint): string => {
  return (
    (Number(amount) / 1e8).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }) + " KAS"
  );
};

export default function LeaderboardPage() {
  const [sortBy, setSortBy] = useState<"bet" | "won">("bet");

  const { data: leaderboard, isLoading } = useQuery({
    queryKey: ["leaderboard"],
    queryFn: async () => {
      const { data } = await axios.get<LeaderboardEntry[]>(
        "http://localhost:3000/leaderboard",
      );
      return data;
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const sortedLeaderboard = leaderboard?.sort((a, b) =>
    sortBy === "bet"
      ? a.betAmountRank - b.betAmountRank
      : a.wonAmountRank - b.wonAmountRank,
  );

  return (
    <div className="container max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold text-center mb-2 text-[#6fc7ba]">
        Leaderboard
      </h1>
      <p className="text-center text-gray-400 mb-8">
        Top players ranked by bets and wins
      </p>

      <div className="flex justify-center mb-8">
        <div className="flex bg-[#2A2A2A] rounded-xl p-1.5">
          <button
            onClick={() => setSortBy("bet")}
            className={cn(
              "px-6 py-2.5 rounded-lg transition-all font-medium",
              sortBy === "bet"
                ? "bg-[#6fc7ba] text-[#231f20]"
                : "text-gray-400 hover:text-[#6fc7ba] hover:bg-white/5",
            )}
          >
            Total Bets
          </button>
          <button
            onClick={() => setSortBy("won")}
            className={cn(
              "px-6 py-2.5 rounded-lg transition-all font-medium",
              sortBy === "won"
                ? "bg-[#6fc7ba] text-[#231f20]"
                : "text-gray-400 hover:text-[#6fc7ba] hover:bg-white/5",
            )}
          >
            Total Wins
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#6fc7ba]"></div>
        </div>
      ) : (
        <div className="space-y-3">
          <AnimatePresence>
            {sortedLeaderboard?.map((entry, index) => (
              <motion.div
                key={entry.address}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2, delay: index * 0.05 }}
                className={cn(
                  "bg-[#2A2A2A] rounded-xl p-4 flex items-center justify-between border border-transparent transition-all hover:border-[#6fc7ba]/20",
                  index === 0 &&
                    "bg-gradient-to-r from-[#2A2A2A] to-[#6fc7ba]/10",
                )}
              >
                <div className="flex items-center gap-4">
                  <div
                    className={cn(
                      "w-10 h-10 rounded-lg flex items-center justify-center text-xl font-bold",
                      index === 0
                        ? "bg-[#6fc7ba] text-[#231f20]"
                        : "bg-white/10 text-[#6fc7ba]",
                    )}
                  >
                    #
                    {sortBy === "bet"
                      ? entry.betAmountRank
                      : entry.wonAmountRank}
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg text-white">
                      {entry.username}
                      {index === 0 && (
                        <span className="ml-2 text-[#6fc7ba] text-sm">
                          👑 Leader
                        </span>
                      )}
                    </h3>
                    <p className="text-sm text-gray-400 truncate w-32 sm:w-auto font-mono">
                      {entry.address}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium text-[#6fc7ba]">
                    {sortBy === "bet"
                      ? formatKAS(entry.totalBetAmount)
                      : formatKAS(entry.totalWonAmount)}
                  </p>
                  <p className="text-sm text-gray-400">
                    {sortBy === "bet" ? "Total Bets" : "Total Wins"}
                  </p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
