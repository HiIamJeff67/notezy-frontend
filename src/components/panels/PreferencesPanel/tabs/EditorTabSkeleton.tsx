import { Skeleton } from "@/components/ui/skeleton";

const EditorTabSkeleton = () => (
  <div className="grid items-start gap-4 lg:grid-cols-[1fr_300px]">
    <section>
      <div className="flex items-center justify-between border-b border-border/50 py-3">
        <Skeleton className="h-4 w-28" />
      </div>
      <div>
        {[160, 160, 224, 160, 96, 96, 96, 96].map((width, index) => (
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
      <div className="mt-4 rounded-sm border border-border bg-muted/40 p-4">
        <Skeleton className="h-5 w-36" />
        <Skeleton className="mt-3 h-4 w-full" />
        <Skeleton className="mt-2 h-4 w-48" />
        <div className="mt-4 flex flex-wrap gap-2">
          {[0, 1, 2].map(index => (
            <Skeleton key={index} className="h-7 w-16 rounded-sm" />
          ))}
        </div>
      </div>
    </section>
  </div>
);

export default EditorTabSkeleton;
