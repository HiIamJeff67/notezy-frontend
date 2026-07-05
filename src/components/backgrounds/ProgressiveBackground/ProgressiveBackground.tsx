import React, { useEffect, useMemo, useRef, useState } from "react";
import { useBackgroundImages } from "@/hooks/useBackgroundImages";

interface ProgressiveBackgroundProps
  extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  children?: React.ReactNode;
  loadHighResolution?: boolean | "interaction";
}

export const ProgressiveBackground = React.forwardRef<
  HTMLDivElement,
  ProgressiveBackgroundProps
>(({ className = "", children, loadHighResolution = true, ...props }, ref) => {
  const backgroundImagesManager = useBackgroundImages();

  const [highResolutionImageURL, setHeightResolutionImageURL] = useState<
    string | null
  >(null);
  const [canLoadHighResolution, setCanLoadHighResolution] = useState(
    loadHighResolution !== "interaction"
  );
  const [isLoaded, setIsLoaded] = useState(false);

  const loadingTaskTokenRef = useRef(0);

  const thumbnailURL = useMemo(() => {
    const currentId = backgroundImagesManager.currentBackgroundImage?.id;
    if (!currentId || !backgroundImagesManager.thumbnails) return "";
    return (
      backgroundImagesManager.thumbnails.contents.find(t => t.id === currentId)
        ?.thumbnailURL || ""
    );
  }, [
    backgroundImagesManager.thumbnails,
    backgroundImagesManager.currentBackgroundImage?.id,
  ]);

  useEffect(() => {
    if (loadHighResolution !== "interaction") {
      setCanLoadHighResolution(loadHighResolution !== false);
      return;
    }

    setCanLoadHighResolution(false);
    const allowHighResolutionLoad = () => setCanLoadHighResolution(true);
    window.addEventListener("pointerdown", allowHighResolutionLoad, {
      once: true,
    });
    window.addEventListener("keydown", allowHighResolutionLoad, { once: true });
    window.addEventListener("wheel", allowHighResolutionLoad, {
      once: true,
      passive: true,
    });

    return () => {
      window.removeEventListener("pointerdown", allowHighResolutionLoad);
      window.removeEventListener("keydown", allowHighResolutionLoad);
      window.removeEventListener("wheel", allowHighResolutionLoad);
    };
  }, [loadHighResolution]);

  useEffect(() => {
    if (backgroundImagesManager.currentBackgroundImage === null) {
      setHeightResolutionImageURL(null);
      setIsLoaded(false);
      return;
    }
    if (!canLoadHighResolution) {
      setHeightResolutionImageURL(null);
      setIsLoaded(true);
      return;
    }

    const currentToken = loadingTaskTokenRef.current + 1;
    loadingTaskTokenRef.current = currentToken;

    const nextObjectURL = URL.createObjectURL(
      backgroundImagesManager.currentBackgroundImage.file
    );

    setIsLoaded(false);
    const preloadImage = new Image();
    preloadImage.onload = () => {
      if (loadingTaskTokenRef.current !== currentToken) return;
      setHeightResolutionImageURL(nextObjectURL);
      setIsLoaded(true);
    };
    preloadImage.onerror = () => {
      if (loadingTaskTokenRef.current !== currentToken) return;
      setHeightResolutionImageURL(null);
      setIsLoaded(false);
    };
    preloadImage.src = nextObjectURL;

    return () => {
      preloadImage.onload = null;
      preloadImage.onerror = null;
    };
  }, [
    canLoadHighResolution,
    backgroundImagesManager.currentBackgroundImage,
    thumbnailURL,
  ]);

  return (
    <div
      ref={ref}
      {...props}
      className={`relative w-full h-full overflow-hidden bg-cover bg-center bg-no-repeat ${className}`}
      style={{
        ...props.style,
        backgroundImage: `url(${highResolutionImageURL || thumbnailURL})`,
      }}
    >
      <div
        className={`absolute inset-0 bg-cover bg-center bg-no-repeat transition-opacity duration-[1000ms] ease-out pointer-events-none`}
        style={{
          backgroundImage: `url(${thumbnailURL})`,
          backgroundRepeat: "no-repeat",
          backgroundSize: "cover",
          backgroundPosition: "center",
          filter: "blur(10px)",
          transform: "scale(1.05)",
          opacity: isLoaded ? 0 : 1,
        }}
      />
      <div className="relative z-10 w-full h-full">{children}</div>
    </div>
  );
});

ProgressiveBackground.displayName = "ProgressiveBackground";
