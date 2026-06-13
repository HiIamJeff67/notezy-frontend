import React, { Suspense } from "react";
import StrictLoadingCover from "@/components/covers/LoadingCover/StrictLoadingCover";
import RoutineOverViewerContent from "./RoutineOverViewerContent";

const RoutineOverviewer = () => {
  return (
    <Suspense fallback={<StrictLoadingCover />}>
      <RoutineOverViewerContent />
    </Suspense>
  );
};

export default RoutineOverviewer;
