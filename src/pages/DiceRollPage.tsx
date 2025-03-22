import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Icon } from "@iconify/react";
import { Slider } from "@/components/ui/slider";
import { useWalletBalance } from "@/lib/walletQueries";
import { toast } from "sonner";
import useDicerollStore from "@/store/dicerollStore";
import useWalletStore from "@/store/walletStore";
import { useNavigate } from "@tanstack/react-router";
import { DieRollBetType } from "@/types/dieroll";

export default function DiceRollPage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useWalletStore();
  const { data: balance } = useWalletBalance();
  const [betAmount, setBetAmount] = useState<string>("");
  const [targetNumber, setTargetNumber] = useState<number>(50);
  const [isRolling, setIsRolling] = useState(false);
  const [rollHistory, setRollHistory] = useState<
    Array<{
      roll: number;
      multiplier: number;
      profit: number;
      timestamp: number;
    }>
  >([]);

  const {
    dierollSocket,
    sessionData,
    rollResult,
    initializeGame,
    startSession,
    placeBet,
    intializeListeners,
  } = useDicerollStore();

  useEffect(() => {
    if (!isAuthenticated) {
      toast.error("Please connect your wallet to play");
      navigate({ to: "/" });
      return;
    }

    initializeGame();
    startSession();
    intializeListeners();

    return () => {
      if (dierollSocket) {
        dierollSocket.disconnect();
      }
    };
  }, [isAuthenticated]);

  useEffect(() => {
    if (rollResult) {
      const isWin = rollResult >= targetNumber;
      const multiplier = isWin ? 100 / (100 - targetNumber) : 0;
      const profit = isWin
        ? parseFloat(betAmount) * multiplier
        : -parseFloat(betAmount);

      const result = {
        roll: rollResult,
        multiplier,
        profit,
        timestamp: Date.now(),
      };

      setRollHistory((prev) => [result, ...prev].slice(0, 10));
      setIsRolling(false);

      if (isWin) {
        toast.success(`You won ${profit.toFixed(8)} KAS!`);
      } else {
        toast.error(`You lost ${parseFloat(betAmount).toFixed(8)} KAS`);
      }
    }
  }, [rollResult]);

  const handleRoll = async () => {
    if (!isAuthenticated) {
      toast.error("Please connect your wallet to play");
      navigate({ to: "/" });
      return;
    }

    if (!betAmount || parseFloat(betAmount) <= 0) {
      toast.error("Please enter a valid bet amount");
      return;
    }

    if (parseFloat(betAmount) > (balance?.total || 0)) {
      toast.error("Insufficient balance");
      return;
    }

    setIsRolling(true);

    const betData = DieRollBetType.parse({
      amount: betAmount,
      condition: "OVER",
      target: targetNumber,
    });

    placeBet(betData);
  };

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto p-4">
        <Card className="bg-[#1a1718]/50 backdrop-blur-sm border-white/5">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Icon
              icon="mdi:wallet-lock"
              className="h-16 w-16 text-[#6fc7ba] mb-4"
            />
            <h2 className="text-2xl font-bold text-white mb-2">
              Wallet Required
            </h2>
            <p className="text-white/70 mb-6">
              Please connect your wallet to play Dice Roll
            </p>
            <Button
              onClick={() => navigate({ to: "/" })}
              className="bg-[#6fc7ba] hover:bg-[#6fc7ba]/90"
            >
              <Icon icon="mdi:wallet" className="h-4 w-4 mr-2" />
              Connect Wallet
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 space-y-6">
      {/* Main Game Card */}
      <Card className="bg-[#1a1718]/50 backdrop-blur-sm border-white/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Icon icon="mdi:dice-multiple" className="h-5 w-5 text-[#6fc7ba]" />
            Dice Roll
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Dice Visualization */}
          <div className="relative h-48 bg-[#2a2627] rounded-lg overflow-hidden">
            <div className="absolute inset-0 flex items-center justify-center">
              {isRolling ? (
                <div className="animate-pulse text-4xl font-bold text-[#6fc7ba]">
                  <Icon
                    icon="mdi:dice-multiple"
                    className="h-16 w-16 animate-spin"
                  />
                </div>
              ) : (
                <div className="text-4xl font-bold text-white">
                  {rollHistory[0]?.roll || "?"}
                </div>
              )}
            </div>
            {/* Target Line */}
            <div
              className="absolute bottom-0 h-1 bg-[#6fc7ba]"
              style={{
                left: `${targetNumber}%`,
                width: "2px",
                height: "100%",
              }}
            />
          </div>

          {/* Betting Controls */}
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm text-white/70">Bet Amount (KAS)</label>
              <div className="flex gap-2">
                <Input
                  type="number"
                  value={betAmount}
                  onChange={(e) => setBetAmount(e.target.value)}
                  placeholder="0.00000000"
                  className="bg-[#2a2627] border-white/5 text-white"
                />
                <Button
                  variant="outline"
                  onClick={() => setBetAmount((balance?.total || 0).toString())}
                  className="border-white/5 hover:border-[#6fc7ba]/20"
                >
                  <Icon icon="mdi:arrow-up-bold" className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm text-white/70">Target Number</label>
              <div className="flex items-center gap-4">
                <Slider
                  value={[targetNumber]}
                  onValueChange={(value: number[]) => setTargetNumber(value[0])}
                  min={1}
                  max={98}
                  step={1}
                  className="flex-1"
                />
                <span className="text-white min-w-[3rem] text-right">
                  {targetNumber}
                </span>
              </div>
            </div>

            <Button
              onClick={handleRoll}
              disabled={isRolling}
              className="w-full bg-[#6fc7ba] hover:bg-[#6fc7ba]/90"
            >
              {isRolling ? (
                <div className="flex items-center gap-2">
                  <Icon icon="mdi:loading" className="h-4 w-4 animate-spin" />
                  Rolling...
                </div>
              ) : (
                <>
                  <Icon icon="mdi:dice-multiple" className="h-4 w-4 mr-2" />
                  Roll
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Statistics Card */}
      <Card className="bg-[#1a1718]/50 backdrop-blur-sm border-white/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Icon icon="mdi:chart-line" className="h-5 w-5 text-[#6fc7ba]" />
            Statistics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="text-sm text-white/70">Win Rate</div>
              <div className="text-xl font-bold text-white">
                {rollHistory.length > 0
                  ? `${(
                      (rollHistory.filter((r) => r.profit > 0).length /
                        rollHistory.length) *
                      100
                    ).toFixed(1)}%`
                  : "0%"}
              </div>
            </div>
            <div className="space-y-2">
              <div className="text-sm text-white/70">Profit</div>
              <div
                className={`text-xl font-bold ${
                  rollHistory.length > 0
                    ? rollHistory[0].profit >= 0
                      ? "text-[#6fc7ba]"
                      : "text-red-500"
                    : "text-white"
                }`}
              >
                {rollHistory.length > 0
                  ? `${rollHistory[0].profit >= 0 ? "+" : ""}${rollHistory[0].profit.toFixed(8)} KAS`
                  : "0 KAS"}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Roll History */}
      <Card className="bg-[#1a1718]/50 backdrop-blur-sm border-white/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Icon icon="mdi:history" className="h-5 w-5 text-[#6fc7ba]" />
            Roll History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {rollHistory.map((result, index) => (
              <div
                key={result.timestamp}
                className="flex items-center justify-between p-2 rounded bg-[#2a2627]"
              >
                <div className="flex items-center gap-4">
                  <span className="text-white/70">#{index + 1}</span>
                  <span className="text-white">{result.roll}</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-white/70">
                    {result.multiplier.toFixed(2)}x
                  </span>
                  <span
                    className={
                      result.profit >= 0 ? "text-[#6fc7ba]" : "text-red-500"
                    }
                  >
                    {result.profit >= 0 ? "+" : ""}
                    {result.profit.toFixed(8)} KAS
                  </span>
                </div>
              </div>
            ))}
            {rollHistory.length === 0 && (
              <div className="text-center text-white/70 py-4">
                <Icon icon="mdi:history" className="h-8 w-8 mx-auto mb-2" />
                No rolls yet
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
