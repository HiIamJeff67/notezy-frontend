import XIcon from "@/components/icons/XIcon";
import React, { CSSProperties } from "react";

interface CloseableProps {
  children?: React.ReactNode;
  className?: string;
  style?: CSSProperties;
  closeButtonProps?: {
    className?: string;
    disabled?: boolean;
    size?: number;
  };
  onClose: () => void | Promise<void>;
}

const Closeable = ({
  children,
  className = "w-16 h-16",
  style,
  closeButtonProps,
  onClose,
}: CloseableProps) => {
  return (
    <div
      className={`
        relative w-full h-full overflow-hidden
        flex justify-center items-center
        bg-muted border-border rounded-lg
        ${className}
      `}
      style={style}
    >
      {(closeButtonProps === undefined ||
        closeButtonProps.disabled === undefined ||
        !closeButtonProps.disabled) && (
        <button // we don't use <Button /> component here, since it will cause some padding or margin like UI problem
          className={`
            absolute top-1 left-1 w-3 h-3
            flex justify-center items-center
            rounded-full bg-(--destructive) transition
            ${closeButtonProps && closeButtonProps.className}
          `}
          onClick={onClose}
          type="button"
        >
          <XIcon size={(closeButtonProps && closeButtonProps.size) ?? 8} />
        </button>
      )}
      {children}
    </div>
  );
};

export default Closeable;
