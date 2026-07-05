import { Skeleton } from "@/components/ui/skeleton";

const StationInspectorSkeleton = () => (
  <div className="flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto px-6 py-5">
    <div className="flex flex-col gap-2">
      <Skeleton className="h-4 w-16" />
      <Skeleton className="h-10 w-full rounded-sm" />
    </div>
    <div className="flex flex-col gap-2">
      <Skeleton className="h-4 w-24" />
      <Skeleton className="h-48 w-full rounded-sm" />
    </div>
    <div className="flex items-end gap-4">
      <div className="flex shrink-0 flex-col gap-2">
        <Skeleton className="h-4 w-12" />
        <Skeleton className="size-10 rounded-sm" />
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-10 w-full rounded-sm" />
      </div>
    </div>
  </div>
);

export default StationInspectorSkeleton;
