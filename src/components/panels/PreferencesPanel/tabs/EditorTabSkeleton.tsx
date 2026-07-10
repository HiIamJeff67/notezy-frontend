import { Skeleton } from "@/components/ui/skeleton";

const EditorTabSkeleton = () => (
  <div className="grid items-start gap-4 lg:grid-cols-[1fr_300px]">
    <section>
      <div>
        {[160, 224, 96, 96, 96, 96].map((width, index) => (
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
      <div className="mt-4 space-y-3 rounded-sm border border-border bg-muted/40 p-3">
        <div className="rounded-sm border border-border bg-card p-3">
          <Skeleton className="ml-7 h-6 w-40" />
          <Skeleton className="ml-7 mt-3 h-4 w-full" />
          <Skeleton className="ml-7 mt-2 h-4 w-44" />
        </div>
        <div className="rounded-sm border border-border bg-card p-3">
          {[0, 1].map(index => (
            <div key={index} className="flex items-center gap-3 py-1.5">
              <Skeleton className="size-4 rounded-sm" />
              <Skeleton className="h-4 flex-1" />
            </div>
          ))}
        </div>
      </div>
    </section>
  </div>
);

export default EditorTabSkeleton;
