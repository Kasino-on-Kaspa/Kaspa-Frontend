import { useState, FormEvent, ChangeEvent } from "react";
import useWalletStore from "@/store/walletStore";
import { useUpdateReferredBy, useUserData } from "@/lib/walletQueries";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Icon } from "@iconify/react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { formatKAS } from "@/lib/utils";
import {
  Coins,
  Users,
  Wallet,
  ChartBar,
  TrendingUp,
  ArrowUpRight,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";

// Mock data for charts - replace with real data from API
const earningsData = [
  { month: "Jan", earnings: 1200 },
  { month: "Feb", earnings: 1900 },
  { month: "Mar", earnings: 1500 },
  { month: "Apr", earnings: 2100 },
  { month: "May", earnings: 1800 },
  { month: "Jun", earnings: 2400 },
];

const referralsData = [
  { month: "Jan", referrals: 5 },
  { month: "Feb", referrals: 8 },
  { month: "Mar", referrals: 12 },
  { month: "Apr", referrals: 15 },
  { month: "May", referrals: 20 },
  { month: "Jun", referrals: 25 },
];

const fetchReferralStats = async (referralCode: string) => {
  const response = await fetch(
    `/api/referral/stats?referralCode=${encodeURIComponent(referralCode)}`,
    {
      credentials: "include",
    },
  );
  if (!response.ok) {
    throw new Error("Failed to fetch referral stats");
  }
  return response.json();
};

export default function ReferralPage() {
  const { isAuthenticated } = useWalletStore();
  const {
    data: userData,
    isLoading: isUserDataLoading,
    refetch,
  } = useUserData();

  const { data: referralStats, isLoading: isStatsLoading } = useQuery({
    queryKey: ["referralStats", userData?.referralCode],
    queryFn: () => fetchReferralStats(userData?.referralCode || ""),
    enabled: !!userData?.referralCode,
  });

  const { mutateAsync: updateReferredBy } = useUpdateReferredBy();
  const [referralCode, setReferralCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!referralCode.trim()) {
      toast.error("Please enter a referral code");
      return;
    }

    setIsLoading(true);
    try {
      await updateReferredBy(referralCode);
      refetch();
    } catch (error) {
      toast.error("Failed to update referral code");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#1a1718] font-Onest text-white">
      {/* Hero Section */}
      <section className="pt-20 relative overflow-hidden">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center max-w-3xl mx-auto"
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Join Our <span className="text-[#6fc7ba]">Affiliate Program</span>
            </h1>
            <p className="text-xl text-white/70 mb-8">
              Earn rewards by inviting your friends to Kasino
            </p>
          </motion.div>
        </div>

        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#6fc7ba]/10 to-transparent pointer-events-none"></div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 bg-[#2a2627]/50 backdrop-blur-sm">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Why Choose Our{" "}
              <span className="text-[#6fc7ba]">Affiliate Program</span>
            </h2>
            <p className="text-white/70">
              Join hundreds of successful affiliates earning with Kasino
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: <Coins className="w-8 h-8" />,
                title: "High Rewards",
                description:
                  "Earn generous rewards for each friend that joins through your link",
              },
              {
                icon: <Wallet className="w-8 h-8" />,
                title: "Fast Payments",
                description: "Get paid in KAS with quick processing times",
              },
              {
                icon: <Users className="w-8 h-8" />,
                title: "Dedicated Support",
                description: "24/7 support from our affiliate management team",
              },
              {
                icon: <ChartBar className="w-8 h-8" />,
                title: "Real-time Stats",
                description: "Track your performance with detailed analytics",
              },
            ].map((benefit, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-[#1a1718]/50 backdrop-blur-sm rounded-xl p-6 border border-white/5 hover:border-[#6fc7ba]/20 transition-all"
              >
                <div className="w-16 h-16 rounded-xl bg-[#6fc7ba]/20 flex items-center justify-center mb-4 text-[#6fc7ba]">
                  {benefit.icon}
                </div>
                <h3 className="text-xl font-bold mb-2">{benefit.title}</h3>
                <p className="text-white/70">{benefit.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Dashboard Section (Only shown when authenticated) */}
      {isAuthenticated && !isUserDataLoading ? (
        <section className="py-16">
          <div className="container mx-auto px-4 max-w-6xl">
            <div className="space-y-8">
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="bg-[#1a1718]/50 backdrop-blur-sm border-white/5">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-white">
                      Total Earnings
                    </CardTitle>
                    <Icon
                      icon="mdi:currency-usd"
                      className="h-4 w-4 text-[#6fc7ba]"
                    />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-white">
                      {isStatsLoading
                        ? "Loading..."
                        : `${formatKAS(BigInt(referralStats?.totalEarnings || "0"))} KAS`}
                    </div>
                    <div className="flex items-center text-xs text-[#6fc7ba] mt-1">
                      <TrendingUp className="w-4 h-4 mr-1" />
                      <span>+12.5% from last month</span>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-[#1a1718]/50 backdrop-blur-sm border-white/5">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-white">
                      Active Referrals
                    </CardTitle>
                    <Icon
                      icon="mdi:account-group"
                      className="h-4 w-4 text-[#6fc7ba]"
                    />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-white">
                      {isStatsLoading
                        ? "Loading..."
                        : referralStats?.totalReferrals || 0}
                    </div>
                    <div className="flex items-center text-xs text-[#6fc7ba] mt-1">
                      <ArrowUpRight className="w-4 h-4 mr-1" />
                      <span>+5 new this month</span>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-[#1a1718]/50 backdrop-blur-sm border-white/5">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-white">
                      Win Earnings
                    </CardTitle>
                    <Icon
                      icon="mdi:percent"
                      className="h-4 w-4 text-[#6fc7ba]"
                    />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-white">
                      {isStatsLoading
                        ? "Loading..."
                        : `${formatKAS(BigInt(referralStats?.winEarnings || "0"))} KAS`}
                    </div>
                    <div className="flex items-center text-xs text-[#6fc7ba] mt-1">
                      <span>From referred wins</span>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-[#1a1718]/50 backdrop-blur-sm border-white/5">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-white">
                      Loss Earnings
                    </CardTitle>
                    <Icon
                      icon="mdi:chart-line"
                      className="h-4 w-4 text-[#6fc7ba]"
                    />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-white">
                      {isStatsLoading
                        ? "Loading..."
                        : `${formatKAS(BigInt(referralStats?.loseEarnings || "0"))} KAS`}
                    </div>
                    <div className="flex items-center text-xs text-[#6fc7ba] mt-1">
                      <span>From referred losses</span>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Charts Section */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="bg-[#1a1718]/50 backdrop-blur-sm border-white/5">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-white">
                      <Icon
                        icon="mdi:chart-line"
                        className="h-5 w-5 text-[#6fc7ba]"
                      />
                      Earnings Over Time
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={earningsData}>
                          <CartesianGrid
                            strokeDasharray="3 3"
                            stroke="#ffffff10"
                          />
                          <XAxis
                            dataKey="month"
                            stroke="#ffffff70"
                            tick={{ fill: "#ffffff70" }}
                          />
                          <YAxis
                            stroke="#ffffff70"
                            tick={{ fill: "#ffffff70" }}
                          />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: "#1a1718",
                              border: "1px solid #ffffff10",
                              borderRadius: "8px",
                            }}
                            labelStyle={{ color: "#ffffff" }}
                          />
                          <Line
                            type="monotone"
                            dataKey="earnings"
                            stroke="#6fc7ba"
                            strokeWidth={2}
                            dot={{ fill: "#6fc7ba", strokeWidth: 2 }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-[#1a1718]/50 backdrop-blur-sm border-white/5">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-white">
                      <Icon
                        icon="mdi:account-group"
                        className="h-5 w-5 text-[#6fc7ba]"
                      />
                      Referrals Growth
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={referralsData}>
                          <CartesianGrid
                            strokeDasharray="3 3"
                            stroke="#ffffff10"
                          />
                          <XAxis
                            dataKey="month"
                            stroke="#ffffff70"
                            tick={{ fill: "#ffffff70" }}
                          />
                          <YAxis
                            stroke="#ffffff70"
                            tick={{ fill: "#ffffff70" }}
                          />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: "#1a1718",
                              border: "1px solid #ffffff10",
                              borderRadius: "8px",
                            }}
                            labelStyle={{ color: "#ffffff" }}
                          />
                          <Bar
                            dataKey="referrals"
                            fill="#6fc7ba"
                            radius={[4, 4, 0, 0]}
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Referral Code Section */}
              <Card className="bg-[#1a1718]/50 backdrop-blur-sm border-white/5">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-white">
                    <Icon
                      icon="mdi:link-variant"
                      className="h-5 w-5 text-[#6fc7ba]"
                    />
                    Your Referral Code
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    <Input
                      value={userData?.referralCode || ""}
                      readOnly
                      className="font-mono bg-[#2a2627] border-white/5 text-white"
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => {
                        navigator.clipboard.writeText(
                          userData?.referralCode || "",
                        );
                        toast.success("Referral code copied to clipboard");
                      }}
                      className="border-white/5 hover:border-[#6fc7ba]/20 cursor-pointer"
                    >
                      <Icon icon="mdi:content-copy" className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Enter Referral Code Section */}
              <Card className="bg-[#1a1718]/50 backdrop-blur-sm border-white/5">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-white">
                    <Icon
                      icon="mdi:account-plus"
                      className="h-5 w-5 text-[#6fc7ba]"
                    />
                    Enter Referral Code
                  </CardTitle>
                </CardHeader>
                <CardContent>
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
                          <Icon
                            icon="mdi:loading"
                            className="h-4 w-4 animate-spin"
                          />
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
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      ) : (
        // CTA Section for non-authenticated users
        <section className="pt-16">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="text-center max-w-2xl mx-auto"
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Ready to Start <span className="text-[#6fc7ba]">Earning?</span>
              </h2>
              <p className="text-white/70">
                Connect your wallet to get your unique referral code and start
                earning rewards today
              </p>
            </motion.div>
          </div>
        </section>
      )}
    </main>
  );
}
