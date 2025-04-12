import { useState, useEffect, useRef, useCallback, memo } from "react";
import { Button } from "@/components/ui/button";
import { Icon } from "@iconify/react";
import Kaspa from "../../assets/Kaspa.svg";
import { toast } from "sonner";
import useDicerollStore from "@/store/dicerollStore";
import useWalletStore from "@/store/walletStore";
import { useNavigate } from "@tanstack/react-router";
import { DieRollBetType, RollHistory } from "@/types/dieroll";
import { kasToSompi } from "@/lib/utils";
import ProvablyFair from "./ProvablyFair";
import BetDetailsModal from "./BetDetailsModal";
import ManualBet from "./dicreoll/ManualBet";

// CSS for custom animations - will be injected at runtime
const customAnimations = `
@keyframes bounceIn {
  from, 20%, 40%, 60%, 80%, to {
    animation-timing-function: cubic-bezier(0.215, 0.610, 0.355, 1.000);
  }
  0% {
    opacity: 0;
    transform: scale3d(0.3, 0.3, 0.3);
  }
  20% {
    transform: scale3d(1.1, 1.1, 1.1);
  }
  40% {
    transform: scale3d(0.9, 0.9, 0.9);
  }
  60% {
    opacity: 1;
    transform: scale3d(1.03, 1.03, 1.03);
  }
  80% {
    transform: scale3d(0.97, 0.97, 0.97);
  }
  to {
    opacity: 1;
    transform: scale3d(1, 1, 1);
  }
}
.animate-bounceIn {
  animation: bounceIn 0.5s;
}

@keyframes diceRoll {
  0%, 100% {
    transform: rotate(0deg);
  }
  25% {
    transform: rotate(90deg) scale(1.1);
  }
  50% {
    transform: rotate(180deg) scale(0.9);
  }
  75% {
    transform: rotate(270deg) scale(1.1);
  }
}
.animate-diceRoll {
  animation: diceRoll 0.8s infinite ease-in-out;
}

@keyframes instantAppear {
  from {
    opacity: 0.5;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}
.animate-instantAppear {
  animation: instantAppear 0.2s forwards;
}
`;

