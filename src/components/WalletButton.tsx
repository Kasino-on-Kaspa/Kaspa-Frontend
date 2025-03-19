import useKaspaWallet from "@/hooks/useKaspaWallet";
import { Button } from "./ui/button";
import useWalletStore from "@/store/walletStore";
import { useEffect } from "react";
import { Dialog, DialogTrigger, DialogContent } from "./ui/dialog";
import { formatKAS } from "@/lib/utils";
import Balance from "./Balance";
import { NetworkType } from "@/types/kaspa";
import { Icon } from "@iconify/react/dist/iconify.js";

const networkMap = {
  kaspa_mainnet: "Mainnet",
  kaspa_testnet_10: "TN10",
  kaspa_testnet_11: "TN11",
  kaspa_devnet: "Devnet",
};

export default function WalletButton() {
  const wallet = useKaspaWallet();

  const {
    address,
    balance,
    network,
    isConnecting,
    isAuthenticated,
    authError,
    setAddress,
    setNetwork,
    setIsConnecting,
    disconnect,
    authenticate,
    initWallet,
  } = useWalletStore();

  const handleConnect = async () => {
    if (!wallet) {
      return;
    }

    setIsConnecting(true);
    try {
      await wallet.requestAccounts();
      const accounts = await wallet.getAccounts();

      if (accounts.length > 0) {
        setAddress(accounts[0]);
        await authenticate();
      }
    } catch (error) {
      console.error("Error connecting wallet:", error);
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    if (!wallet) return;
    try {
      await wallet.disconnect(window.location.origin);
      disconnect();
    } catch (error) {
      console.error("Error disconnecting wallet:", error);
    }
  };

  useEffect(() => {
    if (wallet) {
      initWallet(wallet);
    }
  }, [wallet, initWallet]);

  useEffect(() => {
    wallet?.getAccounts().then((accounts) => {
      if (accounts.length > 0) {
        setAddress(accounts[0]);
      }
    });
  }, [network, wallet, setAddress]);

  return !isAuthenticated ? (
    <Button
      onClick={handleConnect}
      disabled={isConnecting}
      className="w-full rounded-md bg-[#6fc7ba] cursor-pointer text-[#333] hover:bg-[#6fc7ba]/90 text-[10px] h-8"
    >
      {isConnecting ? "Connecting..." : "Connect Wallet"}
    </Button>
  ) : (
    <Dialog>
      <DialogTrigger asChild>
        <button className="w-full font-Onest rounded-md bg-[#6fc7ba] cursor-pointer text-[#333] hover:bg-[#6fc7ba]/90 text-[10px] h-8">
          {balance?.total ? formatKAS(balance.total) : "0.00000000"} KAS
        </button>
      </DialogTrigger>
      <DialogContent className="bg-[#2a2627] border border-white/10 text-white rounded-3xl w-[300px] md:w-[400px]">
        <div className="flex gap-2 items-center justify-between -mb-2">
          {network && (
            <div className="flex font-Onest items-center gap-2">
              {Object.keys(networkMap).map((nM) => {
                return (
                  <button
                    key={nM}
                    onClick={() => {
                      setNetwork(nM as NetworkType);
                      wallet?.switchNetwork(nM as NetworkType);
                    }}
                    className="w-fit py-1 px-2 rounded-full bg-[#6fc7ba] cursor-pointer text-[#333] hover:bg-[#6fc7ba]/90 text-[10px]"
                    style={{
                      backgroundColor: network === nM ? "#6fc7ba" : "#353132",
                      color: network === nM ? "#333" : "#fff",
                    }}
                  >
                    {networkMap[nM as keyof typeof networkMap]}
                  </button>
                );
              })}
            </div>
          )}
          <button
            onClick={() => {
              handleDisconnect();
            }}
            className="w-fit py-1 px-2 rounded-full bg-red-400 cursor-pointer text-[#333] text-white/80 font-Onest hover:bg-red-400/90 text-[10px]"
          >
            Disconnect
          </button>
        </div>
        <Balance
          userBalance={formatKAS(balance?.total || "0")}
          userAddress={address}
        />
        {authError && (
          <div className="flex items-center gap-2 px-3 pb-1">
            <Icon
              icon="ph:fingerprint-light"
              className="w-4 h-4 text-red-400"
            />
            <p className="text-red-400 text-xs font-Onest">
              Signature Verification Failed
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
