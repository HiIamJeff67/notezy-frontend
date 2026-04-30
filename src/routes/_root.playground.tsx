import { createFileRoute } from "@tanstack/react-router";
import PlaygroundPage from "@/pages/root/playground/PlaygroundPage";

export const Route = createFileRoute("/_root/playground")({
  component: PlaygroundPage,
});
