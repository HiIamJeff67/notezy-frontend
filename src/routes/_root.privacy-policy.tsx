import { createFileRoute } from "@tanstack/react-router";
import PrivacyPolicyPage from "@/pages/root/privacy-policy/PrivacyPolicyPage";

export const Route = createFileRoute("/_root/privacy-policy")({
  component: PrivacyPolicyPage,
});
