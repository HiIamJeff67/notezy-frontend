interface PlaceableFrameProps {
  className?: string;
  children?: React.ReactNode;
  frameSize: number;
  // note that the value of position and size, and gap are based on the frame size
  position: {
    leftFrameCount: number;
    topFrameCount: number;
  };
  size: {
    widthFrameCount: number;
    heightFrameCount: number;
  };
  gap: {
    horizontal: number;
    vertical: number;
  };
  isActive?: boolean;
  onClick: (position: {
    leftFrameCount: number;
    topFrameCount: number;
  }) => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}

const PlaceableFrame = ({
  className = "",
  children,
  frameSize,
  position,
  size,
  gap,
  isActive = false,
  onClick,
  onMouseEnter,
  onMouseLeave,
}: PlaceableFrameProps) => {
  return (
    <div
      className={`
        w-16 h-16 rounded-lg transition flex justify-center items-center
        ${isActive ? "border-2 border-dotted border-foreground/50" : "invisible"}
        ${className}
      `}
      style={{
        left: position.leftFrameCount * frameSize + gap.horizontal,
        top: position.topFrameCount * frameSize + gap.vertical,
        width: size.widthFrameCount * frameSize - gap.horizontal,
        height: size.heightFrameCount * frameSize - gap.vertical,
      }}
      onClick={isActive ? () => onClick(position) : undefined}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {children}
    </div>
  );
};

export default PlaceableFrame;
