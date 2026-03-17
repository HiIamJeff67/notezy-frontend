import { clamp } from "@/util/math";
import { MouseEvent as ReactMouseEvent, useCallback, useState } from "react";

interface XYResizableProps {
  children?: React.ReactNode;
  className?: string;
  minWidth?: number;
  maxWidth?: number;
  minHeight?: number;
  maxHeight?: number;
  control?: {
    width: number;
    setWidth: (newWidth: number) => void;
    height: number;
    setHeight: (newHeight: number) => void;
    validate: (width: number, height: number) => boolean;
    getRecentValidated: (
      width: number,
      height: number
    ) => { width: number; height: number };
  };
}

const XYResizable = ({
  children,
  className,
  minWidth = 100,
  maxWidth = 800,
  minHeight = 100,
  maxHeight = 800,
  control,
}: XYResizableProps) => {
  const [width, setWidth] = useState<number>(minWidth);
  const [height, setHeight] = useState<number>(minHeight);

  const handleMouseDown = useCallback(
    (e: ReactMouseEvent) => {
      e.preventDefault();
      const startX = e.clientX;
      const startY = e.clientY;
      const startWidth = width;
      const startHeight = height;

      const move = (ev: MouseEvent) => {
        const deltaX = ev.clientX - startX;
        const deltaY = ev.clientY - startY;
        const newWidth = clamp(startWidth + deltaX, minWidth, maxWidth);
        const newHeight = clamp(startHeight + deltaY, minHeight, maxHeight);
        setWidth(newWidth);
        setHeight(newHeight);
        document.body.style.cursor = "nwse-resize";
        document.body.style.userSelect = "none";
      };

      const up = () => {
        window.removeEventListener("mousemove", move);
        window.removeEventListener("mouseup", up);
        if (control !== undefined) {
          if (control.validate(width, height)) {
            control.setWidth(width);
            control.setHeight(height);
          } else {
            const recentValidated = control.getRecentValidated(width, height);
            setWidth(recentValidated.width);
            setHeight(recentValidated.height);
          }
        }
        document.body.style.cursor = "";
        document.body.style.userSelect = "";
      };

      window.addEventListener("mousemove", move);
      window.addEventListener("mouseup", up);
    },
    [width, height, minWidth, maxWidth, minHeight, maxHeight]
  );

  return (
    <div
      className={`relative ${className ?? ""}`}
      style={{ width: width, height: height }}
    >
      {children}
      <div
        className="absolute right-0 bottom-0 w-4 h-4 cursor-nwse-resize z-10"
        onMouseDown={handleMouseDown}
      />
    </div>
  );
};

export default XYResizable;
