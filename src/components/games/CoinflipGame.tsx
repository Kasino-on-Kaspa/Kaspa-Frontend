import useCoinflipStore from "@/store/coinflipStore";
import { useEffect, useState } from "react";
import { Icon } from "@iconify/react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "../ui/button";
import CoinFlipBet from "./CoinFlipBet";

import ProvablyFair from "./ProvablyFair";
import { Input } from "../ui/input";

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
    serverSeed,
    gameSessionError,
    sessionCleanup,
  } = useCoinflipStore();

  const [betAmount, setBetAmount] = useState<string>("10");
  const [clientSeed, setClientSeed] = useState<string>("");
  const [selectedSide, setSelectedSide] = useState<"HEADS" | "TAILS">("HEADS");
  const [isFlipping, setIsFlipping] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [gameEnded, setGameEnded] = useState(false);

  // Handle existing session on mount
  useEffect(() => {
    if (sessionData) {
      setHasStarted(true);
      setClientSeed(sessionData.clientGameData || "");
      setSelectedSide(sessionData.clientGameData as "HEADS" | "TAILS");
    }
  }, [sessionData]);

  const handleStartGame = () => {
    if (gameState === "END") {
      sessionCleanup();
    }
    setHasStarted(true);
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

  const handleNext = (option: "CASHOUT" | "CONTINUE") => {
    if (option === "CASHOUT") {
      setGameEnded(true);
      setBetAmount("10");
      setClientSeed(Math.random().toString(36).substring(2, 15));
    }
    sessionNext(option);
  };

  useEffect(() => {
    if (flipResult) {
      setTimeout(() => {
        setIsFlipping(false);
        // If player lost, end the game
        if (flipResult !== selectedSide) {
          setGameEnded(true);
        }
      }, 3000);
    }
  }, [flipResult, selectedSide]);

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

  if (gameState === "END") {
    return (
      <div className="flex flex-col items-center justify-center p-8">
        <div className="bg-[#2A2A2A] rounded-xl p-8 text-center space-y-4">
          <Icon
            icon={
              flipResult === selectedSide
                ? "ph:trophy-fill"
                : "ph:x-circle-fill"
            }
            className={`text-6xl mx-auto ${flipResult === selectedSide ? "text-[#6fc7ba]" : "text-red-500"}`}
          />
          <h2 className="text-xl font-bold text-white">
            {flipResult === selectedSide ? "Congratulations!" : "Game Over"}
          </h2>
          <p className="text-sm text-white/70">
            {flipResult === selectedSide
              ? "You've decided to cash out. Thanks for playing!"
              : "Better luck next time!"}
          </p>
          <Button
            className="bg-[#6fc7ba] text-[#333] hover:bg-[#6fc7ba]/90 px-8 py-6 text-lg"
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

            <ProvablyFair
              sessionId={sessionData?.sessionId ?? ""}
              clientSeed={clientSeed}
              setClientSeed={setClientSeed}
              serverSeedHash={serverSeed ?? ""}
            />
          </div>
          <CoinFlipBet
            handleCreateBet={handleCreateBet}
            betAmount={betAmount}
            setBetAmount={setBetAmount}
          />
        </div>
      </div>

      {/* Game Controls */}
      <div className="bg-[#2A2A2A] rounded-xl p-4 space-y-4">
        {/* Betting Controls - Only show when no session */}
        {gameState === null && (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-white/60 mb-1 block">
                Bet Amount
              </label>
              <Input
                type="number"
                value={betAmount}
                onChange={(e) => setBetAmount(e.target.value)}
                className="bg-white/5 border-white/10 text-white"
                placeholder="Enter bet amount"
                min="1"
              />
            </div>
            <div>
              <label className="text-xs text-white/60 mb-1 block">
                Client Seed
              </label>
              <Input
                value={clientSeed}
                onChange={(e) => setClientSeed(e.target.value)}
                className="bg-white/5 border-white/10 text-white"
                placeholder="Enter client seed"
              />
            </div>
          </div>
        )}

        {/* Coin Selection - Only show after placing bet */}
        {sessionData?.sessionId &&
          gameState === "FLIP_CHOICE" &&
          !isFlipping && (
            <>
              <h3 className="text-sm font-medium text-white/90 text-center mb-2">
                Choose Your Side
              </h3>
              <div className="flex justify-center gap-4">
                <Button
                  className={`w-32 h-32 rounded-full ${
                    selectedSide === "HEADS"
                      ? "bg-[#6fc7ba] text-[#333]"
                      : "bg-white/5 text-white/70"
                  } flex flex-col items-center justify-center transition-colors`}
                  onClick={() => setSelectedSide("HEADS")}
                >
                  <Icon icon="ph:coin-fill" className="text-4xl mb-2" />
                  <span className="text-sm font-medium">HEADS</span>
                </Button>
                <Button
                  className={`w-32 h-32 rounded-full ${
                    selectedSide === "TAILS"
                      ? "bg-[#6fc7ba] text-[#333]"
                      : "bg-white/5 text-white/70"
                  } flex flex-col items-center justify-center transition-colors`}
                  onClick={() => setSelectedSide("TAILS")}
                >
                  <Icon icon="ph:coin-fill" className="text-4xl mb-2" />
                  <span className="text-sm font-medium">TAILS</span>
                </Button>
              </div>
            </>
          )}

        {/* Action Buttons */}
        <div className="flex justify-center gap-4">
          {gameState === null ? (
            <Button
              className="bg-[#6fc7ba] text-[#333] hover:bg-[#6fc7ba]/90 px-8"
              onClick={handleCreateBet}
              disabled={!betAmount}
            >
              Place Bet
            </Button>
          ) : gameState === "FLIP_CHOICE" && !isFlipping ? (
            <Button
              className="bg-[#6fc7ba] text-[#333] hover:bg-[#6fc7ba]/90 px-8"
              onClick={handleFlip}
            >
              Flip Coin
            </Button>
          ) : gameState === "NEXT_CHOICE" ? (
            <div className="flex gap-4">
              <Button
                className="bg-[#6fc7ba] text-[#333] hover:bg-[#6fc7ba]/90"
                onClick={() => handleNext("CONTINUE")}
              >
                Continue
              </Button>
              <Button
                className="bg-white/10 text-white hover:bg-white/20"
                onClick={() => handleNext("CASHOUT")}
              >
                Cash Out
              </Button>
            </div>
          ) : null}
        </div>
      </div>

      {/* Game Result */}
      <AnimatePresence>
        {isFlipping && (
          <motion.div
            className="flex flex-col items-center justify-center py-8"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
          >
            <motion.div
              className="w-32 h-32 bg-[#6fc7ba] rounded-full flex items-center justify-center"
              animate={{
                rotateX: flipResult ? [0, 1800] : [0, 1800],
                rotateY: flipResult ? [0, 1800] : [0, 1800],
              }}
              transition={{ duration: 3, ease: "easeInOut" }}
            >
              <Icon icon="ph:coin-fill" className="text-6xl text-[#333]" />
            </motion.div>
            {flipResult && (
              <motion.p
                className="text-xl font-bold mt-4 text-white"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 3 }}
              >
                {flipResult}
              </motion.p>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Game Info */}
      {serverSeed && (
        <div className="bg-white/5 rounded-xl p-4">
          <h3 className="text-sm font-medium text-white/90 mb-2">
            Game Information
          </h3>
          <div className="space-y-1">
            <p className="text-xs text-white/60">
              Server Seed: <span className="text-white/90">{serverSeed}</span>
            </p>
            <p className="text-xs text-white/60">
              Client Seed: <span className="text-white/90">{clientSeed}</span>
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
