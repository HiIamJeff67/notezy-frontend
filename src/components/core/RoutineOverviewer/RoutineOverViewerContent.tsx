import { CheckIcon, SquarePen } from "lucide-react";
import React, { useLayoutEffect, useRef, useState } from "react";
import GridBackground from "@/components/backgrounds/GridBackground/GridBackground";
import { ProgressiveBackground } from "@/components/backgrounds/ProgressiveBackground/ProgressiveBackground";
import ModifyImageHover from "@/components/hovers/ModifyImageHover/ModifyImageHover";
import { Button } from "@/components/ui/button";
import { useSidebar } from "@/components/ui/sidebar";
import { useBackgroundImages, useModal, useResizeSidebar } from "@/hooks";
import RoutineScopeBar from "./RoutineScopeBar";

const RoutineOverViewerContent = () => {
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
    <div className="w-full h-full flex flex-col justify-center items-start bg-cover bg-center bg-no-repeat">
      <header
        className="
          fixed top-0 right-0 z-100 h-10
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
      <div className="w-full h-full">
        <div className="!w-full !h-60 relative z-10">
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
        <div className="w-full px-4 pb-8">
          <section
            className="
              mt-4 flex min-h-72 w-full flex-col border-y border-border/60
              bg-background/45 backdrop-blur-sm
            "
          >
            <div className="flex h-10 items-center justify-between border-b border-border/50 px-3">
              <span className="text-sm font-medium">TimeRails</span>
            </div>
            <div className="grid flex-1 grid-cols-[160px_1fr]">
              <div className="border-r border-border/50 bg-muted/10" />
              <div
                className="
                  bg-[linear-gradient(to_right,hsl(var(--border)/0.35)_1px,transparent_1px)]
                  bg-[length:72px_100%]
                "
              />
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default RoutineOverViewerContent;
