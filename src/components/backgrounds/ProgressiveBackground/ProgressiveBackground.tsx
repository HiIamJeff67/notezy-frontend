"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useBackgroundImages } from "@/hooks/useBackgroundImages";

interface ProgressiveBackgroundProps
  extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  children?: React.ReactNode;
}

export const ProgressiveBackground = React.forwardRef<
  HTMLDivElement,
  ProgressiveBackgroundProps
>(({ className = "", children, ...props }, ref) => {
  const backgroundImagesManager = useBackgroundImages();

  const [highResolutionImageURL, setHeightResolutionImageURL] = useState<
    string | null
  >(null);
  const [isLoaded, setIsLoaded] = useState(false);

  const thumbnailURL = useMemo(() => {
    const currentId = backgroundImagesManager.currentBackgroundImageId;
    if (!currentId || !backgroundImagesManager.thumbnails) return "";
    return (
      backgroundImagesManager.thumbnails.contents.find(t => t.id === currentId)
        ?.thumbnailURL || ""
    );
  }, [backgroundImagesManager]);

  useEffect(() => {
    const currentId = backgroundImagesManager.currentBackgroundImageId;
    if (currentId === null) return;

    let hasMounted = true;
    let imagePack: { url: string; revoke: () => void } | null = null; // fallback to be null

    const loadHighResolutionImage = async () => {
      setIsLoaded(false);
      imagePack = await backgroundImagesManager.getFullImageURL(currentId);
      if (imagePack !== null && hasMounted) {
        const img = new Image();
        img.src = imagePack.url;
        img.onload = () => {
          if (imagePack !== null && hasMounted) {
            setHeightResolutionImageURL(imagePack.url);
            setIsLoaded(true);
          }
        };
      }
    };

    loadHighResolutionImage();

    return () => {
      hasMounted = false;
      imagePack?.revoke();
    };
  }, [backgroundImagesManager]);

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
