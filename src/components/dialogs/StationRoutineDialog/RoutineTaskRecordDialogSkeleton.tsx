import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";

interface RoutineTaskRecordDialogSkeletonProps {
  isOpen: boolean;
  onClose: () => void;
}

const RoutineTaskRecordDialogSkeleton = ({
  isOpen,
  onClose,
}: RoutineTaskRecordDialogSkeletonProps) => (
  <Dialog open={isOpen} onOpenChange={open => !open && onClose()}>
    <DialogContent className="flex max-h-[82vh] flex-col gap-0 overflow-visible rounded-md bg-muted p-0 sm:max-w-5xl">
      <DialogHeader className="shrink-0 border-b border-border px-6 py-5 pr-12">
        <DialogTitle>Routine task records</DialogTitle>
        <DialogDescription>
          <Skeleton className="h-4 w-56" />
        </DialogDescription>
      </DialogHeader>
      <div className="flex shrink-0 flex-wrap gap-2 border-b border-border px-4 py-3">
        <Skeleton className="h-8 w-32 rounded-sm" />
        <Skeleton className="h-8 w-40 rounded-sm" />
        <Skeleton className="h-8 w-40 rounded-sm" />
        <Skeleton className="h-8 w-40 rounded-sm" />
      </div>
      <div className="space-y-2 p-4">
        <Skeleton className="h-9 w-full rounded-sm" />
        {Array.from({ length: 8 }).map((_, index) => (
          <Skeleton key={index} className="h-10 w-full rounded-sm" />
        ))}
      </div>
    </DialogContent>
  </Dialog>
);

export default RoutineTaskRecordDialogSkeleton;
