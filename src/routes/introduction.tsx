import { createFileRoute } from "@tanstack/react-router";
import IntroductionPage from "@/pages/root/introduction/IntroductionPage";

export const Route = createFileRoute("/introduction")({
  component: IntroductionPage,
});
