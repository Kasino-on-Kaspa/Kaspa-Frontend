import CoinflipGame from "@/components/games/CoinflipGame";
import GameStats from "@/components/GameStats";
import GameDescription from "@/components/GameDescription";
import { Icon } from "@iconify/react/dist/iconify.js";

export default function CoinflipPage() {
  const gameData = {
    totalBets: 156789,
    totalVolume: 2345678,
    averageBet: 14.96,
    maxWin: 1500,
    winRate: 48.5,
    hourlyData: Array.from({ length: 24 }, (_, i) => ({
      hour: `${i}:00`,
      bets: Math.floor(Math.random() * 1000) + 500,
      volume: Math.floor(Math.random() * 10000) + 5000,
    })),
  };

  const coinFlipDescription = {
    rules: [
      {
        title: "Basic Rules",
        description:
          "Choose heads or tails and place your bet. If the coin lands on your chosen side, you win 2x your bet.",
        icon: "ph:coin-fill",
      },
      {
        title: "Betting Limits",
        description:
          "Minimum bet is $0.1 and maximum bet is $100. Maximum win per flip is 100x your bet.",
        icon: "ph:currency-circle-dollar-fill",
      },
      {
        title: "Fair Play",
        description:
          "All flips are provably fair and can be verified using our verification tool.",
        icon: "ph:shield-check-fill",
      },
    ],
    howToPlay: [
      "Select your bet amount using the slider or input field",
      "Choose heads or tails by clicking on the corresponding side",
      "Click 'Flip' to start the game",
      "Watch the animation and see if you won",
      "Your winnings will be automatically credited to your balance",
    ],
    strategy: [
      "Start with smaller bets to get a feel for the game",
      "Set a win/loss limit and stick to it",
      "Don't chase losses with larger bets",
      "Take advantage of hot streaks but know when to stop",
      "Practice with demo mode before betting real money",
    ],
  };

  return (
    <div className="min-h-screen w-full  font-Onest text-white">
      <div className="w-full px-4 py-8">
        <div className="space-y-8">
          <div className="bg-[#2A2A2A] rounded-[35px] h-[500px] overflow-hidden w-full">
            <CoinflipGame />
          </div>

          {/* Game Info Section */}
          <div className="bg-[#2A2A2A] rounded-xl p-4">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h1 className="text-xl md:text-2xl font-bold text-white/90">
                  Coin Flip
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
                  House Edge: 1%
                </p>
              </div>
              <div className="bg-[#6fc7ba]/10 px-3 py-1.5 rounded-full flex items-center gap-2">
                <Icon icon="ph:coin-fill" className="text-[#6fc7ba] text-sm" />
                <p className="text-[10px] md:text-xs font-medium text-[#6fc7ba]">
                  RTP: 96%
                </p>
              </div>
              <div className="bg-[#6fc7ba]/10 px-3 py-1.5 rounded-full flex items-center gap-2">
                <Icon
                  icon="solar:cup-bold"
                  className="text-[#6fc7ba] text-sm"
                />
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
              Coin Flip is a simple coin flip game that allows you to flip a
              coin and win if the coin lands on the side you bet on. The game is
              played with a single coin, and the player can bet on any side of
              the coin.
            </p>
          </div>

          {/* Stats and Description Grid */}
          <div>
            <GameDescription {...coinFlipDescription} />

            <GameStats gameData={gameData} />
          </div>
        </div>
      </div>
    </div>
  );
}
