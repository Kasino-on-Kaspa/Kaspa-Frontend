"use client";

import { Icon } from "@iconify/react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";

interface GameStatsProps {
  gameData: {
    totalBets: number;
    totalVolume: number;
    averageBet: number;
    maxWin: number;
    winRate: number;
    hourlyData: Array<{
      hour: string;
      bets: number;
      volume: number;
    }>;
  };
}

export default function GameStats({ gameData }: GameStatsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
      {/* Quick Stats */}
      <div className="bg-[#2A2A2A] rounded-xl p-4">
        <h3 className="text-sm font-semibold text-white/90 mb-4">
          Game Statistics
        </h3>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white/5 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <div className="bg-[#6fc7ba]/20 p-1.5 rounded-lg">
                <Icon
                  icon="ph:dice-five-fill"
                  className="text-[#6fc7ba] text-sm"
                />
              </div>
              <p className="text-[10px] text-white/60">Total Bets</p>
            </div>
            <p className="text-lg font-semibold text-white/90">
              {gameData.totalBets.toLocaleString()}
            </p>
          </div>
          <div className="bg-white/5 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <div className="bg-[#6fc7ba]/20 p-1.5 rounded-lg">
                <Icon
                  icon="ph:currency-circle-dollar-fill"
                  className="text-[#6fc7ba] text-sm"
                />
              </div>
              <p className="text-[10px] text-white/60">Volume</p>
            </div>
            <p className="text-lg font-semibold text-white/90">
              ${gameData.totalVolume.toLocaleString()}
            </p>
          </div>
          <div className="bg-white/5 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <div className="bg-[#6fc7ba]/20 p-1.5 rounded-lg">
                <Icon
                  icon="ph:chart-line-up-fill"
                  className="text-[#6fc7ba] text-sm"
                />
              </div>
              <p className="text-[10px] text-white/60">Avg. Bet</p>
            </div>
            <p className="text-lg font-semibold text-white/90">
              ${gameData.averageBet.toFixed(2)}
            </p>
          </div>
          <div className="bg-white/5 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <div className="bg-[#6fc7ba]/20 p-1.5 rounded-lg">
                <Icon
                  icon="ph:trophy-fill"
                  className="text-[#6fc7ba] text-sm"
                />
              </div>
              <p className="text-[10px] text-white/60">Win Rate</p>
            </div>
            <p className="text-lg font-semibold text-white/90">
              {gameData.winRate}%
            </p>
          </div>
        </div>
      </div>

      {/* Volume Chart */}
      <div className="bg-[#2A2A2A] rounded-xl p-4">
        <h3 className="text-sm font-semibold text-white/90 mb-4">
          Hourly Volume
        </h3>
        <div className="h-[200px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={gameData.hourlyData}>
              <XAxis
                dataKey="hour"
                tick={{ fontSize: 10, fill: "#ffffff99" }}
                interval={2}
              />
              <YAxis tick={{ fontSize: 10, fill: "#ffffff99" }} width={40} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#333",
                  border: "none",
                  borderRadius: "8px",
                  fontSize: "12px",
                }}
              />
              <Bar dataKey="volume" fill="#6fc7ba" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Activity Chart */}
      <div className="bg-[#2A2A2A] rounded-xl p-4 md:col-span-2">
        <h3 className="text-sm font-semibold text-white/90 mb-4">
          Betting Activity
        </h3>
        <div className="h-[200px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={gameData.hourlyData}>
              <XAxis
                dataKey="hour"
                tick={{ fontSize: 10, fill: "#ffffff99" }}
                interval={2}
              />
              <YAxis tick={{ fontSize: 10, fill: "#ffffff99" }} width={40} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#333",
                  border: "none",
                  borderRadius: "8px",
                  fontSize: "12px",
                }}
              />
              <Line
                type="monotone"
                dataKey="bets"
                stroke="#6fc7ba"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
