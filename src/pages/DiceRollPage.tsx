import DieRollGame from "@/components/games/DieRollGame";
import GameStats from "@/components/GameStats";
import { Icon } from "@iconify/react/dist/iconify.js";
export default function DiceRollPage() {
  const gameData = {
    totalBets: 203456,
    totalVolume: 3456789,
    averageBet: 16.99,
    maxWin: 2000,
    winRate: 47.2,
    hourlyData: Array.from({ length: 24 }, (_, i) => ({
      hour: `${i}:00`,
      bets: Math.floor(Math.random() * 1200) + 600,
      volume: Math.floor(Math.random() * 12000) + 6000,
    })),
  };

  return (
    <main className="p-2 md:p-5 f_Onest">
      <div className="w-full h-[600px] md:h-[700px] bg-[#333] rounded-3xl">
        <DieRollGame />
      </div>

      <div className="mt-6 space-y-6">
        {/* Game Info Section */}
        <div className="bg-[#2A2A2A] rounded-xl p-4">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-white/90">
                Dice Roll
              </h1>
              <p className="text-xs md:text-sm text-[#6fc7ba]">by Kasino</p>
            </div>
            <div className="bg-[#6fc7ba]/20 px-3 py-1.5 rounded-full">
              <p className="text-[10px] md:text-xs font-medium text-[#6fc7ba]">
                Kasino Originals
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mb-4">
            <div className="bg-[#6fc7ba]/10 px-3 py-1.5 rounded-full flex items-center gap-2">
              <Icon icon="ph:house-fill" className="text-[#6fc7ba] text-sm" />
              <p className="text-[10px] md:text-xs font-medium text-[#6fc7ba]">
                House Edge: 2%
              </p>
            </div>
            <div className="bg-[#6fc7ba]/10 px-3 py-1.5 rounded-full flex items-center gap-2">
              <Icon icon="ph:coin-fill" className="text-[#6fc7ba] text-sm" />
              <p className="text-[10px] md:text-xs font-medium text-[#6fc7ba]">
                RTP: 96%
              </p>
            </div>
            <div className="bg-[#6fc7ba]/10 px-3 py-1.5 rounded-full flex items-center gap-2">
              <Icon icon="solar:cup-bold" className="text-[#6fc7ba] text-sm" />
              <p className="text-[10px] md:text-xs font-medium text-[#6fc7ba]">
                Max Win: 100x
              </p>
            </div>
            <div className="bg-[#6fc7ba]/10 px-3 py-1.5 rounded-full flex items-center gap-2">
              <Icon
                icon="ph:currency-dollar-simple-fill"
                className="text-[#6fc7ba] text-sm"
              />
              <p className="text-[10px] md:text-xs font-medium text-[#6fc7ba]">
                Stake: $0.1 - $100
              </p>
            </div>
          </div>

          <p className="text-xs md:text-sm text-white/70 leading-relaxed">
            Dice Roll is a simple dice game that allows you to roll a dice and
            win if the number you roll is the same as the number you bet on. The
            game is played with a single die, and the player can bet on any
            number between 1 and 6.
          </p>
        </div>
        <GameStats gameData={gameData} />
      </div>
    </main>
  );
}
