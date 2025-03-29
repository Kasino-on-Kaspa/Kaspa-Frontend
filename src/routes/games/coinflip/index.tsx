import { createFileRoute } from "@tanstack/react-router";
import CoinflipPage from "@/pages/CoinflipPage";

export const Route = createFileRoute("/games/coinflip/")({
  component: CoinflipPage,
});
