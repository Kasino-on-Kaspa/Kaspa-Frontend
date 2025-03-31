import { Icon } from "@iconify/react/dist/iconify.js";
import Kaspa from "../../assets/Kaspa.svg";
import useWalletStore from "@/store/walletStore";
import { formatKAS } from "@/lib/utils";
import useCoinflipStore from "@/store/coinflipStore";

export default function CoinFlipBet({
  betAmount,

  setBetAmount,

  handleCreateBet,
}: {
  betAmount: string;
  handleCreateBet: () => void;
  setBetAmount: (amount: string) => void;
}) {
  const { onSiteBalance } = useWalletStore();
  const { gameState } = useCoinflipStore();

  return (
    <div className="w-[350px] space-y-1.5 h-full  ">
      <div className="bg-[#444] w-full p-1.5 rounded-3xl space-y-1.5 border border-white/10">
        <div className="flex justify-between  pl-3 pr-4 pt-1.5 pb-1 ">
          <div className="flex items-center gap-2">
            <Icon icon="ph:coin-fill" className="text-white/80" />
            <p className="font-Onest font-black text-xs text-white/80">
              AMOUNT
            </p>
          </div>
          <div className="flex items-center gap-1">
            <Icon icon="mdi:approximately-equal" className="text-white/80" />
            <p className="font-Onest font-black text-xs text-white/80">0USDT</p>
          </div>
        </div>
        <div className="bg-[#2A2A2A] rounded-[20px] relative flex items-center">
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
        <div className="grid grid-cols-4 gap-1.5">
          <button
            disabled={
              parseFloat(formatKAS(BigInt(onSiteBalance?.balance || "0"))) < 10
            }
            onClick={() => setBetAmount("10")}
            className="bg-[#2A2A2A] transition-all duration-300 text-[#FFF]/80 hover:bg-[#6fc7ba]/90 p-4 text-sm font-black font-Onest rounded-[20px]"
          >
            10
          </button>
          <button
            disabled={
              parseFloat(formatKAS(BigInt(onSiteBalance?.balance || "0"))) < 100
            }
            onClick={() => setBetAmount("100")}
            className="bg-[#2A2A2A] transition-all duration-300 text-[#FFF]/80 hover:bg-[#6fc7ba]/90 p-4 text-sm font-black font-Onest rounded-[20px]"
          >
            100
          </button>
          <button
            disabled={
              parseFloat(formatKAS(BigInt(onSiteBalance?.balance || "0"))) <
              1000
            }
            onClick={() => setBetAmount("1000")}
            className="bg-[#2A2A2A] transition-all duration-300 text-[#FFF]/80 hover:bg-[#6fc7ba]/90 p-4 text-sm font-black font-Onest rounded-[20px]"
          >
            1.0k
          </button>
          <button
            disabled={
              parseFloat(formatKAS(BigInt(onSiteBalance?.balance || "0"))) <
              10000
            }
            onClick={() => setBetAmount("10000")}
            className="bg-[#2A2A2A] transition-all duration-300 text-[#FFF]/80 hover:bg-[#6fc7ba]/90 p-4 text-sm font-black font-Onest rounded-[20px]"
          >
            10.0k
          </button>
        </div>
      </div>
      <button
        onClick={handleCreateBet}
        className={`w-full bg-[#444] border border-white/10 transition-all duration-300 text-[#FFF]/80    p-3 text-xl font-bold font-Onest rounded-full ${
          gameState !== null ? "opacity-50 cursor-not-allowed" : ""
        } ${gameState === null ? "hover:bg-[#6fc7ba]/90" : ""}`}
        disabled={gameState !== null}
      >
        {gameState !== null ? "Bet Ongoing..." : "Start the Game"}
      </button>
    </div>
  );
}
