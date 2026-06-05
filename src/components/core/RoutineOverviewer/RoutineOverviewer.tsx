import React, { Suspense } from "react";
import StrictLoadingCover from "@/components/covers/LoadingCover/StrictLoadingCover";
import { RoutineProvider } from "@/providers/RoutineProvider/RoutineProvider";
import RoutineOverViewerContent from "./RoutineOverViewerContent";

const RoutineOverviewer = () => {
  return (
    <Suspense fallback={<StrictLoadingCover />}>
      <RoutineProvider>
        <RoutineOverViewerContent />
      </RoutineProvider>
    </Suspense>
  );
};

export default RoutineOverviewer;
