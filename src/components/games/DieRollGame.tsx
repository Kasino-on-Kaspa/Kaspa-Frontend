import { useState, useEffect } from "react";
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

interface RollResult {
  roll: number;
  serverSeed: string;
}

interface RollHistory {
  roll: number;
  multiplier: number;
  profit: number;
  timestamp: number;
}

export default function DieRollGame() {
  const navigate = useNavigate();
  const { isAuthenticated } = useWalletStore();
  const { data: balance } = useWalletBalance();
  const {
    isConnected,
    rollResult,
    gameSessionError,
    initializeGame,
    placeBet,
    startSession,
  } = useDicerollStore();

  const [betAmount, setBetAmount] = useState<string>("");
  const [targetNumber, setTargetNumber] = useState<number>(50);
  const [condition, setCondition] = useState<"OVER" | "UNDER">("OVER");
  const [isRolling, setIsRolling] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGameInitialized, setIsGameInitialized] = useState(false);
  const [rollHistory, setRollHistory] = useState<RollHistory[]>([]);
  const [retryCount, setRetryCount] = useState(0);
  const MAX_RETRIES = 3;
  const [clientSeed, setClientSeed] = useState<string>("1234567890");

  // Error handling
  useEffect(() => {
    if (gameSessionError) {
      toast.error(gameSessionError);
      setIsLoading(false);
    }
  }, [gameSessionError]);

  // Roll result handling
  useEffect(() => {
    if (!rollResult) return;

    // Extract roll number from result
    let roll: number;
    if (typeof rollResult === "object" && "serverSeed" in rollResult) {
      // Handle case where rollResult is an object with serverSeed
      roll = (rollResult as RollResult).roll;
    } else if (typeof rollResult === "number") {
      // Handle case where rollResult is a direct number
      roll = rollResult;
    } else {
      console.error("Unexpected roll result format:", rollResult);
      return;
    }

    // Get latest state values for calculations
    const currentCondition = condition;
    const currentTarget = targetNumber;
    const currentBetAmount = betAmount;

    const isWin =
      currentCondition === "OVER"
        ? roll >= currentTarget
        : roll <= currentTarget;
    const multiplier =
      currentCondition === "OVER"
        ? 100 / (100 - currentTarget)
        : 100 / currentTarget;
    const profit = isWin
      ? parseFloat(currentBetAmount) * multiplier
      : -parseFloat(currentBetAmount);

    const result = {
      roll,
      multiplier,
      profit,
      timestamp: Date.now(),
    };

    console.log("result", result);

    setRollHistory((prev) => [result, ...prev].slice(0, 10));
    setIsRolling(false);

    if (isWin) {
      toast.success(`You won ${profit.toFixed(8)} KAS!`);
    } else {
      toast.error(`You lost ${parseFloat(currentBetAmount).toFixed(8)} KAS`);
    }
  }, [rollResult]); // Only depend on rollResult changes

  const initializeGameWithRetry = async () => {
    setIsLoading(true);
    try {
      initializeGame();
      setIsGameInitialized(true);
      setIsLoading(false);
    } catch (error) {
      if (retryCount < MAX_RETRIES) {
        setTimeout(
          () => {
            setRetryCount((prev) => prev + 1);
            initializeGameWithRetry();
          },
          1000 * Math.pow(2, retryCount),
        );
      } else {
        toast.error("Failed to connect to game server after multiple attempts");
        setIsLoading(false);
      }
    }
  };

  const handleRoll = async () => {
    if (!isAuthenticated) {
      toast.error("Please connect your wallet to play");
      navigate({ to: "/" });
      return;
    }

    if (!isConnected) {
      toast.error("Not connected to game server");
      return;
    }

    if (!betAmount || parseFloat(betAmount) <= 0) {
      toast.error("Please enter a valid bet amount");
      return;
    }

    if (!clientSeed.trim()) {
      toast.error("Please enter a client seed");
      return;
    }

    setIsRolling(true);

    try {
      // Start a new session before placing the bet
      await startSession();

      const betData = DieRollBetType.parse({
        client_seed: clientSeed,
        amount: betAmount,
        condition,
        target: targetNumber,
      });

      placeBet(betData);
    } catch (error) {
      console.log("error", error);
      setIsRolling(false);
      toast.error("Failed to place bet");
    }
  };

  const calculateMultiplier = () => {
    return condition === "OVER"
      ? (100 / (100 - targetNumber)).toFixed(2)
      : (100 / targetNumber).toFixed(2);
  };

  const calculateWinChance = () => {
    return condition === "OVER"
      ? (100 - targetNumber).toFixed(2)
      : targetNumber.toFixed(2);
  };

  const formatBalance = (value?: number | null) => {
    if (value === undefined || value === null) return "0.00000000";
    return value.toFixed(8);
  };

  if (!isGameInitialized) {
    return (
      <div className="relative h-full w-full bg-[#1E1E1E] rounded-3xl p-6">
        <div className="flex flex-col items-center justify-center h-full">
          {isLoading ? (
            <>
              <Icon
                icon="ph:dice"
                className="h-16 w-16 text-[#6fc7ba] animate-spin mb-4"
              />
              <h2 className="text-2xl font-bold text-white mb-2">
                Connecting to Game Server
              </h2>
              <p className="text-white/70">
                Please wait while we establish connection...
              </p>
            </>
          ) : (
            <>
              <Icon icon="ph:dice" className="h-16 w-16 text-[#6fc7ba] mb-4" />
              <h2 className="text-2xl font-bold text-white mb-2">
                Welcome to Dice Roll
              </h2>
              <p className="text-white/70 mb-6">Ready to test your luck?</p>
              <Button
                onClick={initializeGameWithRetry}
                className="bg-[#6fc7ba] hover:bg-[#6fc7ba]/90"
              >
                <Icon icon="ph:play" className="h-4 w-4 mr-2" />
                Start Game
              </Button>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-full w-full bg-[#1E1E1E] rounded-3xl p-6">
      {/* Game Display */}
      <div className="h-1/2 relative bg-[#2A2A2A] rounded-2xl overflow-hidden mb-6">
        <div className="absolute inset-0 flex items-center justify-center">
          {isRolling ? (
            <div className="animate-pulse text-4xl font-bold text-[#6fc7ba]">
              <Icon icon="ph:dice" className="h-16 w-16 animate-spin" />
            </div>
          ) : (
            <div className="text-6xl font-bold text-white">
              {rollHistory?.[0]?.roll?.toString() ?? "?"}
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
      {/* Game Controls */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm text-white/70">Bet Amount</label>
            <span className="text-sm text-[#6fc7ba]">
              Balance: {formatBalance(balance?.total)} KAS
            </span>
          </div>
          <div className="flex gap-2">
            <Input
              type="number"
              value={betAmount}
              onChange={(e) => setBetAmount(e.target.value)}
              placeholder="0.00000000"
              className="bg-[#2A2A2A] border-white/5 text-white"
            />
            <Button
              variant="outline"
              onClick={() => setBetAmount(formatBalance(balance?.total))}
              className="border-white/5 hover:border-[#6fc7ba]/20"
            >
              <Icon icon="ph:arrow-up-bold" className="h-4 w-4" />
            </Button>
          </div>
          <div className="space-y-2">
            <label className="text-sm text-white/70">Client Seed</label>
            <div className="flex gap-2">
              <Input
                type="text"
                value={clientSeed}
                onChange={(e) => setClientSeed(e.target.value)}
                placeholder="Enter client seed"
                className="bg-[#2A2A2A] border-white/5 text-white"
              />
              <Button
                variant="outline"
                onClick={() =>
                  setClientSeed(Math.random().toString(36).slice(2))
                }
                className="border-white/5 hover:border-[#6fc7ba]/20"
                title="Generate Random Seed"
              >
                <Icon icon="ph:shuffle" className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm text-white/70">Target Number</label>
            <div className="flex gap-2">
              <Button
                variant={condition === "UNDER" ? "default" : "outline"}
                onClick={() => setCondition("UNDER")}
                className={
                  condition === "UNDER" ? "bg-[#6fc7ba]" : "border-white/5"
                }
                size="sm"
              >
                Under
              </Button>
              <Button
                variant={condition === "OVER" ? "default" : "outline"}
                onClick={() => setCondition("OVER")}
                className={
                  condition === "OVER" ? "bg-[#6fc7ba]" : "border-white/5"
                }
                size="sm"
              >
                Over
              </Button>
            </div>
          </div>
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
      </div>
      {/* Game Info */}
      <div className="flex justify-between mt-4 text-sm">
        <div className="text-white/70">
          Win Chance:{" "}
          <span className="text-[#6fc7ba]">{calculateWinChance()}%</span>
        </div>
        <div className="text-white/70">
          Multiplier:{" "}
          <span className="text-[#6fc7ba]">{calculateMultiplier()}x</span>
        </div>
        <div className="text-white/70">
          Potential Win:{" "}
          <span className="text-[#6fc7ba]">
            {formatBalance(
              (parseFloat(betAmount) || 0) * parseFloat(calculateMultiplier()),
            )}{" "}
            KAS
          </span>
        </div>
      </div>
      Roll History
      <div className="mt-4 space-y-2">
        <div className="flex items-center justify-between text-sm text-white/70">
          <span>Roll History</span>
          <span>
            Win Rate:{" "}
            {rollHistory.length > 0
              ? `${((rollHistory.filter((r) => r.profit > 0).length / rollHistory.length) * 100).toFixed(1)}%`
              : "0%"}
          </span>
        </div>
        {/* <div className="grid grid-cols-4 gap-2">
          {rollHistory.slice(0, 8).map((result, index) => (
            <div
              key={result.timestamp}
              className="bg-[#2A2A2A] rounded-lg p-2 text-center"
            >
              <div className="text-sm text-white/70">#{index + 1}</div>
              <div
                className={
                  result.profit >= 0 ? "text-[#6fc7ba]" : "text-red-500"
                }
              >
                {result.roll}
              </div>
            </div>
          ))}
        </div> */}
      </div>
      {/* Play Button */}
      <div className="absolute bottom-6 right-6">
        <Button
          onClick={handleRoll}
          disabled={isRolling || !isConnected}
          className="w-32 h-32 rounded-full bg-[#6fc7ba] hover:bg-[#6fc7ba]/90 shadow-lg"
        >
          {isRolling ? (
            <div className="flex flex-col items-center gap-2">
              <Icon icon="ph:dice" className="h-8 w-8 animate-spin" />
              <span className="text-sm">Rolling...</span>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <Icon icon="ph:dice" className="h-8 w-8" />
              <span className="text-sm">Roll</span>
            </div>
          )}
        </Button>
      </div>
      {/* Connection Status */}
      <div className="absolute top-6 right-6">
        <div
          className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${
            isConnected ? "bg-[#6fc7ba]/20" : "bg-red-500/20"
          }`}
        >
          <div
            className={`w-2 h-2 rounded-full ${
              isConnected ? "bg-[#6fc7ba]" : "bg-red-500"
            }`}
          />
          <span
            className={`text-xs ${
              isConnected ? "text-[#6fc7ba]" : "text-red-500"
            }`}
          >
            {isConnected ? "Connected" : "Disconnected"}
          </span>
        </div>
      </div>
    </div>
  );
}
