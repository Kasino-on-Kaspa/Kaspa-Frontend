import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Icon } from "@iconify/react";
import { useWalletBalance } from "@/lib/walletQueries";
import { toast } from "sonner";
import useDicerollStore from "@/store/dicerollStore";
import useWalletStore from "@/store/walletStore";
import { useNavigate } from "@tanstack/react-router";
import { DieRollBetType } from "@/types/dieroll";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

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

interface AutoBetSettings {
  numberOfBets: number | "infinity";
  onWin: {
    action: "reset" | "increase";
    percentage: number;
  };
  onLoss: {
    action: "reset" | "increase";
    percentage: number;
  };
  stopOnProfit: string;
  stopOnLoss: string;
}

export default function DieRollGame() {
  const navigate = useNavigate();
  const { isAuthenticated } = useWalletStore();
  const { data: balance } = useWalletBalance();
  const {
    isConnected,
    rollResult,
    gameSessionError,
    serverSeedHash,
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
  const [gameMode, setGameMode] = useState<"Manual" | "Auto">("Manual");

  // Auto bet state
  const [autoBetSettings, setAutoBetSettings] = useState<AutoBetSettings>({
    numberOfBets: 0,
    onWin: {
      action: "reset",
      percentage: 0,
    },
    onLoss: {
      action: "reset",
      percentage: 0,
    },
    stopOnProfit: "0",
    stopOnLoss: "0",
  });
  const [isAutoBetting, setIsAutoBetting] = useState(false);
  const [autoBetCount, setAutoBetCount] = useState(0);
  const [totalProfit, setTotalProfit] = useState(0);
  const [originalBetAmount, setOriginalBetAmount] = useState("");

  // Slider dragging
  const sliderRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);

  // Add to the state variables
  const [lastRollValue, setLastRollValue] = useState<number | null>(null);
  const [showRollAnimation, setShowRollAnimation] = useState(false);

  // Error handling
  useEffect(() => {
    if (gameSessionError) {
      toast.error(gameSessionError);
      setIsLoading(false);
      if (isAutoBetting) {
        stopAutoBet();
      }
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
      ? parseFloat(currentBetAmount) * multiplier - parseFloat(currentBetAmount)
      : -parseFloat(currentBetAmount);

    const result = {
      roll,
      multiplier,
      profit,
      timestamp: Date.now(),
    };

    console.log("result", result);

    // Set the roll value for the animation
    setLastRollValue(roll);
    setShowRollAnimation(true);

    // Hide the animation after 3 seconds
    setTimeout(() => {
      setShowRollAnimation(false);
    }, 3000);

    setRollHistory((prev) => [result, ...prev].slice(0, 10));
    setIsRolling(false);

    // Update total profit for auto betting
    setTotalProfit((prev) => prev + profit);

    // Handle autobet logic
    if (isAutoBetting) {
      handleAutoBetResult(isWin, profit);
    } else {
      if (isWin) {
        toast.success(`You won ${profit.toFixed(8)} KAS!`);
      } else {
        toast.error(`You lost ${parseFloat(currentBetAmount).toFixed(8)} KAS`);
      }
    }
  }, [rollResult]); // Only depend on rollResult changes

  // Handle auto bet result and continue or stop based on settings
  const handleAutoBetResult = (isWin: boolean, profit: number) => {
    // Update bet count
    setAutoBetCount((prev) => prev + 1);

    // Check stop conditions
    if (
      totalProfit >= parseFloat(autoBetSettings.stopOnProfit) &&
      parseFloat(autoBetSettings.stopOnProfit) > 0
    ) {
      toast.success(
        `Auto betting stopped: Profit goal reached (${totalProfit.toFixed(8)} KAS)`,
      );
      stopAutoBet();
      return;
    }

    if (
      totalProfit <= -parseFloat(autoBetSettings.stopOnLoss) &&
      parseFloat(autoBetSettings.stopOnLoss) > 0
    ) {
      toast.error(
        `Auto betting stopped: Loss limit reached (${totalProfit.toFixed(8)} KAS)`,
      );
      stopAutoBet();
      return;
    }

    // Check if we've reached the number of bets (unless infinity)
    if (
      autoBetSettings.numberOfBets !== "infinity" &&
      autoBetCount >= autoBetSettings.numberOfBets
    ) {
      toast.info(`Auto betting stopped: Completed ${autoBetCount} bets`);
      stopAutoBet();
      return;
    }

    // Adjust bet amount based on win/loss settings
    if (isWin) {
      if (autoBetSettings.onWin.action === "reset") {
        setBetAmount(originalBetAmount);
      } else if (autoBetSettings.onWin.action === "increase") {
        const increase =
          parseFloat(betAmount) * (autoBetSettings.onWin.percentage / 100);
        setBetAmount((parseFloat(betAmount) + increase).toFixed(8));
      }
    } else {
      if (autoBetSettings.onLoss.action === "reset") {
        setBetAmount(originalBetAmount);
      } else if (autoBetSettings.onLoss.action === "increase") {
        const increase =
          parseFloat(betAmount) * (autoBetSettings.onLoss.percentage / 100);
        setBetAmount((parseFloat(betAmount) + increase).toFixed(8));
      }
    }

    // Continue auto betting with a small delay
    setTimeout(() => {
      if (isAutoBetting) {
        handleRoll();
      }
    }, 1000);
  };

  // Start auto betting
  const startAutoBet = () => {
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

    // Save original bet amount for reset functionality
    setOriginalBetAmount(betAmount);

    // Reset counters and start
    setAutoBetCount(0);
    setTotalProfit(0);
    setIsAutoBetting(true);

    toast.info(
      `Starting auto betting with ${
        autoBetSettings.numberOfBets === "infinity"
          ? "unlimited"
          : autoBetSettings.numberOfBets
      } bets`,
    );

    handleRoll();
  };

  // Stop auto betting
  const stopAutoBet = () => {
    setIsAutoBetting(false);
  };

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

  // Add this function to play a random dice sound
  const playRandomDiceSound = () => {
    // Select a random number between 1 and 8
    const randomNum = Math.floor(Math.random() * 8) + 1;

    // Create a new audio object
    const audio = new Audio(`/dice-sounds/dice-0${randomNum}.wav`);
    audio.volume = 0.5;

    // Play the sound
    audio.play().catch((error) => {
      console.error("Error playing dice sound:", error);
    });
  };

  // Update the handleRoll function to play a sound
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

    // Play a random dice sound when the bet is placed
    playRandomDiceSound();

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
      if (isAutoBetting) {
        stopAutoBet();
      }
      toast.error("Failed to place bet");
    }
  };

  // Handle slider drag
  useEffect(() => {
    const handleMouseDown = (e: MouseEvent) => {
      if (sliderRef.current && sliderRef.current.contains(e.target as Node)) {
        isDragging.current = true;
        handleSliderPosition(e);
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging.current) {
        handleSliderPosition(e);
      }
    };

    const handleMouseUp = () => {
      isDragging.current = false;
    };

    const handleSliderPosition = (e: MouseEvent) => {
      if (!sliderRef.current) return;

      const rect = sliderRef.current.getBoundingClientRect();
      let percentage = ((e.clientX - rect.left) / rect.width) * 100;

      // Clamp between 1 and 98
      percentage = Math.max(1, Math.min(98, percentage));

      setTargetNumber(Math.round(percentage));
    };

    document.addEventListener("mousedown", handleMouseDown);
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);

    return () => {
      document.removeEventListener("mousedown", handleMouseDown);
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, []);

  const calculateMultiplier = () => {
    return condition === "OVER"
      ? (100 / (100 - targetNumber)).toFixed(4)
      : (100 / targetNumber).toFixed(4);
  };

  const calculateWinChance = () => {
    return condition === "OVER"
      ? (100 - targetNumber).toFixed(4)
      : targetNumber.toFixed(4);
  };

  const formatBalance = (value?: number | null) => {
    if (value === undefined || value === null) return "0.00000000";
    return value.toFixed(8);
  };

  // Calculate estimated profit on win
  const calculateProfit = () => {
    if (!betAmount || parseFloat(betAmount) <= 0) return "0.00000000";
    const mult = parseFloat(calculateMultiplier());
    return (parseFloat(betAmount) * mult - parseFloat(betAmount)).toFixed(8);
  };

  if (!isGameInitialized) {
    return (
      <div className="relative w-full h-full bg-[#1a1718] rounded-3xl p-6">
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

  const ProvablyFairModal = () => (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          className="text-[#6fc7ba] hover:bg-[#6fc7ba]/10"
        >
          <Icon icon="ph:shield-check-fill" className="mr-2 h-4 w-4" />
          Provably Fair
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-[#1a1718] border-[#6fc7ba]/20 text-white">
        <DialogHeader>
          <DialogTitle className="text-[#6fc7ba]">
            Provably Fair System
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-medium text-white/70 mb-1">
              Client Seed
            </h3>
            <div className="flex gap-2">
              <Input
                value={clientSeed}
                onChange={(e) => setClientSeed(e.target.value)}
                className="bg-[#2a2627] border-none text-white"
              />
              <Button
                variant="outline"
                className="border-[#6fc7ba]/20 hover:bg-[#6fc7ba]/10"
                onClick={() =>
                  setClientSeed(Math.random().toString(36).substring(2, 15))
                }
              >
                <Icon icon="ph:arrows-counter-clockwise" className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-xs text-white/50 mt-1">
              You can change your client seed before each bet
            </p>
          </div>

          <div>
            <h3 className="text-sm font-medium text-white/70 mb-1">
              Server Seed (Hashed)
            </h3>
            <div className="bg-[#2a2627] p-2 rounded text-xs font-mono overflow-x-auto text-white/70">
              {serverSeedHash}
            </div>
          </div>

          <div className="text-sm text-white/70">
            <p>
              Our provably fair system ensures that all game outcomes are random
              and cannot be manipulated. The combination of your client seed and
              our server seed is used to generate the roll result. After each
              game, you can verify that the result was fair and not
              predetermined.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );

  // Manual bet UI controls
  const BetControls = () => (
    <div className="space-y-3">
      {/* Bet Amount */}
      <div>
        <div className="flex justify-between mb-2">
          <span className="text-sm text-white/70">Bet Amount</span>
          <span className="text-sm text-white/70">${"0.00"}</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="relative flex-1">
            <Input
              type="number"
              value={betAmount}
              onChange={(e) => setBetAmount(e.target.value)}
              placeholder="0.00000000"
              className="bg-[#2a2627] border-none text-white h-10 pr-8"
              disabled={isAutoBetting}
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2">
              <Icon
                icon="ph:currency-circle-dollar"
                className="text-[#6fc7ba] h-5 w-5"
              />
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="h-10 border-[#2a2627] bg-[#2a2627] text-xs hover:bg-[#3a3637] text-white"
            onClick={() =>
              setBetAmount((parseFloat(betAmount || "0") / 2).toString())
            }
            disabled={isAutoBetting}
          >
            ½
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-10 border-[#2a2627] bg-[#2a2627] text-xs hover:bg-[#3a3637] text-white"
            onClick={() =>
              setBetAmount((parseFloat(betAmount || "0") * 2).toString())
            }
            disabled={isAutoBetting}
          >
            2×
          </Button>
        </div>
      </div>

      {gameMode === "Auto" && (
        <>
          {/* Number of Bets */}
          <div>
            <div className="flex justify-between mb-2">
              <span className="text-sm text-white/70">Number of Bets</span>
            </div>
            <div className="relative">
              <Input
                type="number"
                value={
                  autoBetSettings.numberOfBets === "infinity"
                    ? "0"
                    : autoBetSettings.numberOfBets
                }
                onChange={(e) => {
                  const value = parseInt(e.target.value);
                  setAutoBetSettings((prev) => ({
                    ...prev,
                    numberOfBets: isNaN(value) ? 0 : value,
                  }));
                }}
                placeholder="0"
                disabled={isAutoBetting}
                className="bg-[#2a2627] border-none text-white h-10 pr-10"
              />
              <button
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-white hover:text-[#6fc7ba]"
                onClick={() => {
                  setAutoBetSettings((prev) => ({
                    ...prev,
                    numberOfBets:
                      prev.numberOfBets === "infinity" ? 0 : "infinity",
                  }));
                }}
                disabled={isAutoBetting}
              >
                <Icon
                  icon="ph:infinity-bold"
                  className={`h-5 w-5 ${autoBetSettings.numberOfBets === "infinity" ? "text-[#6fc7ba]" : "text-white/70"}`}
                />
              </button>
            </div>
          </div>

          {/* On Win */}
          <div>
            <div className="flex justify-between mb-2">
              <span className="text-sm text-white/70">On Win</span>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className={`py-1 px-3 text-xs h-10 ${autoBetSettings.onWin.action === "reset" ? "bg-[#3a3637] text-white" : "bg-[#2a2627] text-white/70"} border-[#2a2627]`}
                onClick={() => {
                  setAutoBetSettings((prev) => ({
                    ...prev,
                    onWin: { ...prev.onWin, action: "reset" },
                  }));
                }}
                disabled={isAutoBetting}
              >
                Reset
              </Button>
              <div className="flex-1 flex items-center gap-1 h-10 px-2 bg-[#2a2627] rounded">
                <span className="text-xs text-white/70">Increase by:</span>
                <Input
                  type="number"
                  value={autoBetSettings.onWin.percentage}
                  onChange={(e) => {
                    const value = parseInt(e.target.value);
                    setAutoBetSettings((prev) => ({
                      ...prev,
                      onWin: {
                        action: "increase",
                        percentage: isNaN(value) ? 0 : value,
                      },
                    }));
                  }}
                  className="h-7 bg-[#2a2627] border-none text-white text-xs w-12"
                  disabled={
                    isAutoBetting || autoBetSettings.onWin.action !== "increase"
                  }
                />
                <span className="text-xs text-white/70">%</span>
              </div>
            </div>
          </div>

          {/* On Loss */}
          <div>
            <div className="flex justify-between mb-2">
              <span className="text-sm text-white/70">On Loss</span>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className={`py-1 px-3 text-xs h-10 ${autoBetSettings.onLoss.action === "reset" ? "bg-[#3a3637] text-white" : "bg-[#2a2627] text-white/70"} border-[#2a2627]`}
                onClick={() => {
                  setAutoBetSettings((prev) => ({
                    ...prev,
                    onLoss: { ...prev.onLoss, action: "reset" },
                  }));
                }}
                disabled={isAutoBetting}
              >
                Reset
              </Button>
              <div className="flex-1 flex items-center gap-1 h-10 px-2 bg-[#2a2627] rounded">
                <span className="text-xs text-white/70">Increase by:</span>
                <Input
                  type="number"
                  value={autoBetSettings.onLoss.percentage}
                  onChange={(e) => {
                    const value = parseInt(e.target.value);
                    setAutoBetSettings((prev) => ({
                      ...prev,
                      onLoss: {
                        action: "increase",
                        percentage: isNaN(value) ? 0 : value,
                      },
                    }));
                  }}
                  className="h-7 bg-[#2a2627] border-none text-white text-xs w-12"
                  disabled={
                    isAutoBetting ||
                    autoBetSettings.onLoss.action !== "increase"
                  }
                />
                <span className="text-xs text-white/70">%</span>
              </div>
            </div>
          </div>

          {/* Stop on Profit */}
          <div>
            <div className="flex justify-between mb-2">
              <span className="text-sm text-white/70">Stop on Profit</span>
              <span className="text-sm text-white/70">${"0.00"}</span>
            </div>
            <div className="relative">
              <Input
                type="number"
                value={autoBetSettings.stopOnProfit}
                onChange={(e) => {
                  setAutoBetSettings((prev) => ({
                    ...prev,
                    stopOnProfit: e.target.value,
                  }));
                }}
                placeholder="0.00000000"
                disabled={isAutoBetting}
                className="bg-[#2a2627] border-none text-white h-10 pr-8"
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2">
                <Icon
                  icon="ph:currency-circle-dollar"
                  className="text-[#6fc7ba] h-5 w-5"
                />
              </div>
            </div>
          </div>

          {/* Stop on Loss */}
          <div>
            <div className="flex justify-between mb-2">
              <span className="text-sm text-white/70">Stop on Loss</span>
              <span className="text-sm text-white/70">${"0.00"}</span>
            </div>
            <div className="relative">
              <Input
                type="number"
                value={autoBetSettings.stopOnLoss}
                onChange={(e) => {
                  setAutoBetSettings((prev) => ({
                    ...prev,
                    stopOnLoss: e.target.value,
                  }));
                }}
                placeholder="0.00000000"
                disabled={isAutoBetting}
                className="bg-[#2a2627] border-none text-white h-10 pr-8"
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2">
                <Icon
                  icon="ph:currency-circle-dollar"
                  className="text-[#6fc7ba] h-5 w-5"
                />
              </div>
            </div>
          </div>
        </>
      )}

      {gameMode === "Manual" && (
        <div>
          <div className="flex justify-between mb-2">
            <span className="text-sm text-white/70">Profit on Win</span>
            <span className="text-sm text-white/70">${"0.00"}</span>
          </div>
          <div className="relative">
            <Input
              type="text"
              value={calculateProfit()}
              readOnly
              className="bg-[#2a2627] border-none text-white h-10 pr-8"
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2">
              <Icon
                icon="ph:currency-circle-dollar"
                className="text-[#6fc7ba] h-5 w-5"
              />
            </div>
          </div>
        </div>
      )}

      {/* Button */}
      <Button
        onClick={
          gameMode === "Auto"
            ? isAutoBetting
              ? stopAutoBet
              : startAutoBet
            : handleRoll
        }
        disabled={isRolling}
        className={`w-full ${
          gameMode === "Auto" && isAutoBetting
            ? "bg-red-500 hover:bg-red-600"
            : "bg-[#6fc7ba] hover:bg-[#6fc7ba]/90"
        } text-black font-bold py-6 h-12`}
      >
        {isRolling ? (
          <div className="flex items-center gap-2">
            <Icon icon="mdi:loading" className="h-4 w-4 animate-spin" />
            Rolling...
          </div>
        ) : gameMode === "Auto" ? (
          isAutoBetting ? (
            "Stop Autobet"
          ) : (
            "Start Autobet"
          )
        ) : (
          "Bet"
        )}
      </Button>
    </div>
  );

  // Game stats UI
  const GameStats = () => (
    <div className="grid grid-cols-3 gap-3 bg-[#2a2627] rounded-lg p-3">
      <div className="space-y-1">
        <div className="text-white/70 text-xs">Multiplier</div>
        <div className="flex items-center">
          <span className="text-white text-lg font-semibold">
            {calculateMultiplier()}
          </span>
          <span className="text-white/70 ml-1">×</span>
        </div>
      </div>
      <div className="space-y-1">
        <div className="text-white/70 text-xs">Roll {condition}</div>
        <div className="flex items-center">
          <span className="text-white text-lg font-semibold">
            {targetNumber}.50
          </span>
          <button
            className="ml-2 text-white/70 hover:text-white"
            onClick={() =>
              setCondition(condition === "OVER" ? "UNDER" : "OVER")
            }
          >
            <Icon icon="ph:arrows-clockwise" className="h-4 w-4" />
          </button>
        </div>
      </div>
      <div className="space-y-1">
        <div className="text-white/70 text-xs">Win Chance</div>
        <div className="flex items-center">
          <span className="text-white text-lg font-semibold">
            {calculateWinChance()}
          </span>
          <span className="text-white/70 ml-1">%</span>
        </div>
      </div>
    </div>
  );

  // Create a BetHistoryBubbles component
  const BetHistoryBubbles = () => {
    // Only show the 5 most recent bets
    const recentBets = rollHistory.slice(0, 10);

    return (
      <div className="flex justify-center gap-2 mb-4 overflow-x-hidden">
        {recentBets.map((bet, index) => {
          const isWin =
            condition === "OVER"
              ? bet.roll >= targetNumber
              : bet.roll <= targetNumber;

          return (
            <div
              key={index}
              className={`w-12 h-12 rounded-full flex items-center justify-center text-black font-bold ${
                isWin ? "bg-[#6fc7ba]" : "bg-red-500"
              }`}
            >
              {bet.roll}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="relative w-full h-full bg-[#1a1718] rounded-3xl overflow-hidden">
      {/* Mobile View */}
      <div className="lg:hidden flex flex-col h-full p-3 space-y-3 max-h-full">
        <div className="bg-[#2a2627] rounded-xl p-3">
          {/* Bet History Bubbles */}
          {rollHistory.length > 0 && <BetHistoryBubbles />}

          {/* Mode Toggle */}
          <div className="rounded-full bg-[#1a1718] p-1 flex border border-[#3a3637] mb-4">
            <button
              className={`flex-1 rounded-full py-2 text-sm font-medium transition ${
                gameMode === "Manual"
                  ? "bg-[#3a3637] text-white"
                  : "text-white/50 hover:text-white"
              }`}
              onClick={() => {
                if (isAutoBetting) return;
                setGameMode("Manual");
              }}
            >
              Manual
            </button>
            <button
              className={`flex-1 rounded-full py-2 text-sm font-medium transition ${
                gameMode === "Auto"
                  ? "bg-[#3a3637] text-white"
                  : "text-white/50 hover:text-white"
              }`}
              onClick={() => {
                if (isAutoBetting) return;
                setGameMode("Auto");
              }}
            >
              Auto
            </button>
            <button className="w-8 h-8 flex items-center justify-center text-white">
              <Icon icon="ph:link-simple" className="h-4 w-4" />
            </button>
          </div>

          {/* Slider */}
          <div className="mb-4">
            <div className="relative h-16">
              <div className="flex justify-between absolute w-full text-white/70 text-xs mb-1">
                <span>0</span>
                <span>25</span>
                <span>50</span>
                <span>75</span>
                <span>100</span>
              </div>
              <div
                ref={sliderRef}
                className="absolute w-full h-2 bg-gradient-to-r from-red-500 to-[#6fc7ba] rounded-full top-8 cursor-pointer"
              >
                {/* Slider Thumb */}
                <div
                  className="absolute top-1/2 -translate-y-1/2 bg-[#6fc7ba] w-8 h-8 flex items-center justify-center rounded cursor-pointer z-10 shadow-md"
                  style={{ left: `calc(${targetNumber}% - 16px)` }}
                >
                  <Icon icon="ph:list-bullets" className="text-white" />
                </div>

                {/* Roll Result Indicator */}
                {showRollAnimation && lastRollValue !== null && (
                  <div
                    className={`absolute top-1/2 -translate-y-1/2 w-6 h-6 rounded-full shadow-lg z-20 animate-pulse ${
                      (condition === "OVER" && lastRollValue >= targetNumber) ||
                      (condition === "UNDER" && lastRollValue <= targetNumber)
                        ? "bg-[#6fc7ba]"
                        : "bg-red-500"
                    }`}
                    style={{ left: `calc(${lastRollValue}% - 12px)` }}
                  >
                    <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-black/80 text-white text-xs py-1 px-2 rounded whitespace-nowrap">
                      {lastRollValue}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <GameStats />
        </div>

        <div className="flex-1 bg-[#2a2627] rounded-xl p-3 overflow-auto">
          <BetControls />
        </div>
      </div>

      {/* Desktop View */}
      <div className="hidden lg:flex h-full max-h-full">
        <div className="w-1/3 bg-[#2a2627] p-4 flex flex-col overflow-auto">
          {/* Mode Toggle */}
          <div className="rounded-full bg-[#1a1718] p-1 flex border border-[#3a3637] mb-4">
            <button
              className={`flex-1 rounded-full py-2 text-sm font-medium transition ${
                gameMode === "Manual"
                  ? "bg-[#3a3637] text-white"
                  : "text-white/50 hover:text-white"
              }`}
              onClick={() => {
                if (isAutoBetting) return;
                setGameMode("Manual");
              }}
            >
              Manual
            </button>
            <button
              className={`flex-1 rounded-full py-2 text-sm font-medium transition ${
                gameMode === "Auto"
                  ? "bg-[#3a3637] text-white"
                  : "text-white/50 hover:text-white"
              }`}
              onClick={() => {
                if (isAutoBetting) return;
                setGameMode("Auto");
              }}
            >
              Auto
            </button>
            <button className="w-8 h-8 flex items-center justify-center text-white">
              <Icon icon="ph:link-simple" className="h-4 w-4" />
            </button>
          </div>

          <BetControls />

          <div className="mt-auto text-right">
            <ProvablyFairModal />
          </div>
        </div>

        <div className="w-2/3 p-4 flex flex-col">
          {/* Bet History Bubbles */}
          {rollHistory.length > 0 && <BetHistoryBubbles />}

          {/* Roll Display */}
          <div className="flex-1 flex items-center justify-center">
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

          {/* Slider */}
          <div className="mb-8">
            <div className="relative h-20">
              <div className="flex justify-between absolute w-full text-white/70 text-sm mb-2">
                <span>0</span>
                <span>25</span>
                <span>50</span>
                <span>75</span>
                <span>100</span>
              </div>
              <div
                ref={sliderRef}
                className="absolute w-full h-3 bg-gradient-to-r from-red-500 to-[#6fc7ba] rounded-full top-10 cursor-pointer"
              >
                {/* Slider Thumb */}
                <div
                  className="absolute top-1/2 -translate-y-1/2 bg-[#6fc7ba] w-8 h-8 flex items-center justify-center rounded cursor-pointer z-10 shadow-md"
                  style={{ left: `calc(${targetNumber}% - 16px)` }}
                >
                  <Icon icon="ph:list-bullets" className="text-white" />
                </div>

                {/* Roll Result Indicator */}
                {showRollAnimation && lastRollValue !== null && (
                  <div
                    className={`absolute top-1/2 -translate-y-1/2 w-8 h-8 rounded-full shadow-lg z-20 animate-pulse ${
                      (condition === "OVER" && lastRollValue >= targetNumber) ||
                      (condition === "UNDER" && lastRollValue <= targetNumber)
                        ? "bg-[#6fc7ba]"
                        : "bg-red-500"
                    }`}
                    style={{ left: `calc(${lastRollValue}% - 16px)` }}
                  >
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-black/80 text-white text-xs py-1 px-2 rounded whitespace-nowrap">
                      {lastRollValue}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <GameStats />
        </div>
      </div>
    </div>
  );
}
