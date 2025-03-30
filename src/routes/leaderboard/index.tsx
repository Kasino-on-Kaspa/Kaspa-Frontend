import { createFileRoute } from "@tanstack/react-router";
import LeaderboardPage from "@/pages/leaderboard";

export const Route = createFileRoute("/leaderboard/")({
  component: LeaderboardPage,
});
