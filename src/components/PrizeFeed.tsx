"use client";

import { Icon } from "@iconify/react";
import { LineChart, Line, ResponsiveContainer } from "recharts";
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

export default function PrizeFeed() {
  const logs = useLogStore((state) => state.logs);

  // Only show winning logs
  const winningLogs = logs
    .filter((log) => parseFloat(log.payout) > parseFloat(log.bet))
    .slice(0, 5); // Show only last 5 wins

  return (
    <div className="bg-[#2A2A2A] rounded-xl p-3 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-white/90">Latest Wins</h3>
        <div className="flex items-center gap-1">
          <span className="w-1.5 h-1.5 bg-[#6fc7ba] rounded-full animate-pulse" />
          <p className="text-[10px] text-[#6fc7ba]">Live Feed</p>
        </div>
      </div>

      <div className="space-y-2">
        {winningLogs.map((log, index) => {
          const profitAmount = parseFloat(log.payout) - parseFloat(log.bet);
          const profitPercentage = (profitAmount / parseFloat(log.bet)) * 100;

          // Generate mock profit chart data - for visual purposes only
          const profitData = Array.from({ length: 10 }, (_, i) => ({
            value: (Math.random() * profitPercentage * (i + 1)) / 10 + 50,
          }));

          return (
            <div key={index} className="bg-white/5 rounded-lg p-2 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="bg-[#6fc7ba]/20 p-1 rounded-lg">
                    <Icon
                      icon="ph:coin-fill"
                      className="text-[#6fc7ba] text-xs"
                    />
                  </div>
                  <div>
                    <p className="text-[10px] font-medium text-white/90">
                      {formatAddress(log.username)}
                    </p>
                    <p className="text-[9px] text-white/60">
                      {log.game || "Game"}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-medium text-[#6fc7ba]">
                    +{formatKAS(BigInt(log.payout))} KAS
                  </p>
                  <p className="text-[9px] text-white/60">
                    {formatTimeAgo(log.timestamp)}
                  </p>
                </div>
              </div>

              <div className="h-[30px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={profitData}>
                    <Line
                      type="monotone"
                      dataKey="value"
                      stroke="#6fc7ba"
                      strokeWidth={1}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          );
        })}
      </div>

      {winningLogs.length === 0 && (
        <div className="text-center text-white/50 text-sm py-4">
          No wins yet
        </div>
      )}

      <button className="w-full bg-white/5 hover:bg-white/10 text-[10px] text-white/60 py-1.5 rounded-lg transition-colors">
        View All Wins
      </button>
    </div>
  );
}
