import { Skeleton } from "@/components/ui/skeleton";

const AppearanceTabSkeleton = () => (
  <div className="grid items-start gap-4 lg:grid-cols-[1fr_280px]">
    <section>
      <div>
        {[180, 180, 220, 96, 96].map((width, index) => (
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
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-6 w-20 rounded-sm" />
      </div>
      <div className="mt-4 space-y-3 rounded-sm border border-border bg-muted/40 p-3">
        <div className="rounded-sm border border-border bg-card p-3">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <Skeleton className="h-2 w-24" />
              <Skeleton className="h-2 w-36" />
            </div>
            <Skeleton className="h-5 w-9 rounded-full" />
          </div>
          <div className="mt-3 flex gap-2">
            <Skeleton className="h-7 w-16 rounded-sm" />
            <Skeleton className="h-7 w-16 rounded-sm" />
            <Skeleton className="size-4 rounded-sm" />
          </div>
        </div>
        <div className="rounded-sm border border-border bg-card p-3">
          <Skeleton className="h-7 w-32 rounded-md" />
          <div className="mt-3 flex items-center gap-2">
            <Skeleton className="h-8 flex-1 rounded-sm" />
          </div>
        </div>
      </div>
    </section>
  </div>
);

export default AppearanceTabSkeleton;
