import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { SelectSeparator } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import React, { CSSProperties } from "react";

const EditClockWidgetDialogSkeletonOption = ({
  className,
  style,
  titleWidth,
  descriptionWidth,
  alignment,
  children,
}: {
  className?: string;
  style?: CSSProperties;
  titleWidth?: string;
  descriptionWidth?: string;
  alignment?: "vertical" | "horizontal";
  children: React.ReactNode;
}) => {
  return (
    <div
      className={`flex gap-2
        ${
          alignment !== undefined && alignment === "vertical"
            ? `flex-col items-start`
            : `justify-between items-center`
        } ${className}`}
      style={style}
    >
      <div className="flex flex-col gap-1.5 w-full">
        <Skeleton className={`h-4 ${titleWidth || "w-16"}`} />
        <Skeleton className={`h-3 ${descriptionWidth || "w-48"}`} />
      </div>
      <div
        className={
          alignment !== undefined && alignment === "vertical" ? "w-full" : ""
        }
      >
        {children}
      </div>
    </div>
  );
};

export const EditClockWidgetDialogSkeleton = ({ open }: { open: boolean }) => {
  return (
    <Dialog open={open}>
      <DialogContent className="bg-muted border-1 border-border">
        <DialogHeader>
          <DialogTitle>編輯時鐘</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4 py-4">
          <EditClockWidgetDialogSkeletonOption
            titleWidth="w-10"
            descriptionWidth="w-64"
          >
            <Skeleton className="h-9 w-full min-w-[140px] rounded-md" />
          </EditClockWidgetDialogSkeletonOption>
          <SelectSeparator />

          <EditClockWidgetDialogSkeletonOption
            titleWidth="w-16"
            descriptionWidth="w-72"
          >
            <Skeleton className="h-9 w-full min-w-[140px] rounded-md" />
          </EditClockWidgetDialogSkeletonOption>
          <SelectSeparator />

          <EditClockWidgetDialogSkeletonOption
            titleWidth="w-24"
            descriptionWidth="w-60"
          >
            <Skeleton className="h-5 w-9 rounded-full shrink-0" />
          </EditClockWidgetDialogSkeletonOption>
          <SelectSeparator />

          <EditClockWidgetDialogSkeletonOption
            titleWidth="w-16"
            descriptionWidth="w-56"
          >
            <Skeleton className="h-5 w-9 rounded-full shrink-0" />
          </EditClockWidgetDialogSkeletonOption>
          <SelectSeparator />

          <EditClockWidgetDialogSkeletonOption
            titleWidth="w-32"
            descriptionWidth="w-56"
            alignment="vertical"
          >
            <div className="w-full py-1">
              <Skeleton className="h-2 w-full rounded-full" />
            </div>
          </EditClockWidgetDialogSkeletonOption>
          <SelectSeparator />

          <EditClockWidgetDialogSkeletonOption
            titleWidth="w-24"
            descriptionWidth="w-52"
            alignment="vertical"
          >
            <div className="w-full py-1">
              <Skeleton className="h-2 w-full rounded-full" />
            </div>
          </EditClockWidgetDialogSkeletonOption>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EditClockWidgetDialogSkeleton;
