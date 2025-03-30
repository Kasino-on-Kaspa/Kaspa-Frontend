"use client";

import { LineChart, Line, ResponsiveContainer, YAxis } from "recharts";
import { useKaspaData, useKaspaHistoricalData } from "../hooks/useKaspaData";
import { formatAddress, formatKAS } from "@/lib/utils";
import useWalletStore from "@/store/walletStore";
import { Icon } from "@iconify/react/dist/iconify.js";
export default function Balance({
  userAddress,
}: {
  userAddress: string | undefined;
}) {
  const { data: kaspaData, isLoading: isLoadingKaspa } = useKaspaData();
  const { data: historicalData, isLoading: isLoadingHistorical } =
    useKaspaHistoricalData("1d");
  const { onSiteBalance } = useWalletStore();

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
  const priceChangePercent = kaspaData.quote.USD.percent_change_24h;
  const chartColor = priceChangePercent >= 0 ? "#6fc7ba" : "#ef4444";

  // Format historical data for the chart
  const chartData = historicalData.map((point) => ({
    value: point.price,
  }));

  return (
    <div className="space-y-3 p-3 rounded-2xl bg-white/5">
      <div>
        <div className="flex items-center gap-1">
          <p className="text-xs font-Onest text-[#6fc7ba]">
            {formatAddress(userAddress || "")}
          </p>
          <button
            className="text-xs font-Onest text-[#6fc7ba]"
            onClick={() => {
              navigator.clipboard.writeText(userAddress || "");
            }}
          >
            <Icon icon="ph:copy" className="text-xs cursor-pointer" />
          </button>
        </div>
        <div className="flex items-end gap-1">
          <p className="text-white/80 font-semibold leading-none text-2xl">
            {onSiteBalance?.balance
              ? formatKAS(BigInt(onSiteBalance.balance))
              : "0.00"}
          </p>
          <p className="text-[10px] leading-4 text-white/80">KAS</p>
        </div>
        <p
          className={`text-[10px] mt-1.5 ${
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
