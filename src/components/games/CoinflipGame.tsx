import useCoinflipStore from "@/store/coinflipStore";
import { useEffect, useState } from "react";
import { Icon } from "@iconify/react";
import { Button } from "../ui/button";
import { Dialog, DialogContent, DialogTrigger } from "../ui/dialog";
import CoinFlipBet from "./CoinFlipBet";
import headsCoin from "@/assets/games/coinflip/Component 1.svg";
import tailsCoin from "@/assets/games/coinflip/Component 3.svg";
import headsGif from "@/assets/games/coinflip/Heads.gif";
import tailsGif from "@/assets/games/coinflip/Tails.gif";
import useWalletStore from "@/store/walletStore";
import { useRouter } from "@tanstack/react-router";
import { toast } from "sonner";

export default function CoinflipGame() {
  const {
    initializeGame,
    createBet,
    flipCoin,
    sessionNext,
    isConnected,
    flipResult,
    sessionData,
    gameState,
    serverSeedHash,
    gameSessionError,
    sessionCleanup,
    setSelectedSide,
    selectedSide,
  } = useCoinflipStore();

  const { isAuthenticated } = useWalletStore();

  const router = useRouter();

  const [betAmount, setBetAmount] = useState<string>("10");
  const [clientSeed, setClientSeed] = useState<string>("");
  const [isFlipping, setIsFlipping] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [gameEnded, setGameEnded] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [currentGif, setCurrentGif] = useState<string | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      toast.error("Please connect your wallet to play");
      router.navigate({ to: "/" });
    }
  }, [isAuthenticated, router]);

  // Handle existing session on mount
  useEffect(() => {
    if (sessionData?.clientGameData) {
      setHasStarted(true);
      setClientSeed(sessionData.clientGameData);
      // Only set selectedSide if it's a valid value
      if (
        sessionData.clientGameData === "HEADS" ||
        sessionData.clientGameData === "TAILS"
      ) {
        setSelectedSide(sessionData.clientGameData);
      }
    }
  }, [sessionData, setSelectedSide]);

  const handleStartGame = () => {
    if (gameState === "END") {
      sessionCleanup();
    }
    setHasStarted(true);
    setGameEnded(false);
    initializeGame();
    setClientSeed(Math.random().toString(36).substring(2, 15));
  };

  const handleCreateBet = () => {
    if (!betAmount) return;
    createBet(clientSeed, betAmount);
  };

  const handleFlip = () => {
    if (!selectedSide) return;
    setIsFlipping(true);
    flipCoin(selectedSide);
  };

  const handleNext = async (option: "CASHOUT" | "CONTINUE") => {
    if (option === "CASHOUT") {
      setGameEnded(true);
      setBetAmount("10");
      setClientSeed(Math.random().toString(36).substring(2, 15));
    } else {
      // For CONTINUE, reset all animation and result states first
      setShowResult(false);
      setIsAnimating(false);
      setCurrentGif(null);
      setIsFlipping(false);
      // Clear the flip result by setting it to null in the store
      await sessionNext(option);
    }
    sessionNext(option);
  };

  // Handle flip result with animation
  useEffect(() => {
    if (flipResult && isFlipping) {
      console.log("Flip Result Received:", flipResult);
      setIsFlipping(true);
      setIsAnimating(true);
      const selectedGif = flipResult === "HEADS" ? headsGif : tailsGif;
      console.log("Selected GIF:", selectedGif);
      setCurrentGif(selectedGif);

      // Wait for GIF to complete one cycle (1 second)
      const gifTimer = setTimeout(() => {
        setShowResult(true);
        const selectedCoin = flipResult === "HEADS" ? headsCoin : tailsCoin;
        console.log("Selected Static Coin:", selectedCoin);
        setCurrentGif(selectedCoin);

        // Additional delay to show the final result
        const resultTimer = setTimeout(() => {
          setIsFlipping(false);
          setShowResult(false);
          setIsAnimating(false);
          // If player lost, end the game
          if (flipResult !== selectedSide) {
            setGameEnded(true);
          }
        }, 800); // Increased from 200ms to 800ms to show result longer

        return () => clearTimeout(resultTimer);
      }, 1000); // Keeping GIF timing at 1 second

      return () => clearTimeout(gifTimer);
    }
  }, [flipResult, selectedSide, isFlipping]);

  if (gameState === "TIMEOUT") {
    return (
      <div className="flex flex-col items-center justify-center p-8">
        <div className="bg-[#2A2A2A] rounded-xl p-8 text-center space-y-4">
          <Icon
            icon="ph:clock-fill"
            className="text-6xl text-[#6fc7ba] mx-auto"
          />
          <h2 className="text-xl font-bold text-white">Game Timeout</h2>
          <p className="text-sm text-white/70">
            The game session has timed out. Please reconnect to continue
            playing.
          </p>
          <Button
            className="bg-[#6fc7ba] text-[#333] hover:bg-[#6fc7ba]/90 px-8 py-6 text-lg"
            onClick={handleStartGame}
          >
            Reconnect
          </Button>
        </div>
      </div>
    );
  }

  // If there's an existing session, skip the start screen
  if (!hasStarted && !sessionData) {
    return (
      <div className="flex flex-col items-center justify-center p-8">
        <div className="bg-[#2A2A2A] rounded-xl p-8 text-center space-y-4">
          <Icon
            icon="ph:coin-fill"
            className="text-6xl text-[#6fc7ba] mx-auto"
          />
          <h2 className="text-xl font-bold text-white">Coinflip Game</h2>
          <p className="text-sm text-white/70">
            Test your luck with a flip of a coin!
          </p>
          <Button
            className="bg-[#6fc7ba] text-[#333] hover:bg-[#6fc7ba]/90 px-8 py-6 text-lg"
            onClick={handleStartGame}
          >
            Play Now
          </Button>
        </div>
      </div>
    );
  }

  if (!isConnected || gameSessionError) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-white/70">
        <Icon
          icon="ph:warning-circle-fill"
          className="text-4xl mb-4 text-[#6fc7ba]"
        />
        <p className="text-sm">
          {gameSessionError ||
            "Failed to connect to game server. Please try again."}
        </p>
        <Button
          className="mt-4 bg-white/10 text-white hover:bg-white/20"
          onClick={handleStartGame}
        >
          Try Again
        </Button>
      </div>
    );
  }

  if (gameState === "END" && !isAnimating) {
    const isWinner = flipResult && selectedSide && flipResult === selectedSide;
    console.log("Game End State:", { flipResult, selectedSide, isWinner });
    return (
      <div className="flex flex-col items-center justify-center p-8 h-full">
        <div className="bg-[#2A2A2A] rounded-xl p-8 text-center space-y-4">
          <Icon
            icon={isWinner ? "ph:trophy-fill" : "ph:x-circle-fill"}
            className={`text-6xl mx-auto ${isWinner ? "text-[#6fc7ba]" : "text-red-500"}`}
          />
          <h2 className="text-4xl font-bold text-white">
            {isWinner ? "Congratulations!" : "Game Over"}
          </h2>
          <p className="text-sm text-white/70">
            {isWinner
              ? "You've decided to cash out. Thanks for playing!"
              : "Better luck next time!"}
          </p>
          <Button
            className="bg-[#6fc7ba] rounded-full text-[#333] hover:bg-[#6fc7ba]/90 px-8 py-6 text-base"
            onClick={handleStartGame}
          >
            Play Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full">
      <div className="flex flex-col lg:flex-row gap-4 h-full">
        {/* Betting Section */}
        <div className="lg:border-r lg:pr-4 border-white/10 p-4 h-full">
          <div className="flex justify-between w-full lg:w-[350px] mb-3 border border-white/10 bg-[#444] rounded-xl p-2">
            <div className="w-fit flex items-center gap-2">
              <Icon icon="ph:check-circle-fill" className="text-green-500" />
              <p className="text-[10px] md:text-xs font-Onest font-black text-green-500">
                {isConnected ? "CONNECTED" : "DISCONNECTED"}
              </p>
            </div>
            <Dialog>
              <DialogTrigger asChild>
                <div className="w-fit flex items-center gap-2 cursor-pointer">
                  <Icon icon="mdi:verified" className="text-green-500" />
                  <p className="text-[10px] md:text-xs font-Onest font-black text-green-500">
                    PROVABLY FAIR
                  </p>
                </div>
              </DialogTrigger>
              <DialogContent className="bg-[#2A2A2A] border border-white/10 text-white rounded-3xl w-[90vw] lg:w-[350px] p-2">
                <div className="space-y-4">
                  <div className="bg-[#444] rounded-2xl p-2  space-y-3">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Icon
                          icon="mynaui:hash-waves-solid"
                          className="text-white/60"
                        />
                        <p className="text-xs text-white/60  font-Onest font-black">
                          SERVER SEED HASH
                        </p>
                      </div>
                      <div className="bg-[#2A2A2A] rounded-xl p-2">
                        <p className="text-xs text-white/80 font-mono p-2 break-all">
                          {serverSeedHash || "Not available"}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Icon
                          icon="solar:gamepad-bold"
                          className="text-white/60"
                        />
                        <p className="text-xs text-white/60 font-Onest font-black">
                          SESSION ID
                        </p>
                      </div>
                      <div className="bg-[#2A2A2A] rounded-xl p-2">
                        <p className="text-xs text-white/80 font-mono break-all p-2">
                          {sessionData?.sessionId || "Not available"}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Icon
                          icon="iconamoon:playlist-shuffle-bold"
                          className="text-white/60"
                        />
                        <p className="text-xs text-white/60 font-Onest font-black">
                          CLIENT SEED
                        </p>
                      </div>
                      <div className="bg-[#2A2A2A] rounded-xl p-2">
                        <input
                          type="text"
                          value={clientSeed}
                          onChange={(e) => setClientSeed(e.target.value)}
                          className="w-full bg-transparent text-xs text-white/80 font-mono outline-none p-2"
                          placeholder="Enter client seed"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="text-xs text-white/60 px-2 font-Onest pb-2">
                    <p className="mb-2">How it works:</p>
                    <ul className="list-disc list-inside space-y-1">
                      <li>Server seed is generated before each game</li>
                      <li>Client seed is generated by the player</li>
                      <li>Both seeds are combined to determine the outcome</li>
                      <li>Results can be verified using the seed hash</li>
                    </ul>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
          <CoinFlipBet
            handleCreateBet={handleCreateBet}
            betAmount={betAmount}
            setBetAmount={setBetAmount}
          />
        </div>

        {/* Game Section */}
        <div className="flex-1">
          {/* Coin Selection */}
          {sessionData?.sessionId &&
            gameState === "FLIP_CHOICE" &&
            !isFlipping && (
              <div className="flex-1 flex flex-col items-center justify-center h-full">
                <div className="flex flex-col sm:flex-row justify-center items-center gap-4 sm:gap-10">
                  <Button
                    className={`w-24 h-24 sm:w-32 sm:h-32 rounded-full ${
                      selectedSide === "HEADS"
                        ? "border border-[#6fc7ba] border-dashed"
                        : "bg-white/5 text-white/70"
                    } flex flex-col items-center justify-center transition-colors`}
                    onClick={() => setSelectedSide("HEADS")}
                  >
                    <img
                      src={headsCoin}
                      alt="Heads"
                      className="w-full h-full"
                    />
                  </Button>
                  <Button
                    className={`w-24 h-24 sm:w-32 sm:h-32 rounded-full ${
                      selectedSide === "TAILS"
                        ? "border border-[#6fc7ba] border-dashed bg-transparent"
                        : "bg-white/5 text-white/70"
                    } flex flex-col items-center justify-center transition-colors`}
                    onClick={() => setSelectedSide("TAILS")}
                  >
                    <img
                      src={tailsCoin}
                      alt="Tails"
                      className="w-full h-full"
                    />
                  </Button>
                </div>
                <div className="flex justify-center gap-4 mt-4">
                  <button
                    onClick={handleFlip}
                    className="bg-[#6fc7ba] text-[#333] hover:bg-[#6fc7ba]/90 py-3 sm:py-4 px-4 sm:px-6 transition-colors tracking-tight font-medium rounded-full text-sm sm:text-base"
                  >
                    Flip Coin
                  </button>
                </div>
              </div>
            )}

          {/* Flipping Animation */}
          {isFlipping && (
            <div className="flex-1 flex flex-col items-center justify-center h-full">
              <div className="flex justify-center items-center">
                <div className="w-auto h-full relative">
                  {currentGif && (
                    <img
                      src={currentGif}
                      alt={flipResult || "Flipping"}
                      className={`w-[200px] sm:w-[300px] h-full ${showResult ? "animate-pause" : ""}`}
                    />
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Next Choice Options */}
          {gameState === "NEXT_CHOICE" && !isFlipping && (
            <div className="flex-1 flex flex-col items-center justify-center h-full">
              <h3 className="text-sm font-medium text-white/90 text-center mb-4">
                Choose Your Next Move
              </h3>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <button
                  onClick={() => handleNext("CASHOUT")}
                  className="bg-[#6fc7ba] text-[#333] hover:bg-[#6fc7ba]/90 px-6 sm:px-8 py-4 sm:py-6 text-base sm:text-lg rounded-full w-full sm:w-auto"
                >
                  Cash Out
                </button>
                <button
                  onClick={() => handleNext("CONTINUE")}
                  className="bg-[#6fc7ba] text-[#333] hover:bg-[#6fc7ba]/90 px-6 sm:px-8 py-4 sm:py-6 text-base sm:text-lg rounded-full w-full sm:w-auto"
                >
                  Continue
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
