"use client";

import { LineChart, Line, ResponsiveContainer, YAxis } from "recharts";
import { useEffect, useState } from "react";
import { getKaspaPrice, getKaspaChart } from "../utils/utils";
import Kaspa from "../assets/Kaspa.png";

interface PriceData {
  price: number;
  change24h: number;
}

interface ChartData {
  value: number;
}

export default function KaspaPriceFeed() {
  const [priceData, setPriceData] = useState<PriceData | null>(null);
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function fetchData() {
      try {
        const [price, chart] = await Promise.all([
          getKaspaPrice(),
          getKaspaChart(),
        ]);

        if (!mounted) return;

        if (price) setPriceData(price);
        if (chart && chart.length > 0) {
          const validChartData = chart.filter(
            (point: ChartData) =>
              point && typeof point.value === "number" && !isNaN(point.value)
          );
          setChartData(validChartData);
        }
      } catch (error) {
        console.error("Error loading data:", error);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    fetchData();

    const interval = setInterval(fetchData, 60000);

    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  if (loading) {
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

  const chartColor =
    priceData?.change24h && priceData.change24h > 0 ? "#6fc7ba" : "#ef4444";

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
            {priceData?.price.toFixed(5)}
          </p>
          <p className="text-[10px] leading-4 text-white/80">USD</p>
        </div>
        <p
          className={`text-[10px] ${
            priceData?.change24h && priceData.change24h > 0
              ? "text-green-400"
              : "text-red-400"
          } mt-0.5`}
        >
          {priceData?.change24h! > 0 ? "+" : ""}
          {priceData?.change24h.toFixed(2)}% (24h)
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
