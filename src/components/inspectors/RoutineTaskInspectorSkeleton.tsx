import { Skeleton } from "@/components/ui/skeleton";

const RoutineTaskInspectorSkeleton = () => (
  <div className="flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto px-6 py-5">
    <div className="flex flex-col gap-2">
      <Skeleton className="h-4 w-16" />
      <Skeleton className="h-10 w-full rounded-sm" />
    </div>
    <div className="flex flex-col gap-2">
      <Skeleton className="h-4 w-20" />
      <Skeleton className="h-10 w-full rounded-sm" />
    </div>
    <div className="flex gap-4">
      <div className="flex flex-1 flex-col gap-2">
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-10 w-full rounded-sm" />
      </div>
      <div className="flex flex-1 flex-col gap-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-10 w-full rounded-sm" />
      </div>
    </div>
    <div className="flex flex-col gap-2">
      <Skeleton className="h-4 w-32" />
      <Skeleton className="h-10 w-full rounded-sm" />
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-4 w-2/3" />
    </div>
    <div className="flex flex-col gap-2">
      <Skeleton className="h-4 w-20" />
      <Skeleton className="h-40 w-full rounded-sm" />
      <Skeleton className="h-9 w-28 rounded-sm" />
    </div>
    <Skeleton className="h-12 w-full rounded-sm" />
    <Skeleton className="h-12 w-full rounded-sm" />
  </div>
);

export default RoutineTaskInspectorSkeleton;
