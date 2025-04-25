import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { LeaderboardEntry } from "@/types/leaderboard";
import { cn, formatAddress } from "@/lib/utils";
import First from "@/assets/leaderboard/1.svg";
import Second from "@/assets/leaderboard/2.svg";
import Third from "@/assets/leaderboard/3.svg";
import { Icon } from "@iconify/react/dist/iconify.js";
import Blockies from "react-blockies";
import { Switch } from "@/components/ui/switch";

const formatKAS = (amount: bigint): string => {
  return (
    (Number(amount) / 1e8).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }) + " KAS"
  );
};

const useMediaQuery = (query: string) => {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);
    if (media.matches !== matches) {
      setMatches(media.matches);
    }
    const listener = () => setMatches(media.matches);
    media.addEventListener("change", listener);
    return () => media.removeEventListener("change", listener);
  }, [matches, query]);

  return matches;
};

export default function LeaderboardPage() {
  const [sortBy, setSortBy] = useState<"bet" | "won">("bet");
  const isDesktop = useMediaQuery("(min-width: 768px)");

  const { data: leaderboard, isLoading } = useQuery({
    queryKey: ["leaderboard"],
    queryFn: async () => {
      const { data } = await axios.get<LeaderboardEntry[]>(
        `${import.meta.env.VITE_BACKEND_URL}/leaderboard`,
      );
      console.log(data);
      return data;
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  console.log(leaderboard, isLoading);

  const sortedLeaderboard = leaderboard?.sort((a, b) =>
    sortBy === "bet"
      ? a.betAmountRank - b.betAmountRank
      : a.wonAmountRank - b.wonAmountRank,
  );

  if (!sortedLeaderboard || sortedLeaderboard.length === 0) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-4xl md:text-7xl font-bold font-Onest tracking-tight text-center mb-2 text-[#6fc7ba]">
            OOPS!
          </p>
          <p className="text-center text-gray-400 mb-8 font-DM-Sans font-extralight text-sm md:text-base px-4">
            It seems you are the first player to play in our casino ☺️
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-4xl md:text-5xl font-bold font-Onest tracking-tight text-center mb-2 text-[#6fc7ba]">
        Leaderboard
      </h1>
      <p className="text-center text-gray-400 mb-8 font-DM-Sans font-extralight text-sm md:text-base px-4">
        A dynamic showcase of the casino's top players, ranked by the highest
        bets and biggest wins, where risk meets reward and fortunes are made.
      </p>

      <div className="flex items-center justify-center gap-3 mb-6">
        <span className="text-sm text-white/70 font-DM-Sans">Total Bets</span>
        <Switch
          checked={sortBy === "won"}
          onCheckedChange={(checked) => setSortBy(checked ? "won" : "bet")}
          className="data-[state=checked]:bg-[#6fc7ba]"
        />
        <span className="text-sm text-white/70 font-DM-Sans">Total Wins</span>
      </div>

      {isLoading || !sortedLeaderboard ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#6fc7ba]"></div>
        </div>
      ) : (
        <div>
          <div className="flex justify-center gap-3 md:gap-5 items-center">
            <div className="flex flex-col gap-2 items-center">
              <div className="w-[80px] h-[80px] md:w-[100px] md:h-[100px] bg-white/10 rounded-full relative">
                <Blockies
                  seed={sortedLeaderboard?.[1]?.address || ""}
                  size={8}
                  scale={isDesktop ? 12.5 : 10}
                  className="w-full h-full rounded-full"
                />
                <div className="absolute -top-1 -left-1 w-[30px] h-[30px] md:w-[40px] md:h-[40px] border-2 border-white bg-[#C4C4C4] rounded-full flex items-center justify-center">
                  <p className="font-black text-base md:text-lg uppercase text-white font-Onest">
                    2
                  </p>
                </div>
              </div>
              <div className="mt-1 md:mt-2 space-y-0.5 md:space-y-1 text-center">
                <p className="text-[10px] md:text-xs font-bold uppercase text-gray-400 font-DM-Sans">
                  {sortedLeaderboard?.[1]?.username}
                </p>
                <p className="text-sm md:text-base font-medium text-gray-400 font-DM-Sans">
                  {sortBy === "bet"
                    ? formatKAS(sortedLeaderboard?.[1]?.totalBetAmount ?? 0n)
                    : formatKAS(sortedLeaderboard?.[1]?.totalWonAmount ?? 0n)}
                </p>
                <p className="text-[10px] md:text-xs text-gray-400 font-DM-Sans font-extralight">
                  {formatAddress(sortedLeaderboard?.[1]?.address || "")}
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-2 mb-8 md:mb-12 items-center">
              <div className="w-[100px] h-[100px] md:w-[120px] md:h-[120px] bg-white/10 rounded-full relative">
                <Blockies
                  seed={sortedLeaderboard?.[0]?.address || ""}
                  size={8}
                  scale={isDesktop ? 15 : 12.5}
                  className="w-full h-full rounded-full"
                />
                <div className="absolute -top-1 -left-1 w-[30px] h-[30px] md:w-[40px] md:h-[40px] border-2 border-white bg-[#EFBF04] rounded-full flex items-center justify-center">
                  <p className="font-black text-base md:text-lg uppercase text-white font-Onest">
                    1
                  </p>
                </div>
              </div>
              <div className="mt-1 md:mt-2 space-y-0.5 md:space-y-1 text-center">
                <p className="text-[10px] md:text-xs font-bold uppercase text-gray-400 font-DM-Sans">
                  {sortedLeaderboard?.[0]?.username}
                </p>
                <p className="text-sm md:text-base font-medium text-gray-400 font-DM-Sans">
                  {sortBy === "bet"
                    ? formatKAS(sortedLeaderboard?.[0]?.totalBetAmount ?? 0n)
                    : formatKAS(sortedLeaderboard?.[0]?.totalWonAmount ?? 0n)}
                </p>
                <p className="text-[10px] md:text-xs text-gray-400 font-DM-Sans font-extralight">
                  {formatAddress(sortedLeaderboard?.[0]?.address || "")}
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-2 items-center">
              <div className="w-[80px] h-[80px] md:w-[100px] md:h-[100px] bg-white/10 rounded-full relative">
                <Blockies
                  seed={sortedLeaderboard?.[2]?.address || ""}
                  size={8}
                  scale={isDesktop ? 12.5 : 10}
                  className="w-full h-full rounded-full"
                />
                <div className="absolute -top-1 -left-1 w-[30px] h-[30px] md:w-[40px] md:h-[40px] border-2 border-white bg-[#CE8946] rounded-full flex items-center justify-center">
                  <p className="font-black text-base md:text-lg uppercase text-white font-Onest">
                    3
                  </p>
                </div>
              </div>
              <div className="mt-1 md:mt-2 space-y-0.5 md:space-y-1 text-center">
                <p className="text-[10px] md:text-xs font-bold uppercase text-gray-400 font-DM-Sans">
                  {sortedLeaderboard?.[2]?.username}
                </p>
                <p className="text-sm md:text-base font-medium text-gray-400 font-DM-Sans">
                  {sortBy === "bet"
                    ? formatKAS(sortedLeaderboard?.[2]?.totalBetAmount ?? 0n)
                    : formatKAS(sortedLeaderboard?.[2]?.totalWonAmount ?? 0n)}
                </p>
                <p className="text-[10px] md:text-xs text-gray-400 font-DM-Sans font-extralight">
                  {formatAddress(sortedLeaderboard?.[2]?.address || "")}
                </p>
              </div>
            </div>
          </div>

          <div className="flex justify-center -space-x-8 md:-space-x-12 relative -mt-4 md:mt-0">
            <img
              src={Second}
              alt="Second"
              className="w-[100px] md:w-[150px] top-0 -rotate-12 -left-18"
            />
            <img
              src={First}
              alt="First"
              className="w-[100px] md:w-[150px] z-[10] mb-8 md:mb-12"
            />
            <img
              src={Third}
              alt="Third"
              className="w-[100px] md:w-[150px] top-0 rotate-12 left-18"
            />
          </div>

          <div className="space-y-1 bg-[#444] p-1 -mt-20 md:-mt-30 rounded-3xl relative z-20 max-h-[400px] overflow-y-auto scrollbar-thin scrollbar-thumb-[#6fc7ba] scrollbar-track-[#444]">
            <AnimatePresence>
              {sortedLeaderboard?.slice(3).map((entry, index) => (
                <motion.div
                  key={entry.address}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.2, delay: index * 0.05 }}
                  className={cn(
                    "bg-[#2A2A2A] rounded-3xl p-3 md:p-4 flex items-center justify-between border border-transparent transition-all hover:border-[#6fc7ba]/20",
                  )}
                >
                  <div className="flex items-center gap-2 md:gap-4">
                    <div className="relative">
                      <div
                        className={cn(
                          "w-8 h-8 md:w-10 md:h-10 rounded-lg overflow-hidden",
                          "bg-white/10",
                        )}
                      >
                        <Blockies
                          seed={entry.address || ""}
                          size={8}
                          scale={isDesktop ? 5 : 4}
                          className="w-full h-full rounded-lg"
                        />
                      </div>
                    </div>
                    <div>
                      <h3 className="font-semibold text-base md:text-lg text-white flex items-center gap-2">
                        {entry.username}
                      </h3>
                      <p className="text-xs md:text-sm flex items-center gap-1 md:gap-2 text-gray-400 w-fit sm:w-auto font-DM-Sans">
                        {formatAddress(entry.address || "")}
                        <Icon
                          onClick={() => {
                            navigator.clipboard.writeText(entry.address || "");
                          }}
                          icon="material-symbols:content-copy-sharp"
                          className="w-3 h-3 cursor-pointer"
                        />
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm md:text-base font-medium text-[#6fc7ba]">
                      {sortBy === "bet"
                        ? formatKAS(entry.totalBetAmount)
                        : formatKAS(entry.totalWonAmount)}
                    </p>
                    <p className="text-xs md:text-sm text-gray-400">
                      {sortBy === "bet" ? "Total Bets" : "Total Wins"}
                    </p>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      )}
    </div>
  );
}
