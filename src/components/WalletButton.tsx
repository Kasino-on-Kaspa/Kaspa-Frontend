import useKaspaWallet from "@/hooks/useKaspaWallet";
import { Button } from "./ui/button";
import useWalletStore from "@/store/walletStore";
import { useEffect } from "react";
import { Dialog, DialogTrigger, DialogContent } from "./ui/dialog";
import { formatAddress, formatKAS } from "@/lib/utils";
import Balance from "./Balance";

import { Icon } from "@iconify/react/dist/iconify.js";
import useSocketStore from "@/store/socketStore";

export default function WalletButton() {
  const wallet = useKaspaWallet();

  const { connect, disconnect: socketDisconnect } = useSocketStore();

  const {
    address,
    balance,
    isConnecting,
    isAuthenticated,
    authError,
    setAddress,
    setIsConnecting,
    disconnect,
    authenticate,
    initWallet,
    onSiteBalance,
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
      socketDisconnect();
      disconnect();
      await wallet.disconnect(window.location.origin);
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
    if (isAuthenticated) {
      connect();
    }
  }, [isAuthenticated, connect]);

  return !address ? (
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
        <button className="w-full font-Onest rounded-lg bg-[#2a2a2a]/80 cursor-pointer text-[#333] hover:bg-[#2a2a2a]/90 text-[10px] p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <Icon
                icon="solar:shield-minimalistic-bold"
                className={`text-[12px] ${
                  isAuthenticated ? "text-[#6fc7ba]" : "text-red-400"
                }`}
              />
              <p
                className={`text-xs font-Onest ${
                  isAuthenticated ? "text-[#6fc7ba]" : "text-red-400"
                }`}
              >
                {isAuthenticated ? "Authenticated" : "Unauthenticated"}
              </p>
            </div>
            <div className="flex items-center gap-1">
              <Icon
                icon="material-symbols-light:network-locked"
                className="text-[12px] text-[#6fc7ba]"
              />
              <p className="text-xs font-Onest text-[#6fc7ba]">17ms</p>
            </div>
          </div>
          <div className="flex items-center gap-2 mt-2">
            <p className="text-base tracking-tighter font-light font-Onest text-[#6fc7ba]">
              {balance?.total
                ? formatKAS(balance.total)
                : onSiteBalance?.balance
                  ? formatKAS(Number(onSiteBalance.balance))
                  : "0.00000000"}
              KAS
            </p>
          </div>
        </button>
      </DialogTrigger>
      <DialogContent className="bg-[#2a2627] border border-white/10 text-white rounded-3xl w-[300px] md:w-[400px]">
        <div className="flex gap-2 items-center justify-between -mb-2 mx-1">
          <div className="flex items-center gap-2">
            <Icon
              icon="emojione:full-moon"
              className="text-lg text-[#6fc7ba]"
            />
            <p className="text-sm font-Onest font-extralight tracking-tight text-[#6fc7ba]">
              Callisto Wallet
            </p>
          </div>
          <button
            onClick={() => {
              handleDisconnect();
            }}
            className="w-fit py-1 px-2 rounded-full bg-red-400 cursor-pointer text-[#333] font-Onest hover:bg-red-400/90 text-[10px]"
          >
            Disconnect
          </button>
        </div>
        <Balance
          userBalance={formatKAS(balance?.total || 0)}
          userAddress={address}
        />
        <div className="p-3 bg-white/5 rounded-2xl -mt-2">
          <p className="text-xs font-Onest text-[#6fc7ba] pb-1">
            Wallet Details
          </p>
          <div className="flex items-center gap-2 pb-1">
            <Icon icon="ph:wallet" className="text-xs text-[#6fc7ba]" />
            <p className="text-xs font-Onest text-[#6fc7ba]">Onsite Balance:</p>
            <p className="text-xs font-Onest text-[#6fc7ba]">
              {onSiteBalance?.balance
                ? formatKAS(Number(onSiteBalance.balance))
                : "0.00000000"}
              KAS
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Icon icon="ph:globe-simple" className="text-xs text-[#6fc7ba]" />
            <p className="text-xs font-Onest text-[#6fc7ba]">
              Deposit Address:
            </p>
            <div className="flex items-center gap-1">
              <p className="text-xs font-Onest text-[#6fc7ba]">
                {formatAddress(onSiteBalance?.address || "")}
              </p>
              <button
                className="text-xs font-Onest text-[#6fc7ba]"
                onClick={() => {
                  navigator.clipboard.writeText(onSiteBalance?.address || "");
                }}
              >
                <Icon icon="ph:copy" className="text-xs cursor-pointer" />
              </button>
            </div>
          </div>
        </div>
        <div className="p-3 bg-white/5 rounded-2xl -mt-2">
          <p className="text-xs font-Onest text-[#6fc7ba] pb-1">
            Deposit Kaspa
          </p>
          <div className="flex items-center gap-2 mt-1">
            <input
              type="text"
              placeholder="Enter Amount"
              className="w-full rounded-md bg-white/10  text-[#6fc7ba] text-[12px] h-8 px-2 outline-none"
            />
            <button className="w-fit px-3 rounded-md bg-[#6fc7ba] cursor-pointer text-[#333] hover:bg-[#6fc7ba]/90 text-[10px] h-8">
              Deposit
            </button>
          </div>
          <p className="text-xs font-Onest text-[#6fc7ba] mt-2">
            Max: {formatKAS(balance?.total || 0)}
          </p>
        </div>
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
