import { useTheme } from "@/hooks";
import { useScreen } from "@/hooks/useScreen";
import {
  DefaultHeightTotalFrameCount,
  DefaultWidthTotalFrameCount,
} from "@shared/constants/widgetLayout.constant";
import { Cord } from "@shared/types/cord";
import { CSSProperties, useEffect, useRef, useState } from "react";
import PlaceableFrame from "./PlaceableFrame";

interface PlaceableBackgroundProps {
  className?: string;
  style?: CSSProperties;
  minZIndex?: number;
  children?: React.ReactNode;
  frameSizeSource?: "horizontal" | "vertical" | "none";
  frameSize: number;
  setFrameSize: (newBaseSize: number) => void;
  widthTotalFrameCount: number;
  heightTotalFrameCount: number;
  frameProps: {
    gap: number;
    isEditing: boolean;
    onClick: (position: {
      leftFrameCount: number;
      topFrameCount: number;
    }) => void;
    className?: string;
    children?: React.ReactNode;
  };
}

const PlaceableBackground = ({
  className,
  style,
  children,
  minZIndex = 50,
  frameSizeSource = "none",
  frameSize,
  setFrameSize,
  widthTotalFrameCount,
  heightTotalFrameCount,
  frameProps,
}: PlaceableBackgroundProps) => {
  const screenManager = useScreen();
  const themeManager = useTheme();

  const [frames, setFrames] = useState<Cord[]>([]);

  // the reference of the background element which will be used to define the base size
  const backgroundRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const width = backgroundRef.current
      ? backgroundRef.current.offsetWidth
      : window.innerWidth;
    const height = backgroundRef.current
      ? backgroundRef.current.offsetHeight
      : window.innerHeight;

    let horizontal = widthTotalFrameCount;
    let vertical = heightTotalFrameCount;

    if (horizontal === Infinity && vertical === Infinity) {
      horizontal = DefaultWidthTotalFrameCount;
      vertical = DefaultHeightTotalFrameCount;
    } else if (horizontal === Infinity) {
      horizontal = Math.floor(width / (height / vertical));
    } else if (vertical === Infinity) {
      vertical = Math.floor(height / (width / horizontal));
    }

    let newFrameSize = Math.min(
      Math.floor(width / horizontal),
      Math.floor(height / vertical)
    );
    if (frameSizeSource === "horizontal") {
      newFrameSize = Math.floor(width / horizontal);
      console.log(newFrameSize);
    } else if (frameSizeSource === "vertical") {
      newFrameSize = Math.floor(height / vertical) - 2 * frameProps.gap;
    }
    setFrameSize(newFrameSize);
    const frames = [];
    for (let y = 0; y < vertical; y++) {
      for (let x = 0; x < horizontal; x++) {
        frames.push([x, y] as Cord);
      }
    }
    setFrames(frames);
  }, [
    // except for listening the changed of backgroundRef to avoid UI zooming while user adding new widgets
    screenManager.isZooming,
    widthTotalFrameCount,
    heightTotalFrameCount,
  ]);

  return (
    <div
      ref={backgroundRef}
      className={`w-full min-h-full relative ${className} z-${minZIndex}`}
      style={{
        background: themeManager.currentTheme.isDark ? "black" : "white",
        ...style,
      }}
    >
      {frames.map(([x, y]) => (
        <PlaceableFrame
          key={`${x}-${y}`}
          className={`absolute z-${minZIndex} ${frameProps.className}`}
          isActive={frameProps.isEditing}
          frameSize={frameSize}
          position={{ leftFrameCount: x, topFrameCount: y }}
          size={{ widthFrameCount: 1, heightFrameCount: 1 }}
          gap={{
            horizontal: frameProps.gap,
            vertical: frameProps.gap,
          }}
          onClick={frameProps.onClick}
        >
          {frameProps.children}
        </PlaceableFrame>
      ))}
      {children}
    </div>
  );
};

export default PlaceableBackground;
