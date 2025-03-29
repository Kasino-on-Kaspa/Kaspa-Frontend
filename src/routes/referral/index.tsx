import { createFileRoute } from "@tanstack/react-router";
import ReferralPage from "@/pages/ReferralPage";

export const Route = createFileRoute("/referral/")({
  component: ReferralPage,
});
