import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/DataTable";
import { Icon } from "@iconify/react";

export type LuckyWin = {
  player: React.ReactNode;
  payout: number;
  wager: number;
  multiplier: number;
};

export const luckyWinColumns: ColumnDef<LuckyWin>[] = [
  {
    header: "Player",
    accessorKey: "player",
  },
  {
    header: "Payout",
    accessorKey: "payout",
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

export const luckyWinData: LuckyWin[] = [
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

export default function LuckyWinTable() {
  return <DataTable columns={luckyWinColumns} data={luckyWinData} />;
}
