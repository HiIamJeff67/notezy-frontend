import { useTheme } from "@/hooks";
import { Cord } from "@shared/types/cord";
import { useEffect, useRef, useState } from "react";
import PlaceableFrame from "./PlaceableFrame";

interface PlaceableBackgroundProps {
  className?: string;
  children?: React.ReactNode;
  frameChildren?: (left: number, top: number) => React.ReactNode;
  minZIndex?: number;
  frameSize: number;
  setFrameSize: (newBaseSize: number) => void;
  gap?: number;
  isEditing: boolean;
  horizontalFrameCount: number;
  verticalFrameCount: number;
}

const PlaceableBackground = ({
  className,
  children,
  frameChildren,
  minZIndex = 50,
  frameSize,
  setFrameSize,
  gap = 4,
  isEditing,
  horizontalFrameCount,
  verticalFrameCount,
}: PlaceableBackgroundProps) => {
  const themeManager = useTheme();

  const [frames, setFrames] = useState<Cord[]>([]);

  // the reference of the background element which will be used to define the base size
  const backgroundRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const updateSize = () => {
      const width = backgroundRef.current
        ? backgroundRef.current.offsetWidth
        : window.innerWidth;
      const height = backgroundRef.current
        ? backgroundRef.current.offsetHeight
        : window.innerHeight;

      let horizontal = horizontalFrameCount;
      let vertical = verticalFrameCount;

      if (horizontal === Infinity && vertical === Infinity) {
        horizontal = 4; // set it to some other constant value
        vertical = 12; // set it to some other constant value
      } else if (horizontal === Infinity) {
        horizontal = Math.floor(width / (height / vertical));
      } else if (vertical === Infinity) {
        vertical = Math.floor(height / (width / horizontal));
      }

      const sizeX = Math.floor(width / horizontal);
      const sizeY = Math.floor(height / vertical);
      setFrameSize(Math.min(sizeX, sizeY) - 2 * gap);
      const frames = [];
      for (let y = 0; y < vertical; y++) {
        for (let x = 0; x < horizontal; x++) {
          frames.push([x, y] as Cord);
        }
      }
      setFrames(frames);
    };

    updateSize();
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, [backgroundRef, horizontalFrameCount, verticalFrameCount]);

  return (
    <div
      ref={backgroundRef}
      className={`w-full min-h-full relative ${className} z-${minZIndex}`}
      style={{
        background: themeManager.currentTheme.isDark ? "black" : "white",
      }}
    >
      {frames.map(([x, y]) => (
        <PlaceableFrame
          key={`${x}-${y}`}
          className={`absolute z-${minZIndex}`}
          isActive={isEditing}
          frameSize={frameSize}
          leftFrameCount={x}
          topFrameCount={y}
          widthFrameCount={1}
          heightFrameCount={1}
          horizontalGap={x === 0 ? 0 : gap}
          verticalGap={y === 0 ? 0 : gap}
        >
          {frameChildren}
        </PlaceableFrame>
      ))}
      {children}
    </div>
  );
};

export default PlaceableBackground;
