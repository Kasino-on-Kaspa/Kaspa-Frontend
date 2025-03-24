"use client";

import { Icon } from "@iconify/react";
import { Button } from "./ui/button";
import { useRouter } from "@tanstack/react-router";

export default function AffiliateCard() {
  const router = useRouter();
  const benefits = [
    {
      icon: "ph:money-fill",
      text: "Up to 40% revenue share",
    },
    {
      icon: "ph:users-three-fill",
      text: "Lifetime commissions",
    },
    {
      icon: "ph:currency-circle-dollar-fill",
      text: "Instant payouts",
    },
  ];

  return (
    <div className="bg-[#2A2A2A] rounded-xl p-3 space-y-3 font-Onest">
      <div className="space-y-0.5">
        <h3 className="text-sm font-semibold text-white/90">
          Affiliate Program
        </h3>
        <p className="text-[10px] text-white/60">
          Earn money by referring players
        </p>
      </div>

      <div className="space-y-2">
        {benefits.map((benefit, index) => (
          <div key={index} className="flex items-center gap-2">
            <div className="bg-[#6fc7ba]/20 p-1 rounded-lg">
              <Icon icon={benefit.icon} className="text-[#6fc7ba] text-xs" />
            </div>
            <p className="text-[10px] text-white/70">{benefit.text}</p>
          </div>
        ))}
      </div>

      <Button
        className="w-full rounded-md bg-[#6fc7ba] text-[#333] hover:bg-[#6fc7ba]/90 text-[10px] h-8 cursor-pointer"
        onClick={() => router.navigate({ to: "/referral" })}
      >
        Become an Affiliate
      </Button>
    </div>
  );
}