interface RollResult {
  roll: number;
  serverSeed: string;
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

// Move BetControls outside the main component
const BetControls = memo(
  ({
    onSiteBalance,
    betAmount,
    setBetAmount,
    gameMode,
    isAutoBetting,
    isRolling,
    autoBetSettings,
    setAutoBetSettings,
    startAutoBet,
    stopAutoBet,
    handleRoll,
    calculateProfit,
  }: {
    onSiteBalance: {
      balance?: string;
      address?: string;
    } | null;
    betAmount: string;
    setBetAmount: (value: string) => void;
    gameMode: "Manual" | "Auto";
    isAutoBetting: boolean;
    isRolling: boolean;
    autoBetSettings: AutoBetSettings;
    setAutoBetSettings: (value: AutoBetSettings) => void;
    startAutoBet: () => void;
    stopAutoBet: () => void;
    handleRoll: () => void;
    calculateProfit: () => string;
  }) => {
    return (
      <div className="space-y-3">
        <p className="text-sm text-white/70 font-Onest uppercase font-bold flex items-center gap-2">
          <Icon icon="mdi:cash-multiple" className="h-5 w-5" />
          BET AMOUNT
        </p>
        <ManualBet
          onSiteBalance={onSiteBalance}
          betAmount={betAmount}
          setBetAmount={setBetAmount}
        />

        {gameMode === "Auto" && (
          <>
            {/* Number of Bets */}
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm text-white/70 font-Onest uppercase font-bold">
                  Number of Bets
                </span>
              </div>
              <div className="flex items-center gap-1 font-Onest">
                <div className="bg-[#2A2A2A] rounded-[20px] pl-4 relative flex items-center w-full">
                  <input
                    type="text"
                    value={
                      autoBetSettings.numberOfBets === "infinity"
                        ? "0"
                        : autoBetSettings.numberOfBets
                    }
                    onChange={(e) => {
                      const value = parseInt(e.target.value);
                      if (isNaN(value)) {
                        toast.error("Please enter a valid number");
                        return;
                      }
                      setAutoBetSettings({
                        ...autoBetSettings,
                        numberOfBets: value,
                      });
                    }}
                    className="w-full text-white/80 pr-4 py-4 outline-none font-black text-3xl bg-transparent"
                  />
                  <button
                    type="button"
                    className="absolute right-6 cursor-pointer top-1/2 transform -translate-y-1/2 text-white hover:text-[#6fc7ba]"
                    onClick={() => {
                      setAutoBetSettings({
                        ...autoBetSettings,
                        numberOfBets:
                          autoBetSettings.numberOfBets === "infinity"
                            ? 0
                            : "infinity",
                      });
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
            </div>

            {/* On Win */}
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm text-white/70">On Win</span>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  className={`py-1 px-3 text-xs h-10 ${autoBetSettings.onWin.action === "reset" ? "bg-[#3a3637] text-white" : "bg-[#2a2627] text-white/70"} border-[#2a2627] rounded`}
                  onClick={() => {
                    setAutoBetSettings({
                      ...autoBetSettings,
                      onWin: { ...autoBetSettings.onWin, action: "reset" },
                    });
                  }}
                  disabled={isAutoBetting}
                >
                  Reset
                </button>
                <div className="flex-1 flex items-center gap-1 h-10 px-2 bg-[#2a2627] rounded">
                  <span className="text-xs text-white/70">Increase by:</span>
                  <input
                    type="number"
                    value={autoBetSettings.onWin.percentage}
                    onChange={(e) => {
                      const value = parseInt(e.target.value);
                      setAutoBetSettings({
                        ...autoBetSettings,
                        onWin: {
                          action: "increase",
                          percentage: isNaN(value) ? 0 : value,
                        },
                      });
                    }}
                    className="h-7 bg-[#2a2627] border-none text-white text-xs w-12"
                    disabled={
                      isAutoBetting ||
                      autoBetSettings.onWin.action !== "increase"
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
                <button
                  type="button"
                  className={`py-1 px-3 text-xs h-10 ${autoBetSettings.onLoss.action === "reset" ? "bg-[#3a3637] text-white" : "bg-[#2a2627] text-white/70"} border-[#2a2627] rounded`}
                  onClick={() => {
                    setAutoBetSettings({
                      ...autoBetSettings,
                      onLoss: { ...autoBetSettings.onLoss, action: "reset" },
                    });
                  }}
                  disabled={isAutoBetting}
                >
                  Reset
                </button>
                <div className="flex-1 flex items-center gap-1 h-10 px-2 bg-[#2a2627] rounded">
                  <span className="text-xs text-white/70">Increase by:</span>
                  <input
                    type="number"
                    value={autoBetSettings.onLoss.percentage}
                    onChange={(e) => {
                      const value = parseInt(e.target.value);
                      setAutoBetSettings({
                        ...autoBetSettings,
                        onLoss: {
                          action: "increase",
                          percentage: isNaN(value) ? 0 : value,
                        },
                      });
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
                <input
                  type="number"
                  value={autoBetSettings.stopOnProfit}
                  onChange={(e) => {
                    setAutoBetSettings({
                      ...autoBetSettings,
                      stopOnProfit: e.target.value,
                    });
                  }}
                  placeholder="0.00000000"
                  disabled={isAutoBetting}
                  className="w-full bg-[#2a2627] border-none text-white h-10 pr-8 rounded-lg"
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
                <input
                  type="number"
                  value={autoBetSettings.stopOnLoss}
                  onChange={(e) => {
                    setAutoBetSettings({
                      ...autoBetSettings,
                      stopOnLoss: e.target.value,
                    });
                  }}
                  placeholder="0.00000000"
                  disabled={isAutoBetting}
                  className="w-full bg-[#2a2627] border-none text-white h-10 pr-8 rounded-lg"
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
            <div className="flex justify-between mb-2 font-black font-Onest">
              <span className="text-sm text-white/70 ">PROFIT ON WIN</span>
              <span className="text-sm text-white/70 flex items-center">
                <Icon icon="mdi:approximately-equal" className="h-5 w-5" />
                {"0.00"}
              </span>
            </div>
            <div className="flex items-center gap-1 font-Onest">
              <div className="bg-[#2A2A2A] rounded-[20px] relative flex items-center w-full">
                <img src={Kaspa} alt="Kaspa" className="w-[55px]" />
                <input
                  type="text"
                  value={calculateProfit()}
                  readOnly
                  className="w-full text-white/80 pr-4 py-4 outline-none font-black text-3xl bg-transparent"
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
          className={`w-full font-Onest font-semibold rounded-3xl text-lg  ${
            gameMode === "Auto" && isAutoBetting
              ? "bg-red-500 hover:bg-red-600"
              : "bg-[#444] hover:bg-[#6fc7ba]/90"
          } text-white/80 font-bold py-7`}
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
            "Start the Game"
          )}
        </Button>
      </div>
    );
  },
);

export default function DieRollGame() {
  const navigate = useNavigate();
  const { isAuthenticated, onSiteBalance } = useWalletStore();
  const {
    isConnected,
    rollResult,
    sessionData,
    gameSessionError,
    serverSeedHash,
    serverSeed,
    initializeGame,
    placeBet,
    startSession,
  } = useDicerollStore();

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
  const [betAmount, setBetAmount] = useState<string>("10");

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
  const [diceAnimationPhase, setDiceAnimationPhase] = useState<
    "initial" | "rolling" | "result"
  >("initial");

  // Add state for the bet details modal
  const [selectedBet, setSelectedBet] = useState<RollHistory | null>(null);

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

    // Extract roll number and server seed from result
    let roll: number;
    console.log("rollResult", rollResult);

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
    const currentClientSeed = clientSeed;

    const isWin =
      currentCondition === "OVER"
        ? roll >= currentTarget
        : roll <= currentTarget;
    const multiplier = calculateMultiplier(currentCondition, currentTarget);
    const profit = isWin
      ? parseFloat(currentBetAmount) * multiplier - parseFloat(currentBetAmount)
      : -parseFloat(currentBetAmount);

    const result = {
      roll,
      multiplier,
      profit,
      timestamp: Date.now(),
      clientSeed: currentClientSeed,
      serverSeed: serverSeed || undefined,
      serverSeedHash: serverSeedHash || "",
      target: currentTarget,
      condition: currentCondition,
    };

    console.log("result", result);

    // Set the roll value for the animation and immediately show result
    setLastRollValue(roll);
    setShowRollAnimation(true);

    // Immediately show result instead of waiting for animation
    setIsRolling(false);
    setDiceAnimationPhase("result");

    // Keep the animation visible - don't hide it
    // The animation remains visible until next roll

    setRollHistory((prev) => [result, ...prev]);

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
  }, [serverSeed]);

  // Handle auto bet result and continue or stop based on settings
  const handleAutoBetResult = (isWin: boolean, profit: number) => {
    console.log("handleAutoBetResult", isWin, profit);
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
    audio.volume = 0.2;

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
    setDiceAnimationPhase("rolling");

    // Play a random dice sound when the bet is placed
    playRandomDiceSound();

    try {
      // Start a new session before placing the bet
      startSession();

      const betData = DieRollBetType.parse({
        client_seed: clientSeed,
        amount: kasToSompi(betAmount).toString(),
        condition,
        target: targetNumber,
      });

      placeBet(betData);
    } catch (error) {
      console.log("error", error);
      setIsRolling(false);
      setDiceAnimationPhase("initial");
      if (isAutoBetting) {
        stopAutoBet();
      }
      toast.error("Failed to place bet");
    }
  };

  // Add this function to play the click sound
  const playClickSound = () => {
    const audio = new Audio("/dice-sounds/click.wav");
    audio.volume = 0.3;
    audio.play().catch((error) => {
      console.error("Error playing click sound:", error);
    });
  };

  // Update the handleSliderPosition function to play sound when slider moves
  const handleSliderPosition = useCallback(
    (e: MouseEvent) => {
      if (!sliderRef.current) return;

      const rect = sliderRef.current.getBoundingClientRect();
      let percentage = ((e.clientX - rect.left) / rect.width) * 100;

      // Clamp between 1 and 98
      percentage = Math.max(1, Math.min(98, percentage));

      const newValue = Math.round(percentage);

      // Only play sound and update if the value actually changed
      if (newValue !== targetNumber) {
        setTargetNumber(newValue);
      }
      if (newValue % 4 == 1 && newValue !== targetNumber) {
        playClickSound();
      }
    },
    [targetNumber],
  );

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

    document.addEventListener("mousedown", handleMouseDown);
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);

    return () => {
      document.removeEventListener("mousedown", handleMouseDown);
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [handleSliderPosition]);

  const calculateMultiplier = (
    inputCondition: "OVER" | "UNDER" = condition,
    inputTarget: number = targetNumber,
    houseEdge: number = 2,
  ): number => {
    // Validate inputs
    if (inputTarget < 1 || inputTarget > 99) {
      throw new Error("Target must be between 1 and 99");
    }
    if (houseEdge < 0 || houseEdge > 100) {
      throw new Error("House edge must be between 0 and 100");
    }

    // Calculate win probability
    const winProbability =
      inputCondition === "OVER"
        ? (100 - inputTarget) / 100 // Probability of rolling > target
        : inputTarget / 100; // Probability of rolling ≤ target

    // Calculate fair multiplier (without house edge)
    const fairMultiplier = 1 / winProbability;

    // Apply house edge
    const multiplierWithEdge = fairMultiplier * (1 - houseEdge / 100);

    // Return multiplier with 4 decimal places
    return multiplierWithEdge;
  };

  const calculateWinChance = () => {
    return condition === "OVER"
      ? (100 - targetNumber).toFixed(4)
      : targetNumber.toFixed(4);
  };

  // Calculate estimated profit on win
  const calculateProfit = () => {
    if (!betAmount || parseFloat(betAmount) <= 0) return "0.00000000";
    const mult = calculateMultiplier();
    return (parseFloat(betAmount) * mult - parseFloat(betAmount)).toFixed(8);
  };

  // Inject custom animations
  useEffect(() => {
    // Check if the style element already exists
    if (!document.getElementById("dice-roll-animations")) {
      const styleElement = document.createElement("style");
      styleElement.id = "dice-roll-animations";
      styleElement.textContent = customAnimations;
      document.head.appendChild(styleElement);
    }

    return () => {
      // Cleanup on component unmount
      const styleElement = document.getElementById("dice-roll-animations");
      if (styleElement) {
        document.head.removeChild(styleElement);
      }
    };
  }, []);

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

  // Game stats UI
  const GameStats = () => (
    <div className="grid grid-cols-3 gap-3 bg-[#2a2627] rounded-3xl py-4 px-6 font-bold font-Onest uppercase">
      <div className="space-y-1">
        <div className="text-white/70 text-xs ">Multiplier</div>
        <div className="flex items-center">
          <span className="text-white text-lg font-semibold">
            {calculateMultiplier().toFixed(4)}
          </span>
          <span className="text-white/70 ml-1">×</span>
        </div>
      </div>
      <div className="space-y-1">
        <div className="text-white/70 text-xs">Roll {condition}</div>
        <div className="flex items-center">
          <span className="text-white text-lg font-semibold">
            {targetNumber}
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

  // Update the BetHistoryBubbles component to show server seed info
  const BetHistoryBubbles = () => {
    // Get all bets
    const recentBets = rollHistory;

    return (
      <div className="flex justify-start gap-2 mb-4 overflow-x-hidden w-full">
        {recentBets.map((bet, index) => {
          const isWin =
            bet.condition === "OVER"
              ? bet.roll >= bet.target
              : bet.roll <= bet.target;

          return (
            <div
              key={index}
              className="relative group"
              onClick={() => setSelectedBet(bet)}
            >
              <div
                className={`min-w-12 h-12 aspect-square rounded-full flex items-center justify-center text-black font-bold 
                ${isWin ? "bg-[#6fc7ba]" : "bg-red-500"} 
                cursor-pointer hover:opacity-90 transition-opacity`}
              >
                {bet.roll}
              </div>

              {/* Tooltip showing server seed */}
              {bet.serverSeed && (
                <div className="absolute left-1/2 -translate-x-1/2 -top-10 bg-black/90 text-white text-xs p-1 rounded w-28 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20 text-center truncate">
                  Seed: {bet.serverSeed.substring(0, 8)}...
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  // Update the BetDetailsModal to include game hash calculation

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
          </div>

          {/* Add Roll Display to mobile view */}
          <div className="flex items-center justify-center mb-4">
            {isRolling || diceAnimationPhase === "rolling" ? (
              <div className="relative flex flex-col items-center">
                <div className="text-4xl font-bold text-[#6fc7ba] mb-2">
                  <Icon
                    icon="ph:dice-five-fill"
                    className="h-16 w-16 animate-diceRoll"
                  />
                </div>
                <div className="text-white/70 text-xs animate-pulse">
                  Rolling dice...
                </div>
              </div>
            ) : diceAnimationPhase === "result" && lastRollValue !== null ? (
              <div className="relative animate-instantAppear">
                <div
                  className={`text-3xl font-bold relative flex items-center justify-center w-20 h-20 ${
                    (condition === "OVER" && lastRollValue >= targetNumber) ||
                    (condition === "UNDER" && lastRollValue <= targetNumber)
                      ? "text-white"
                      : "text-white"
                  }`}
                >
                  <div
                    className={`absolute inset-0 rounded-full aspect-square ${
                      (condition === "OVER" && lastRollValue >= targetNumber) ||
                      (condition === "UNDER" && lastRollValue <= targetNumber)
                        ? "bg-[#6fc7ba]/80 border-2 border-[#6fc7ba]"
                        : "bg-red-500/80 border-2 border-red-500"
                    }`}
                  ></div>
                  <div className="relative z-10">{lastRollValue}</div>
                </div>
              </div>
            ) : rollHistory.length > 0 ? (
              <div className="relative">
                <div
                  className={`text-3xl font-bold relative flex items-center justify-center w-20 h-20 ${
                    (rollHistory[0].condition === "OVER" &&
                      rollHistory[0].roll >= rollHistory[0].target) ||
                    (rollHistory[0].condition === "UNDER" &&
                      rollHistory[0].roll <= rollHistory[0].target)
                      ? "text-white"
                      : "text-white"
                  }`}
                >
                  <div
                    className={`absolute inset-0 rounded-full aspect-square ${
                      (rollHistory[0].condition === "OVER" &&
                        rollHistory[0].roll >= rollHistory[0].target) ||
                      (rollHistory[0].condition === "UNDER" &&
                        rollHistory[0].roll <= rollHistory[0].target)
                        ? "bg-[#6fc7ba]/80 border-2 border-[#6fc7ba]"
                        : "bg-red-500/80 border-2 border-red-500"
                    }`}
                  ></div>
                  <div className="relative z-10">{rollHistory[0].roll}</div>
                </div>
              </div>
            ) : (
              <div className="text-3xl font-bold text-white">?</div>
            )}
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
                    className="absolute z-20"
                    style={{
                      left: `calc(${lastRollValue}% - 8px)`,
                      top: "-28px",
                    }}
                  >
                    <div
                      className={`transform translate-y-1 ${
                        (condition === "OVER" &&
                          lastRollValue >= targetNumber) ||
                        (condition === "UNDER" && lastRollValue <= targetNumber)
                          ? "text-[#6fc7ba]"
                          : "text-red-500"
                      }`}
                    >
                      <Icon
                        icon="mdi:arrow-down-bold"
                        className="h-8 w-8 animate-bounce"
                      />
                    </div>
                    <div className="absolute -top-7 left-1/2 -translate-x-1/2  text-white text-xs py-1 px-2 rounded whitespace-nowrap">
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
          <BetControls
            onSiteBalance={onSiteBalance}
            betAmount={betAmount}
            setBetAmount={setBetAmount}
            gameMode={gameMode}
            isAutoBetting={isAutoBetting}
            isRolling={isRolling}
            autoBetSettings={autoBetSettings}
            setAutoBetSettings={setAutoBetSettings}
            startAutoBet={startAutoBet}
            stopAutoBet={stopAutoBet}
            handleRoll={handleRoll}
            calculateProfit={calculateProfit}
          />
        </div>
      </div>

      {/* Desktop View */}
      <div className="hidden lg:flex h-full max-h-full font-Onest">
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
          </div>

          <BetControls
            onSiteBalance={onSiteBalance}
            betAmount={betAmount}
            setBetAmount={setBetAmount}
            gameMode={gameMode}
            isAutoBetting={isAutoBetting}
            isRolling={isRolling}
            autoBetSettings={autoBetSettings}
            setAutoBetSettings={setAutoBetSettings}
            startAutoBet={startAutoBet}
            stopAutoBet={stopAutoBet}
            handleRoll={handleRoll}
            calculateProfit={calculateProfit}
          />

          <div className="mt-auto text-right">
            <ProvablyFair
              sessionId={sessionData?.sessionId ?? ""}
              clientSeed={clientSeed}
              setClientSeed={setClientSeed}
              serverSeedHash={serverSeedHash ?? ""}
            />
          </div>
        </div>

        <div className="w-2/3 p-4 flex flex-col">
          {/* Bet History Bubbles */}
          {rollHistory.length > 0 && <BetHistoryBubbles />}

          {/* Roll Display */}
          <div className="flex-1 flex items-center justify-center">
            {isRolling || diceAnimationPhase === "rolling" ? (
              <div className="relative flex flex-col items-center">
                <div className="text-4xl font-bold text-[#6fc7ba] mb-2">
                  <Icon
                    icon="ph:dice-five-fill"
                    className="h-20 w-20 animate-diceRoll"
                  />
                </div>
              </div>
            ) : diceAnimationPhase === "result" && lastRollValue !== null ? (
              <div className="relative animate-instantAppear">
                <div
                  className={`text-6xl font-bold relative flex items-center justify-center w-32 h-32 ${
                    (condition === "OVER" && lastRollValue >= targetNumber) ||
                    (condition === "UNDER" && lastRollValue <= targetNumber)
                      ? "text-white"
                      : "text-white"
                  }`}
                >
                  <div
                    className={`absolute inset-0 rounded-full aspect-square ${
                      (condition === "OVER" && lastRollValue >= targetNumber) ||
                      (condition === "UNDER" && lastRollValue <= targetNumber)
                        ? "bg-[#6fc7ba]/80 "
                        : "bg-red-500/80"
                    }`}
                  ></div>
                  <div className="relative z-10">{lastRollValue}</div>
                </div>
              </div>
            ) : rollHistory.length > 0 ? (
              <div className="relative">
                <div
                  className={`text-6xl font-bold relative flex items-center justify-center w-32 h-32 ${
                    (rollHistory[0].condition === "OVER" &&
                      rollHistory[0].roll >= rollHistory[0].target) ||
                    (rollHistory[0].condition === "UNDER" &&
                      rollHistory[0].roll <= rollHistory[0].target)
                      ? "text-white"
                      : "text-white"
                  }`}
                >
                  <div
                    className={`absolute inset-0 rounded-full aspect-square ${
                      (rollHistory[0].condition === "OVER" &&
                        rollHistory[0].roll >= rollHistory[0].target) ||
                      (rollHistory[0].condition === "UNDER" &&
                        rollHistory[0].roll <= rollHistory[0].target)
                        ? "bg-[#6fc7ba]/80 border-2 border-[#6fc7ba]"
                        : "bg-red-500/80 border-2 border-red-500"
                    }`}
                  ></div>
                  <div className="relative z-10">{rollHistory[0].roll}</div>
                </div>
              </div>
            ) : (
              <div className="text-6xl font-bold text-white">?</div>
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
                className="absolute w-full h-3 rounded-full top-10 cursor-pointer"
                style={{
                  background: `linear-gradient(${condition === "OVER" ? 90 : 270}deg, rgba(251,44,54,1) 0%, rgba(111,199,186,1) 100%)`,
                }}
              >
                {/* Slider Thumb */}
                <div
                  className="absolute top-1/2 -translate-y-1/2 bg-[#6fc7ba] w-8 h-8 flex items-center justify-center rounded-full cursor-pointer z-10 shadow-md"
                  style={{ left: `calc(${targetNumber}% - 16px)` }}
                ></div>

                {/* Roll Result Indicator */}
                {showRollAnimation && lastRollValue !== null && (
                  <div
                    className="absolute z-20"
                    style={{
                      left: `calc(${lastRollValue}% - 8px)`,
                      top: "-28px",
                    }}
                  >
                    <div
                      className={`transform translate-y-1 ${
                        (condition === "OVER" &&
                          lastRollValue >= targetNumber) ||
                        (condition === "UNDER" && lastRollValue <= targetNumber)
                          ? "text-[#6fc7ba]"
                          : "text-red-500"
                      }`}
                    >
                      <Icon
                        icon="mdi:arrow-down-bold"
                        className="h-8 w-8 animate-bounce"
                      />
                    </div>
                    <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-black/20 text-white text-xs py-1 px-2 rounded whitespace-nowrap">
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

      {/* Bet Details Modal */}
      {selectedBet && (
        <BetDetailsModal
          selectedBet={selectedBet}
          setSelectedBet={setSelectedBet}
        />
      )}
    </div>
  );
}
