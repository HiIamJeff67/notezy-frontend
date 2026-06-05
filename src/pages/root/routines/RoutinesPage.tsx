import React, { Suspense } from "react";
import RoutineOverviewer from "@/components/core/RoutineOverviewer/RoutineOverviewer";
import StrictLoadingCover from "@/components/covers/LoadingCover/StrictLoadingCover";

const RoutinesPage = () => {
  return (
    <Suspense fallback={<StrictLoadingCover />}>
      <RoutineOverviewer />
    </Suspense>
  );
};

export default RoutinesPage;
