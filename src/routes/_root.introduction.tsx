import { createFileRoute } from "@tanstack/react-router";
import IntroductionPage from "@/pages/root/introduction/IntroductionPage";

export const Route = createFileRoute("/_root/introduction")({
  component: IntroductionPage,
});
