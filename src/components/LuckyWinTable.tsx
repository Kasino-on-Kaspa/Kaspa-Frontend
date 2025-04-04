import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/DataTable";
import { Icon } from "@iconify/react";
import { CoinFlipWin, DiceRollWin, GameWin } from "@/hooks/useGameWins";
import { formatDate } from "@/lib/utils";

interface LuckyWinTableProps {
  wins: GameWin[];
}

const isCoinFlipWin = (win: GameWin): win is CoinFlipWin => {
  return "playerChoice" in win;
};

export const luckyWinColumns: ColumnDef<GameWin>[] = [
  {
    header: "Player",
    accessorKey: "sessionId",
    cell: ({ row }) => {
      const win = row.original;
      return (
        <div className="flex items-center gap-2">
          <p className="text-xs font-semibold bg-[#6fc7ba]/20 text-[#6fc7ba] px-3 py-1 rounded-full">
            <Icon icon="twemoji:crown" className="text-sm" />
          </p>
          <p className="text-sm">{win.sessionId.slice(0, 8)}...</p>
        </div>
      );
    },
  },
  {
    header: "Details",
    id: "details",
    cell: ({ row }) => {
      const win = row.original;
      console.log("Win data:", win);

      if (isCoinFlipWin(win)) {
        return (
          <div className="text-sm">
            <span className="text-[#6fc7ba]">{win.playerChoice}</span>
            <Icon icon="ph:arrow-right" className="inline mx-1" />
            <span
              className={
                win.result === win.playerChoice
                  ? "text-green-500"
                  : "text-red-500"
              }
            >
              {win.result}
            </span>
            <span className="ml-2 text-[#6fc7ba]">Level {win.level}</span>
          </div>
        );
      }

      const diceWin = win as DiceRollWin;
      const isWin =
        diceWin.condition === "OVER"
          ? diceWin.result > diceWin.target
          : diceWin.result < diceWin.target;

      return (
        <div className="text-sm">
          <span className="text-[#6fc7ba]">{diceWin.condition}</span>
          <span className="mx-1">{diceWin.target}</span>
          <Icon icon="ph:arrow-right" className="inline mx-1" />
          <span className={isWin ? "text-green-500" : "text-red-500"}>
            {diceWin.result}
          </span>
        </div>
      );
    },
  },
  {
    header: "Multiplier",
    accessorKey: "multiplier",
    cell: ({ row }) => (
      <div className="text-sm font-medium text-[#6fc7ba]">
        {row.original.multiplier}x
      </div>
    ),
  },
  {
    header: "Date",
    accessorKey: "createdAt",
    cell: ({ row }) => (
      <div className="text-sm">{formatDate(row.original.createdAt)}</div>
    ),
  },
];

export default function LuckyWinTable({ wins }: LuckyWinTableProps) {
  return <DataTable columns={luckyWinColumns} data={wins} />;
}
