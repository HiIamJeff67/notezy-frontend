import { createFileRoute } from "@tanstack/react-router";
import DocumentPage from "@/pages/root/document/DocumentPage";

export const Route = createFileRoute("/document")({
  component: DocumentPage,
});
