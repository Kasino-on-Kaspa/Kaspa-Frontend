import { RollHistory } from "@/types/dieroll";
import sha256 from "crypto-js/sha256";
import Hex from "crypto-js/enc-hex";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";

export default function BetDetailsModal({
  selectedBet,

  setSelectedBet,
}: {
  selectedBet: RollHistory;
  setSelectedBet: (bet: RollHistory | null) => void;
}) {
  if (!selectedBet) return null;

  const isWin =
    selectedBet.condition === "OVER"
      ? selectedBet.roll >= selectedBet.target
      : selectedBet.roll <= selectedBet.target;

  // Calculate the game hash
  const calculateGameHash = () => {
    if (!selectedBet?.serverSeed) return "Server seed not revealed yet";

    const combinedSeed = `${selectedBet.serverSeed}${selectedBet.clientSeed}`;
    return sha256(combinedSeed).toString(Hex);
  };

  const gameHash = calculateGameHash();

  return (
    <Dialog open={!!selectedBet} onOpenChange={() => setSelectedBet(null)}>
      <DialogContent className="bg-[#1a1718] border-[#6fc7ba]/20 text-white max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-[#6fc7ba] flex items-center gap-2">
            <div
              className={`w-6 h-6 rounded-full flex items-center justify-center text-black font-bold text-xs ${
                isWin ? "bg-[#6fc7ba]" : "bg-red-500"
              }`}
            >
              {selectedBet.roll}
            </div>
            <span>{isWin ? "Win" : "Loss"} Details</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm font-medium text-white/70 mb-1">
                Roll Result
              </h3>
              <div className="text-lg font-bold text-white">
                {selectedBet.roll}
              </div>
            </div>
            <div>
              <h3 className="text-sm font-medium text-white/70 mb-1">Target</h3>
              <div className="text-lg font-bold text-white">
                {selectedBet.condition} {selectedBet.target}
              </div>
            </div>
            <div>
              <h3 className="text-sm font-medium text-white/70 mb-1">
                Multiplier
              </h3>
              <div className="text-lg font-bold text-white">
                {selectedBet.multiplier.toFixed(4)}×
              </div>
            </div>
            <div>
              <h3 className="text-sm font-medium text-white/70 mb-1">Profit</h3>
              <div
                className={`text-lg font-bold ${
                  selectedBet.profit >= 0 ? "text-[#6fc7ba]" : "text-red-500"
                }`}
              >
                {selectedBet.profit >= 0 ? "+" : ""}
                {selectedBet.profit.toFixed(8)} KAS
              </div>
            </div>
          </div>

          <div className="border-t border-[#3a3637] pt-4">
            <h3 className="text-sm font-bold text-[#6fc7ba] mb-3">
              Provably Fair Verification
            </h3>

            <div className="space-y-3">
              <div>
                <h4 className="text-sm font-medium text-white/70 mb-1">
                  Client Seed
                </h4>
                <div className="bg-[#2a2627] p-2 rounded text-xs font-mono overflow-x-auto text-white">
                  {selectedBet.clientSeed}
                </div>
              </div>

              <>
                <div>
                  <h4 className="text-sm font-medium text-white/70 mb-1">
                    Server Seed
                  </h4>
                  <div className="bg-[#2a2627] p-2 rounded text-xs font-mono overflow-x-auto text-white">
                    {selectedBet.serverSeed}
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-white/70 mb-1">
                    Game Hash (SHA256)
                  </h4>
                  <div className="bg-[#2a2627] p-2 rounded text-xs font-mono overflow-x-auto text-white">
                    {gameHash}
                  </div>
                  <p className="text-xs text-white/50 mt-1">
                    SHA256(clientSeed + serverSeed)
                  </p>
                </div>
              </>
            </div>

            <div className="mt-4 text-xs text-white/70">
              <p>
                The combination of your client seed and our server seed
                determines the outcome of each bet.
              </p>
              <p className="mt-1">
                You can verify the fairness of this bet by checking these values
                against the roll result.
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
