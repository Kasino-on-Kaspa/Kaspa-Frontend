export type LeaderboardEntry = {
  address: string;
  username: string;
  totalWonAmount: bigint;
  totalBetAmount: bigint;
  betAmountRank: number;
  wonAmountRank: number;
};
