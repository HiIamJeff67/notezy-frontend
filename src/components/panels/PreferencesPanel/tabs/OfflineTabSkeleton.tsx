import { Skeleton } from "@/components/ui/skeleton";

const OfflineTabSkeleton = () => (
  <div className="grid items-start gap-4 lg:grid-cols-[1fr_300px]">
    <section>
      <div className="flex items-center justify-between border-b border-border/50 py-3">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-6 w-20 rounded-sm" />
      </div>
      <div>
        {[96, 96, 96, 224].map((width, index) => (
          <div
            key={`${width}-${index}`}
            className="flex items-center justify-between border-b border-border/50 py-3 last:border-b-0"
          >
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-9 rounded-sm" style={{ width }} />
          </div>
        ))}
      </div>
    </section>

    <section className="rounded-md border border-border bg-card p-4">
      <Skeleton className="h-4 w-24" />
      <Skeleton className="mt-5 h-2 w-full rounded-full" />
      <div className="mt-3 flex items-center justify-between">
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-3 w-20" />
      </div>
      <div className="mt-5 grid grid-cols-2 gap-2">
        <Skeleton className="h-16 rounded-sm" />
        <Skeleton className="h-16 rounded-sm" />
      </div>
    </section>
  </div>
);

export default OfflineTabSkeleton;
