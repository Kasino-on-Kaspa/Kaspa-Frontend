import { useQuery } from "@tanstack/react-query";

export type DiceRollWin = {
  id: string;
  sessionId: string;
  target: number;
  condition: "OVER" | "UNDER";
  result: number;
  multiplier: number;
  createdAt: string;
};

export type CoinFlipWin = {
  id: string;
  sessionId: string;
  playerChoice: "HEADS" | "TAILS";
  result: "HEADS" | "TAILS";
  level: number;
  multiplier: number;
  createdAt: string;
};

export type GameWin = DiceRollWin | CoinFlipWin;

export type GameWinsResponse = {
  highWins: GameWin[];
  luckyWins: GameWin[];
};

const fetchGameWins = async (gameName: string): Promise<GameWinsResponse> => {
  const response = await fetch(`http://localhost:3000/game-wins/${gameName}`);
  if (!response.ok) {
    throw new Error("Network response was not ok");
  }
  return response.json();
};

export const useGameWins = (gameName: "coinflip" | "dieroll") => {
  return useQuery({
    queryKey: ["gameWins", gameName],
    queryFn: () => fetchGameWins(gameName),
  });
};
