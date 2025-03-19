"use client";

import { LineChart, Line, ResponsiveContainer, YAxis } from "recharts";
import { useKaspaData, useKaspaHistoricalData } from "../hooks/useKaspaData";
import Kaspa from "../assets/Kaspa.png";

export default function KaspaPriceFeed() {
  const { data: kaspaData, isLoading: isLoadingKaspa } = useKaspaData();
  const { data: historicalData, isLoading: isLoadingHistorical } =
    useKaspaHistoricalData("1d");

  if (isLoadingKaspa || isLoadingHistorical) {
    return (
      <div className="space-y-3 pl-3 pr-3 pt-3 pb-3 rounded-2xl bg-white/5 animate-pulse">
        <div className="flex items-center gap-3">
          <div className="w-[25px] h-[25px] bg-white/10 rounded-full" />
          <div className="h-6 w-20 bg-white/10 rounded-lg" />
          <div className="h-5 w-12 bg-white/10 rounded-full" />
        </div>
        <div>
          <div className="h-8 w-24 bg-white/10 rounded-lg" />
        </div>
        <div className="h-[30px] w-full bg-white/10 rounded-lg" />
      </div>
    );
  }

  if (!kaspaData || !historicalData) {
    return null;
  }

  const currentPrice = kaspaData.quote.USD.price;
  const priceChangePercent = kaspaData.quote.USD.percent_change_24h;
  const chartColor = priceChangePercent >= 0 ? "#6fc7ba" : "#ef4444";

  // Format historical data for the chart
  const chartData = historicalData.map((point) => ({
    value: point.price,
  }));

  return (
    <div className="space-y-3 p-3 rounded-2xl bg-white/5">
      <div className="flex items-center gap-3">
        <img
          src={Kaspa}
          alt="Kaspa"
          width={25}
          height={25}
          className="rounded-full"
        />
        <span className="text-white/80 font-semibold text-lg">Kaspa</span>
        <p className="text-[11px] leading-none px-2 py-1.5 bg-[#6fc7ba] rounded-full text-[#231f20] font-medium">
          KAS
        </p>
      </div>
      <div>
        <div className="flex items-end gap-1">
          <p className="text-white/80 font-semibold leading-none text-2xl">
            {currentPrice.toFixed(5)}
          </p>
          <p className="text-[10px] leading-4 text-white/80">USD</p>
        </div>
        <p
          className={`text-[10px] ${
            priceChangePercent >= 0 ? "text-green-400" : "text-red-400"
          } mt-0.5`}
        >
          {priceChangePercent >= 0 ? "+" : ""}
          {priceChangePercent.toFixed(2)}% (24h)
        </p>
      </div>
      {chartData.length > 0 && (
        <div className="h-[30px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <YAxis domain={["dataMin", "dataMax"]} hide />
              <Line
                type="monotone"
                dataKey="value"
                stroke={chartColor}
                strokeWidth={1.5}
                dot={false}
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
