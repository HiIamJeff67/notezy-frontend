import { Skeleton } from "@/components/ui/skeleton";

const AppearanceTabSkeleton = () => (
  <div className="grid gap-4 lg:grid-cols-[1fr_280px]">
    <section className="rounded-md border border-border bg-background/45">
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-6 w-16 rounded-sm" />
      </div>
      <div className="divide-y divide-border">
        {[180, 180, 220, 144, 96, 96].map((width, index) => (
          <div
            key={`${width}-${index}`}
            className="flex items-center justify-between px-4 py-3"
          >
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-9 rounded-sm" style={{ width }} />
          </div>
        ))}
      </div>
    </section>

    <section className="rounded-md border border-border bg-background/45 p-4">
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-6 w-20 rounded-sm" />
      </div>
      <div className="mt-4 rounded-sm border border-border bg-muted/40 p-3">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-2 w-24" />
            <Skeleton className="h-2 w-36" />
          </div>
          <Skeleton className="size-9 rounded-sm" />
        </div>
        <div className="mt-4 grid grid-cols-3 gap-2">
          {[0, 1, 2].map(index => (
            <Skeleton key={index} className="h-14 rounded-sm" />
          ))}
        </div>
      </div>
    </section>
  </div>
);

export default AppearanceTabSkeleton;
