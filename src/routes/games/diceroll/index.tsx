import DiceRollPage from "@/pages/DiceRollPage";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/games/diceroll/")({
  component: DiceRollPage,
});
