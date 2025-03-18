"use client";

import { Icon } from "@iconify/react";
import { LineChart, Line, ResponsiveContainer } from "recharts";

interface PrizeData {
  username: string;
  amount: number;
  game: string;
  profit: number[];
  time: string;
}

export default function PrizeFeed() {
  const prizes: PrizeData[] = [
    {
      username: "Player123",
      amount: 1500,
      game: "Coin Flip",
      profit: [30, 40, 45, 50, 49, 60, 65, 70, 85, 90],
      time: "2m ago",
    },
    {
      username: "LuckyWinner",
      amount: 2800,
      game: "Dice Roll",
      profit: [40, 45, 35, 50, 55, 45, 60, 65, 70, 80],
      time: "5m ago",
    },
  ];

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
        {prizes.map((prize, index) => (
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
                    {prize.username}
                  </p>
                  <p className="text-[9px] text-white/60">{prize.game}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-medium text-[#6fc7ba]">
                  +${prize.amount.toLocaleString()}
                </p>
                <p className="text-[9px] text-white/60">{prize.time}</p>
              </div>
            </div>

            <div className="h-[30px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={prize.profit.map((value) => ({ value }))}>
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
        ))}
      </div>

      <button className="w-full bg-white/5 hover:bg-white/10 text-[10px] text-white/60 py-1.5 rounded-lg transition-colors">
        View All Wins
      </button>
    </div>
  );
}
