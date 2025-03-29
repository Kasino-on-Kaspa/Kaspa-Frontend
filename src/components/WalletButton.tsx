import useKaspaWallet from "@/hooks/useKaspaWallet";
import { Button } from "./ui/button";
import useWalletStore from "@/store/walletStore";
import { useEffect, useState } from "react";
import { Dialog, DialogTrigger, DialogContent } from "./ui/dialog";
import {
  formatAddress,
  formatKAS,
  kasToSompi,
  validateKasAmount,
  formatMaxAmount,
} from "@/lib/utils";
import Balance from "./Balance";

import { Icon } from "@iconify/react/dist/iconify.js";
import useSocketStore from "@/store/socketStore";
import { toast } from "sonner";

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
    withdrawBalance,
    setIsConnecting,
    disconnect,
    authenticate,
    initWallet,
    onSiteBalance,
    handleBalanceChanged,
  } = useWalletStore();

  const [depositAmount, setDepositAmount] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [isDepositing, setIsDepositing] = useState(false);
  const [isWithdrawing, setIsWithdrawing] = useState(false);

  const handleConnect = async () => {
    if (!wallet) {
      toast.error("No wallet available");
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
      toast.error("Failed to connect wallet");
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
      toast.success("Wallet disconnected successfully");
    } catch (error) {
      console.error("Error disconnecting wallet:", error);
      toast.error("Failed to disconnect wallet");
    }
  };

  const handleDeposit = async () => {
    if (!wallet || !onSiteBalance?.address) {
      toast.error("Wallet or deposit address not available");
      return;
    }

    try {
      setIsDepositing(true);
      const sompi = kasToSompi(depositAmount);

      if (!validateKasAmount(depositAmount, balance?.total || 0)) {
        toast.error("Invalid amount or insufficient balance");
        return;
      }

      await wallet.sendKaspa(onSiteBalance.address, sompi);

      toast.success("Deposit initiated successfully");
      setDepositAmount("");
    } catch (error) {
      console.error("Error depositing:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to initiate deposit",
      );
    } finally {
      setIsDepositing(false);
    }
  };

  const handleWithdraw = async () => {
    try {
      setIsWithdrawing(true);

      if (
        !validateKasAmount(withdrawAmount, Number(onSiteBalance?.balance || 0))
      ) {
        toast.error("Invalid amount or insufficient balance");
        return;
      }

      withdrawBalance(withdrawAmount);
      setWithdrawAmount("");
    } catch (error) {
      // Error is already handled in the store
    } finally {
      setIsWithdrawing(false);
    }
  };

  const handleMaxDeposit = () => {
    if (balance?.total) {
      setDepositAmount(formatMaxAmount(balance.total));
    }
  };

  const handleMaxWithdraw = () => {
    if (onSiteBalance?.balance) {
      setWithdrawAmount(formatMaxAmount(parseInt(onSiteBalance.balance)));
    }
  };

  useEffect(() => {
    if (wallet) {
      initWallet(wallet);
      wallet.on("balanceChanged", handleBalanceChanged);
      return () => {
        wallet.removeListener("balanceChanged", handleBalanceChanged);
      };
    }
  }, [wallet, initWallet, handleBalanceChanged]);

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
          <div className="flex items-center gap-2 mt-1 relative">
            <div className="relative w-full">
              <input
                type="text"
                value={depositAmount}
                onChange={(e) => setDepositAmount(e.target.value)}
                placeholder="Enter Amount"
                className="w-full rounded-md bg-white/10 text-[#6fc7ba] text-[12px] h-8 px-2 outline-none pr-16"
                disabled={isDepositing}
              />
              <button
                onClick={handleMaxDeposit}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6fc7ba] text-[10px] hover:text-[#6fc7ba]/80 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isDepositing || !balance?.total}
              >
                MAX
              </button>
            </div>
            <button
              onClick={handleDeposit}
              disabled={isDepositing || !depositAmount}
              className="w-fit px-3 rounded-md bg-[#6fc7ba] cursor-pointer text-[#333] hover:bg-[#6fc7ba]/90 text-[10px] h-8 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isDepositing ? "Depositing..." : "Deposit"}
            </button>
          </div>
          <p className="text-xs font-Onest text-[#6fc7ba] mt-2">
            Max: {formatKAS(balance?.total || 0)}KAS
          </p>
        </div>
        <div className="p-3 bg-white/5 rounded-2xl -mt-2">
          <p className="text-xs font-Onest text-[#6fc7ba] pb-1">
            Withdraw Kaspa
          </p>
          <div className="flex items-center gap-2 mt-1 relative">
            <div className="w-full relative">
              <input
                type="text"
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value)}
                placeholder="Enter Amount"
                className="w-full rounded-md bg-white/10 text-[#6fc7ba] text-[12px] h-8 px-2 outline-none pr-16"
                disabled={isWithdrawing}
              />
              <button
                onClick={handleMaxWithdraw}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6fc7ba] text-[10px] hover:text-[#6fc7ba]/80 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isWithdrawing || !onSiteBalance?.balance}
              >
                MAX
              </button>
            </div>
            <button
              onClick={handleWithdraw}
              disabled={isWithdrawing || !withdrawAmount}
              className="w-fit px-3 rounded-md bg-[#6fc7ba] cursor-pointer text-[#333] hover:bg-[#6fc7ba]/90 text-[10px] h-8 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isWithdrawing ? "Withdrawing..." : "Withdraw"}
            </button>
          </div>
          <p className="text-xs font-Onest text-[#6fc7ba] mt-2">
            Max:{" "}
            {onSiteBalance?.balance
              ? formatKAS(parseInt(onSiteBalance.balance))
              : 0}
            KAS
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
