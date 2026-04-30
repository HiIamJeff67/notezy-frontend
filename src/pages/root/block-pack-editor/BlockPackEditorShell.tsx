import { Suspense } from "react";
import StrictLoadingCover from "@/components/covers/LoadingCover/StrictLoadingCover";

const BlockPackEditorLayout = ({ children }: { children: React.ReactNode }) => {
  return <Suspense fallback={<StrictLoadingCover />}>{children}</Suspense>;
};

export default BlockPackEditorLayout;
