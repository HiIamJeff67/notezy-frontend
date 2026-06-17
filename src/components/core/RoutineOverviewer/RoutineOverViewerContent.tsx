import { CheckIcon, SquarePen } from "lucide-react";
import React, { useLayoutEffect, useRef, useState } from "react";
import GridBackground from "@/components/backgrounds/GridBackground/GridBackground";
import { ProgressiveBackground } from "@/components/backgrounds/ProgressiveBackground/ProgressiveBackground";
import ModifyImageHover from "@/components/hovers/ModifyImageHover/ModifyImageHover";
import { Button } from "@/components/ui/button";
import { useSidebar } from "@/components/ui/sidebar";
import { useBackgroundImages, useModal, useResizeSidebar } from "@/hooks";
import RoutineScopeBar from "./RoutineScopeBar";
import RoutineTable from "./RoutineTable";
import RoutineTaskTable from "./RoutineTaskTable";
import TimeRails from "./TimeRails/TimeRails";

const RoutineOverviewerContent = () => {
  const modalManager = useModal();
  const backgroundImagesManager = useBackgroundImages();
  const sidebarManager = useSidebar();
  const resizableSidebarManager = useResizeSidebar();

  const [isHeaderBackgroundImageEditing, setIsHeaderBackgroundImageEditing] =
    useState<boolean>(false);
  const [cropperAspectRatio, setCropperAspectRatio] = useState<number>(16 / 9);

  const headerBackgroundImageRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (headerBackgroundImageRef.current !== null) {
      const { width, height } =
        headerBackgroundImageRef.current.getBoundingClientRect();
      if (width && height) setCropperAspectRatio(width / height);
    }
  }, [backgroundImagesManager.currentBackgroundImage]);

  return (
    <div className="flex h-full min-h-0 w-full flex-col items-start overflow-hidden bg-cover bg-center bg-no-repeat">
      <header
        className="
          fixed top-0 right-0 z-20 h-10
          flex shrink-0 justify-between items-center 
          gap-2 bg-background/75 backdrop-blur-md border-background/10
        "
        style={{
          left: sidebarManager.isMobile
            ? 0
            : sidebarManager.open
              ? resizableSidebarManager.width
              : "var(--sidebar-width-icon)",
          transition: "left 0.2s",
        }}
      >
        <RoutineScopeBar />
      </header>
      <div className="custom-scrollbar flex h-full min-h-0 w-full flex-col overflow-x-hidden overflow-y-auto pt-10">
        <div className="relative z-10 h-60 w-full shrink-0">
          {isHeaderBackgroundImageEditing ? (
            <Button
              variant="ghost"
              className="
                fixed right-0 justify-center items-center
                rounded-full shadow-lg w-8 h-8 m-2
                transition z-100
              "
              onClick={() => setIsHeaderBackgroundImageEditing(false)}
            >
              <CheckIcon />
            </Button>
          ) : (
            <Button
              variant="ghost"
              className="
                absolute right-0 bottom-0 justify-center items-center
                rounded-full shadow-lg w-8 h-8 m-2
                transition z-100
              "
              onClick={() => setIsHeaderBackgroundImageEditing(true)}
            >
              <SquarePen />
            </Button>
          )}
          {backgroundImagesManager.currentBackgroundImage === null ? (
            <GridBackground className="w-full h-full shrink-0 relative z-10">
              {isHeaderBackgroundImageEditing && (
                <ModifyImageHover
                  className="absolute"
                  imageSrc=""
                  imageAlt="Dashboard background image"
                  onClick={() =>
                    modalManager.open("SelectBackgroundImageDialog", {
                      cropperAspectRatio: cropperAspectRatio,
                    })
                  }
                  hoverText="點擊以變更背景圖片"
                />
              )}
            </GridBackground>
          ) : (
            <ProgressiveBackground
              ref={headerBackgroundImageRef}
              className="w-full h-full shrink-0 border-none relative z-10"
            >
              {isHeaderBackgroundImageEditing && (
                <ModifyImageHover
                  className="absolute inset-0"
                  imageAlt="Dashboard background image"
                  onClick={() =>
                    modalManager.open("SelectBackgroundImageDialog", {
                      cropperAspectRatio: cropperAspectRatio,
                    })
                  }
                  hoverText="點擊以變更背景圖片"
                />
              )}
            </ProgressiveBackground>
          )}
        </div>
        <div className="flex w-full flex-col gap-4 overflow-x-hidden p-4">
          <TimeRails />
          <RoutineTable />
          <RoutineTaskTable />
        </div>
      </div>
    </div>
  );
};

export default RoutineOverviewerContent;
