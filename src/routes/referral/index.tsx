import { createFileRoute } from "@tanstack/react-router";
import ReferralPage from "@/pages/ReferralPage";
import { z } from "zod";

export const Route = createFileRoute("/referral/")({
  component: ReferralPage,
  validateSearch: z.object({
    referralCode: z.string().optional(),
  }),
});
