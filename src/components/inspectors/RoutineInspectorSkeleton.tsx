import { Skeleton } from "@/components/ui/skeleton";

const RoutineInspectorSkeleton = () => (
  <div className="flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto px-6 py-5">
    <div className="flex flex-col gap-2">
      <Skeleton className="h-4 w-16" />
      <Skeleton className="h-10 w-full rounded-sm" />
    </div>
    <div className="flex flex-col gap-2">
      <Skeleton className="h-4 w-24" />
      <Skeleton className="h-48 w-full rounded-sm" />
    </div>
    <div className="flex flex-col gap-2">
      <Skeleton className="h-4 w-16" />
      <Skeleton className="h-10 w-full rounded-sm" />
    </div>
    <Skeleton className="h-16 w-full rounded-sm" />
    <div className="flex flex-col gap-2">
      <Skeleton className="h-4 w-16" />
      <Skeleton className="h-10 w-full rounded-sm" />
      <Skeleton className="h-4 w-12" />
      <Skeleton className="h-10 w-full rounded-sm" />
    </div>
    <div className="flex flex-col gap-2">
      <Skeleton className="h-4 w-16" />
      <Skeleton className="h-10 w-full rounded-sm" />
    </div>
  </div>
);

export default RoutineInspectorSkeleton;
