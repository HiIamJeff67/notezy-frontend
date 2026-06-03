import { CheckIcon, SquarePen } from "lucide-react";
import React, { useLayoutEffect, useRef, useState } from "react";
import GridBackground from "@/components/backgrounds/GridBackground/GridBackground";
import { ProgressiveBackground } from "@/components/backgrounds/ProgressiveBackground/ProgressiveBackground";
import ModifyImageHover from "@/components/hovers/ModifyImageHover/ModifyImageHover";
import { Button } from "@/components/ui/button";
import { useBackgroundImages, useModal } from "@/hooks";

const RoutinesPage = () => {
  const modalManager = useModal();
  const backgroundImagesManager = useBackgroundImages();

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
      <header className="w-full h-14 flex shrink-0 justify-between items-center px-4 gap-2 bg-background/15 backdrop-blur-md border-b border-background/10">
        RoutinePageHeader
      </header>
      <div className="w-full h-full">
        <div className="!w-full !h-36 relative z-10">
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
                fixed right-0 justify-center items-center
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
      </div>
    </div>
  );
};

export default RoutinesPage;
