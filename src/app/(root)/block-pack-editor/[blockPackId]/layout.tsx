import StrictLoadingOutlay from "@/components/LoadingOutlay/StrictLoadingOutlay";
import { Suspense } from "react";

const BlockPackEditorLayout = ({ children }: { children: React.ReactNode }) => {
  return <Suspense fallback={<StrictLoadingOutlay />}>{children}</Suspense>;
};

export default BlockPackEditorLayout;
