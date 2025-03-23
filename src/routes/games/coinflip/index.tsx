import CoinflipGame from "@/components/games/CoinflipGame";
import GameStats from "@/components/GameStats";

import { Icon } from "@iconify/react/dist/iconify.js";

import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/games/coinflip/")({
  component: Index,
});

export default function Index() {
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

  // const coinFlipDescription = {
  //   rules: [
  //     {
  //       title: "Basic Rules",
  //       description:
  //         "Choose heads or tails and place your bet. If the coin lands on your chosen side, you win 2x your bet.",
  //       icon: "ph:coin-fill",
  //     },
  //     {
  //       title: "Betting Limits",
  //       description:
  //         "Minimum bet is $0.1 and maximum bet is $100. Maximum win per flip is 100x your bet.",
  //       icon: "ph:currency-circle-dollar-fill",
  //     },
  //     {
  //       title: "Fair Play",
  //       description:
  //         "All flips are provably fair and can be verified using our verification tool.",
  //       icon: "ph:shield-check-fill",
  //     },
  //   ],
  //   howToPlay: [
  //     "Select your bet amount using the slider or input field",
  //     "Choose heads or tails by clicking on the corresponding side",
  //     "Click 'Flip' to start the game",
  //     "Watch the animation and see if you won",
  //     "Your winnings will be automatically credited to your balance",
  //   ],
  //   strategy: [
  //     "Start with smaller bets to get a feel for the game",
  //     "Set a win/loss limit and stick to it",
  //     "Don't chase losses with larger bets",
  //     "Take advantage of hot streaks but know when to stop",
  //     "Practice with demo mode before betting real money",
  //   ],
  // };

  // const coinFlipReviews = {
  //   overallRating: 4.7,
  //   totalReviews: 1289,
  //   reviews: [
  //     {
  //       username: "CryptoGamer",
  //       rating: 5,
  //       comment:
  //         "Simple but addictive! Love the provably fair system and quick payouts.",
  //       date: "2 days ago",
  //     },
  //     {
  //       username: "KaspaWhale",
  //       rating: 4.5,
  //       comment:
  //         "Great game for quick plays. Would love to see higher betting limits though.",
  //       date: "1 week ago",
  //     },
  //     {
  //       username: "BlockchainBet",
  //       rating: 5,
  //       comment:
  //         "Best coin flip game I've played. Clean interface and instant results.",
  //       date: "2 weeks ago",
  //     },
  //   ],
  // };

  return (
    <main className="font-Onest">
      <main className="p-2 md:p-5">
        <div className="w-full h-[300px] md:h-[500px] bg-[#111] rounded-3xl overflow-hidden">
          <CoinflipGame />
        </div>

        <div className="mt-6 space-y-6">
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

          {/* Game Stats */}
          <GameStats gameData={gameData} />

          {/* Tabs Section */}
          {/* <Tabs defaultValue="high-win" className="bg-[#2A2A2A] rounded-xl p-4">
            <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 mb-4">
              <TabsTrigger value="high-win">High Win</TabsTrigger>
              <TabsTrigger value="lucky-win">Lucky Win</TabsTrigger>
              <TabsTrigger value="description">Description</TabsTrigger>
              <TabsTrigger value="review">Review</TabsTrigger>
            </TabsList>
            <TabsContent value="high-win">
              <HighWinTable />
            </TabsContent>
            <TabsContent value="lucky-win">
              <LuckyWinTable />
            </TabsContent>
            <TabsContent value="description">
              <GameDescription {...coinFlipDescription} />
            </TabsContent>
            <TabsContent value="review">
              <GameReviews {...coinFlipReviews} />
            </TabsContent>
          </Tabs> */}
        </div>
      </main>
    </main>
  );
}
