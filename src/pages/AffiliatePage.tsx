import { useState, FormEvent, ChangeEvent } from "react";
import { useUserData, useUpdateReferredBy } from "@/lib/walletQueries";
import { toast } from "sonner";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Icon } from "@iconify/react";
import { useQuery } from "@tanstack/react-query";
import { formatKAS } from "@/lib/utils";

interface ReferralStats {
  totalReferrals: number;
  totalEarnings: string;
  winEarnings: string;
  loseEarnings: string;
}

const fetchReferralStats = async (
  referralCode: string,
): Promise<ReferralStats> => {
  const response = await fetch(
    `/api/referral/stats?referralCode=${encodeURIComponent(referralCode)}`,
    {
      credentials: "include",
    },
  );
  if (!response.ok) {
    throw new Error("Failed to fetch referral stats");
  }

  const data = await response.json();
  console.log(data);
  return data;
};

export default function AffiliatePage() {
  const {
    data: userData,
    isLoading: isUserDataLoading,
    refetch,
  } = useUserData();
  const { mutateAsync: updateReferredBy } = useUpdateReferredBy();
  const [referralCode, setReferralCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const { data: referralStats, isLoading: isStatsLoading } = useQuery({
    queryKey: ["referralStats", userData?.referralCode],
    queryFn: () => fetchReferralStats(userData?.referralCode || ""),
    enabled: !!userData?.referralCode,
  });

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!referralCode.trim()) {
      toast.error("Please enter a referral code");
      return;
    }

    setIsLoading(true);
    try {
      await updateReferredBy(referralCode);
      toast.success("Referral code updated successfully");
      refetch();
    } catch (error) {
      console.error("Error updating referral code:", error);
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("Failed to update referral code. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Referral Code Section */}
      <Card className="bg-[#1a1718]/50 backdrop-blur-sm border-white/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Icon icon="mdi:link-variant" className="h-5 w-5 text-[#6fc7ba]" />
            Your Referral Code
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isUserDataLoading ? (
            <div className="flex items-center justify-center h-10">
              <Icon
                icon="mdi:loading"
                className="h-5 w-5 animate-spin text-[#6fc7ba]"
              />
            </div>
          ) : userData?.referralCode ? (
            <div className="flex items-center gap-2">
              <Input
                value={userData.referralCode}
                readOnly
                className="font-mono bg-[#2a2627] border-white/5 text-white"
              />
              <Button
                variant="outline"
                size="icon"
                onClick={() => {
                  navigator.clipboard.writeText(userData.referralCode || "");
                  toast.success("Referral code copied to clipboard");
                }}
                className="border-white/5 hover:border-[#6fc7ba]/20"
              >
                <Icon icon="mdi:content-copy" className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div className="text-white/70">No referral code available</div>
          )}
        </CardContent>
      </Card>

      {/* Referral Stats Section */}
      {userData?.referralCode && (
        <Card className="bg-[#1a1718]/50 backdrop-blur-sm border-white/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Icon icon="mdi:chart-line" className="h-5 w-5 text-[#6fc7ba]" />
              Your Referral Stats
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isStatsLoading ? (
              <div className="flex items-center justify-center h-10">
                <Icon
                  icon="mdi:loading"
                  className="h-5 w-5 animate-spin text-[#6fc7ba]"
                />
              </div>
            ) : referralStats ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <p className="text-white/70">Total Referrals</p>
                  <p className="text-2xl font-bold text-white">
                    {referralStats.totalReferrals}
                  </p>
                </div>
                <div className="space-y-2">
                  <p className="text-white/70">Total Earnings</p>
                  <p className="text-2xl font-bold text-white">
                    {formatKAS(BigInt(referralStats.totalEarnings))} KAS
                  </p>
                </div>
                <div className="space-y-2">
                  <p className="text-white/70">Win Earnings</p>
                  <p className="text-2xl font-bold text-[#6fc7ba]">
                    {formatKAS(BigInt(referralStats.winEarnings))} KAS
                  </p>
                </div>
                <div className="space-y-2">
                  <p className="text-white/70">Loss Earnings</p>
                  <p className="text-2xl font-bold text-[#6fc7ba]">
                    {formatKAS(BigInt(referralStats.loseEarnings))} KAS
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-white/70">No stats available</div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Enter Referral Code Section */}
      <Card className="bg-[#1a1718]/50 backdrop-blur-sm border-white/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Icon icon="mdi:account-plus" className="h-5 w-5 text-[#6fc7ba]" />
            Enter Referral Code
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isUserDataLoading ? (
            <div className="flex items-center justify-center h-10">
              <Icon
                icon="mdi:loading"
                className="h-5 w-5 animate-spin text-[#6fc7ba]"
              />
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex items-center gap-2">
                <Input
                  placeholder="Enter referral code"
                  value={referralCode}
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    setReferralCode(e.target.value)
                  }
                  disabled={!!userData?.referredBy}
                  className="bg-[#2a2627] border-white/5 text-white"
                />
                <Button
                  type="submit"
                  disabled={isLoading || !!userData?.referredBy}
                  className="bg-[#6fc7ba] hover:bg-[#6fc7ba]/90"
                >
                  {isLoading ? (
                    <Icon icon="mdi:loading" className="h-4 w-4 animate-spin" />
                  ) : (
                    <Icon icon="mdi:check" className="h-4 w-4" />
                  )}
                </Button>
              </div>
              {userData?.referredBy && (
                <p className="text-sm text-white/70">
                  You are already referred by: {userData.referredBy}
                </p>
              )}
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
