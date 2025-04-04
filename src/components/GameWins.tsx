import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useGameWins } from "@/hooks/useGameWins";
import HighWinTable from "./HighWinTable";
import LuckyWinTable from "./LuckyWinTable";

interface GameWinsProps {
  gameName: "coinflip" | "dieroll";
}

export default function GameWins({ gameName }: GameWinsProps) {
  const { data, isLoading, error } = useGameWins(gameName);

  if (isLoading) {
    return (
      <div className="w-full h-[200px] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#6fc7ba]"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full h-[200px] flex items-center justify-center text-red-500">
        Error loading game wins
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="bg-[#2A2A2A] rounded-xl p-4">
      <Tabs defaultValue="high-wins" className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-[#333]">
          <TabsTrigger value="high-wins" className="text-[#6fc7ba]">
            High Wins
          </TabsTrigger>
          <TabsTrigger value="lucky-wins" className="text-[#6fc7ba]">
            Lucky Wins
          </TabsTrigger>
        </TabsList>
        <TabsContent value="high-wins">
          <HighWinTable wins={data.highWins} />
        </TabsContent>
        <TabsContent value="lucky-wins">
          <LuckyWinTable wins={data.luckyWins} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
