import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/DataTable";
import { Icon } from "@iconify/react";

export type HighWin = {
  player: React.ReactNode;
  payout: number;
  wager: number;
  multiplier: number;
};

export const highWinColumns: ColumnDef<HighWin>[] = [
  {
    header: "Player",
    accessorKey: "player",
  },
  {
    header: "Payout",
    accessorKey:
      "payoutgit clone https://github.com/LazyVim/starter ~/.config/nvim",
  },
  {
    header: "Wager",
    accessorKey: "wager",
  },
  {
    header: "Multiplier",
    accessorKey: "multiplier",
  },
];

export const highWinData: HighWin[] = [
  {
    player: (
      <div className="flex items-center gap-2">
        <p className="text-xs font-semibold bg-[#6fc7ba]/20 text-[#6fc7ba] px-3 py-1 rounded-full">
          <Icon icon="ph:crown-fill" className="text-sm" />
        </p>
        <p>Player 1</p>
      </div>
    ),
    payout: 100,
    wager: 10,
    multiplier: 10,
  },
  {
    player: (
      <div className="flex items-center gap-2">
        <p className="text-xs font-semibold bg-[#6fc7ba]/20 text-[#6fc7ba] px-3 py-1 rounded-full">
          <Icon icon="ph:crown-fill" className="text-sm" />
        </p>
        <p>Player 2</p>
      </div>
    ),
    payout: 100,
    wager: 10,
    multiplier: 10,
  },
  {
    player: (
      <div className="flex items-center gap-2">
        <p className="text-xs font-semibold bg-[#6fc7ba]/20 text-[#6fc7ba] px-3 py-1 rounded-full">
          <Icon icon="ph:crown-fill" className="text-sm" />
        </p>
        <p>Player 3</p>
      </div>
    ),
    payout: 100,
    wager: 10,
    multiplier: 10,
  },
];

export default function HighWinTable() {
  return <DataTable columns={highWinColumns} data={highWinData} />;
}
