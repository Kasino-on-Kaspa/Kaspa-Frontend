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

// <div className="container mx-auto p-4 space-y-6">
//   {/* Main Game Card */}
//   <Card className="bg-[#1a1718]/50 backdrop-blur-sm border-white/5">
//     <CardHeader>
//       <CardTitle className="flex items-center gap-2 text-white">
//         <Icon icon="mdi:dice-multiple" className="h-5 w-5 text-[#6fc7ba]" />
//         Dice Roll
//       </CardTitle>
//     </CardHeader>
//     <CardContent className="space-y-6">
//       {/* Dice Visualization */}
//       <div className="relative h-48 bg-[#2a2627] rounded-lg overflow-hidden">
//         <div className="absolute inset-0 flex items-center justify-center">
//           {isRolling ? (
//             <div className="animate-pulse text-4xl font-bold text-[#6fc7ba]">
//               <Icon
//                 icon="mdi:dice-multiple"
//                 className="h-16 w-16 animate-spin"
//               />
//             </div>
//           ) : (
//             <div className="text-4xl font-bold text-white">
//               {rollHistory[0]?.roll || "?"}
//             </div>
//           )}
//         </div>
//         {/* Target Line */}
//         <div
//           className="absolute bottom-0 h-1 bg-[#6fc7ba]"
//           style={{
//             left: `${targetNumber}%`,
//             width: "2px",
//             height: "100%",
//           }}
//         />
//       </div>

//       {/* Betting Controls */}
//       <div className="space-y-4">
//         <div className="space-y-2">
//           <label className="text-sm text-white/70">Bet Amount (KAS)</label>
//           <div className="flex gap-2">
//             <Input
//               type="number"
//               value={betAmount}
//               onChange={(e) => setBetAmount(e.target.value)}
//               placeholder="0.00000000"
//               className="bg-[#2a2627] border-white/5 text-white"
//             />
//             <Button
//               variant="outline"
//               onClick={() => setBetAmount((balance?.total || 0).toString())}
//               className="border-white/5 hover:border-[#6fc7ba]/20"
//             >
//               <Icon icon="mdi:arrow-up-bold" className="h-4 w-4" />
//             </Button>
//           </div>
//         </div>

//         <div className="space-y-2">
//           <label className="text-sm text-white/70">Target Number</label>
//           <div className="flex items-center gap-4">
//             <Slider
//               value={[targetNumber]}
//               onValueChange={(value: number[]) => setTargetNumber(value[0])}
//               min={1}
//               max={98}
//               step={1}
//               className="flex-1"
//             />
//             <span className="text-white min-w-[3rem] text-right">
//               {targetNumber}
//             </span>
//           </div>
//         </div>

//         <Button
//           onClick={handleRoll}
//           disabled={isRolling}
//           className="w-full bg-[#6fc7ba] hover:bg-[#6fc7ba]/90"
//         >
//           {isRolling ? (
//             <div className="flex items-center gap-2">
//               <Icon icon="mdi:loading" className="h-4 w-4 animate-spin" />
//               Rolling...
//             </div>
//           ) : (
//             <>
//               <Icon icon="mdi:dice-multiple" className="h-4 w-4 mr-2" />
//               Roll
//             </>
//           )}
//         </Button>
//       </div>
//     </CardContent>
//   </Card>

//   {/* Statistics Card */}
//   <Card className="bg-[#1a1718]/50 backdrop-blur-sm border-white/5">
//     <CardHeader>
//       <CardTitle className="flex items-center gap-2 text-white">
//         <Icon icon="mdi:chart-line" className="h-5 w-5 text-[#6fc7ba]" />
//         Statistics
//       </CardTitle>
//     </CardHeader>
//     <CardContent>
//       <div className="grid grid-cols-2 gap-4">
//         <div className="space-y-2">
//           <div className="text-sm text-white/70">Win Rate</div>
//           <div className="text-xl font-bold text-white">
//             {rollHistory.length > 0
//               ? `${(
//                   (rollHistory.filter((r) => r.profit > 0).length /
//                     rollHistory.length) *
//                   100
//                 ).toFixed(1)}%`
//               : "0%"}
//           </div>
//         </div>
//         <div className="space-y-2">
//           <div className="text-sm text-white/70">Profit</div>
//           <div
//             className={`text-xl font-bold ${
//               rollHistory.length > 0
//                 ? rollHistory[0].profit >= 0
//                   ? "text-[#6fc7ba]"
//                   : "text-red-500"
//                 : "text-white"
//             }`}
//           >
//             {rollHistory.length > 0
//               ? `${rollHistory[0].profit >= 0 ? "+" : ""}${rollHistory[0].profit.toFixed(8)} KAS`
//               : "0 KAS"}
//           </div>
//         </div>
//       </div>
//     </CardContent>
//   </Card>

//   {/* Roll History */}
//   <Card className="bg-[#1a1718]/50 backdrop-blur-sm border-white/5">
//     <CardHeader>
//       <CardTitle className="flex items-center gap-2 text-white">
//         <Icon icon="mdi:history" className="h-5 w-5 text-[#6fc7ba]" />
//         Roll History
//       </CardTitle>
//     </CardHeader>
//     <CardContent>
//       <div className="space-y-2">
//         {rollHistory.map((result, index) => (
//           <div
//             key={result.timestamp}
//             className="flex items-center justify-between p-2 rounded bg-[#2a2627]"
//           >
//             <div className="flex items-center gap-4">
//               <span className="text-white/70">#{index + 1}</span>
//               <span className="text-white">{result.roll}</span>
//             </div>
//             <div className="flex items-center gap-4">
//               <span className="text-white/70">
//                 {result.multiplier.toFixed(2)}x
//               </span>
//               <span
//                 className={
//                   result.profit >= 0 ? "text-[#6fc7ba]" : "text-red-500"
//                 }
//               >
//                 {result.profit >= 0 ? "+" : ""}
//                 {result.profit.toFixed(8)} KAS
//               </span>
//             </div>
//           </div>
//         ))}
//         {rollHistory.length === 0 && (
//           <div className="text-center text-white/70 py-4">
//             <Icon icon="mdi:history" className="h-8 w-8 mx-auto mb-2" />
//             No rolls yet
//           </div>
//         )}
//       </div>
//     </CardContent>
//   </Card>
// </div>
