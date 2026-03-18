import XIcon from "@/components/icons/XIcon";
import React, { CSSProperties } from "react";

interface CloseableProps {
  children?: React.ReactNode;
  className?: string;
  style?: CSSProperties;
  closeButtonClassName?: string;
  iconSize?: number;
  displayCloseButton?: boolean;
  onClose: () => void | Promise<void>;
}

const Closeable = ({
  children,
  className = "w-16 h-16",
  style,
  closeButtonClassName = "top-1 left-1 w-3 h-3",
  iconSize = 8,
  displayCloseButton = true,
  onClose,
}: CloseableProps) => {
  return (
    <div
      className={`rounded-lg bg-muted flex items-center justify-center overflow-hidden border border-border ${className}`}
      style={style}
    >
      {displayCloseButton && (
        <button // we don't use <Button /> component here, since it will cause some padding or margin like UI problem
          className={`absolute flex justify-center items-center rounded-full bg-(--destructive) ${closeButtonClassName}`}
          onClick={onClose}
          type="button"
        >
          <XIcon size={iconSize} />
        </button>
      )}
      {children}
    </div>
  );
};

export default Closeable;
