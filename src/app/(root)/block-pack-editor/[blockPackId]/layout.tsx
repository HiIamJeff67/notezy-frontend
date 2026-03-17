import StrictLoadingCover from "@/components/covers/LoadingCover/StrictLoadingCover";
import { Suspense } from "react";

const BlockPackEditorLayout = ({ children }: { children: React.ReactNode }) => {
  return <Suspense fallback={<StrictLoadingCover />}>{children}</Suspense>;
};

export default BlockPackEditorLayout;
