import { memo } from "react";
import { Icon } from "@iconify/react";
import Kaspa from "../../../assets/Kaspa.svg";
import { formatKAS } from "@/lib/utils";

interface ManualBetProps {
  onSiteBalance: {
    balance?: string;
    address?: string;
  } | null;
  betAmount: string;
  setBetAmount: (value: string) => void;
}

const ManualBet = memo(
  ({ onSiteBalance, betAmount, setBetAmount }: ManualBetProps) => {
    return (
      <div className="bg-[#2A2A2A] rounded-[20px] relative flex items-center font-Onest">
        <img src={Kaspa} alt="Kaspa" className="w-[55px]" />
        <input
          type="text"
          value={betAmount}
          pattern="[0-9]*"
          required
          onChange={(e) => {
            const value = e.target.value;
            if (value === "" || /^\d*$/.test(value)) {
              setBetAmount(value);
            }
          }}
          className="w-full text-white/80 pr-4 py-4 outline-none font-black text-3xl"
        />
        <div className="flex gap-2 pr-4">
          <button
            onClick={() => {
              if (
                parseFloat(betAmount) * 0.5 >
                parseFloat(formatKAS(BigInt(onSiteBalance?.balance || "0")))
              ) {
                return;
              }
              setBetAmount((parseFloat(betAmount) * 0.5).toString());
            }}
            className="bg-[#444444] transition-all duration-300 text-[#FFF]/80 hover:bg-[#6fc7ba]/90 px-4 py-2 text-sm font-black font-Onest rounded-full"
          >
            0.5x
          </button>
          <button
            onClick={() => {
              if (
                parseFloat(betAmount) * 2 >
                parseFloat(formatKAS(BigInt(onSiteBalance?.balance || "0")))
              ) {
                return;
              }
              setBetAmount((parseFloat(betAmount) * 2).toString());
            }}
            className="bg-[#444444] transition-all duration-300 text-[#FFF]/80 hover:bg-[#6fc7ba]/90 px-4 py-2 text-sm font-black font-Onest rounded-full"
          >
            2.0x
          </button>
        </div>
      </div>
    );
  },
);

export default ManualBet;
