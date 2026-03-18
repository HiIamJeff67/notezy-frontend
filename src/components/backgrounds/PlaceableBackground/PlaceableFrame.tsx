interface PlaceableFrameProps {
  className?: string;
  children?: (leftFrameCount: number, topFrameCount: number) => React.ReactNode;
  frameSize: number;
  leftFrameCount: number;
  topFrameCount: number;
  widthFrameCount: number;
  heightFrameCount: number;
  horizontalGap: number;
  verticalGap: number;
  isActive?: boolean; // 是否可放置
  isDisabled?: boolean; // 是否被佔用
  onClick?: () => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}

const PlaceableFrame = ({
  className = "",
  children,
  frameSize,
  leftFrameCount,
  topFrameCount,
  widthFrameCount,
  heightFrameCount,
  horizontalGap,
  verticalGap,
  isActive = false,
  isDisabled = false,
  onClick,
  onMouseEnter,
  onMouseLeave,
}: PlaceableFrameProps) => {
  return (
    <div
      className={`
        w-16 h-16 rounded transition
        ${isActive && "border-2 border-dotted border-foreground/50"}
        ${isDisabled && "bg-gray-200 opacity-50 cursor-not-allowed"}
        ${className}
      `}
      style={{
        left: leftFrameCount * frameSize + horizontalGap,
        top: topFrameCount * frameSize + verticalGap,
        width: widthFrameCount * frameSize - horizontalGap,
        height: heightFrameCount * frameSize - verticalGap,
      }}
      onClick={isDisabled ? undefined : onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {children && children(leftFrameCount, topFrameCount)}
    </div>
  );
};

export default PlaceableFrame;
