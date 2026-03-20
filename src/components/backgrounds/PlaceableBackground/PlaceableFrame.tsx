import Droppable from "@/components/commons/Droppable/Droppable";
import { DNDType } from "@shared/enums";
import { DropTargetMonitor } from "react-dnd";

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
  disabled?: boolean;
  droppableProps: {
    type: DNDType;
    hover?: (item: any, monitor: DropTargetMonitor) => void;
    canDrop?: (
      item: any,
      monitor: DropTargetMonitor,
      position: {
        leftFrameCount: number;
        topFrameCount: number;
      }
    ) => boolean;
    drop?: (
      item: any,
      monitor: DropTargetMonitor,
      position: {
        leftFrameCount: number;
        topFrameCount: number;
      }
    ) => void;
    collect?: (monitor: DropTargetMonitor) => Record<string, any>;
  };
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
  disabled = true,
  droppableProps,
  onClick,
  onMouseEnter,
  onMouseLeave,
}: PlaceableFrameProps) => {
  return (
    <Droppable
      type={droppableProps.type}
      hover={droppableProps.hover}
      canDrop={(item: any, monitor: DropTargetMonitor): boolean => {
        return (
          droppableProps.canDrop === undefined ||
          droppableProps.canDrop(item, monitor, position)
        );
      }}
      drop={(item: any, monitor: DropTargetMonitor) => {
        if (droppableProps.drop) droppableProps.drop(item, monitor, position);
      }}
      className=""
    >
      <div
        className={`
        w-16 h-16 rounded-lg transition flex justify-center items-center
        ${disabled ? "invisible" : "border-2 border-dotted border-foreground/50"}
        ${className}
      `}
        style={{
          left: position.leftFrameCount * frameSize + gap.horizontal,
          top: position.topFrameCount * frameSize + gap.vertical,
          width: size.widthFrameCount * frameSize - gap.horizontal,
          height: size.heightFrameCount * frameSize - gap.vertical,
        }}
        onClick={disabled ? undefined : () => onClick(position)}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
      >
        {children}
      </div>
    </Droppable>
  );
};

export default PlaceableFrame;
