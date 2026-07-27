import {
  type SearchBlockPacksQuery,
  type SearchMaterialsQuery,
  type SearchRootShelvesQuery,
  type SearchRoutinesQuery,
  type SearchStationsQuery,
  type SearchSubShelvesQuery,
} from "@shared/api/graphql/generated/graphql";
import { SearchIcon, Trash2Icon } from "lucide-react";
import { useDeferredValue, useEffect, useMemo, useState } from "react";
import {
  BlockPackIcon,
  MaterialIcon,
  RootShelfIcon,
  RoutineIcon,
  StationIcon,
  SubShelfIcon,
} from "@/components/icons/WorkspaceEntityIcons";
import { Input } from "@/components/ui/input";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

type TrashItemType =
  | "rootShelf"
  | "subShelf"
  | "material"
  | "blockPack"
  | "station"
  | "routine";

type TrashEntry = {
  id: string;
  name?: string;
  title?: string;
  deletedAt: Date | string | null | undefined;
  type: TrashItemType;
};

type TrashSearchData = {
  rootShelfSearch: SearchRootShelvesQuery;
  subShelfSearch: SearchSubShelvesQuery;
  materialSearch: SearchMaterialsQuery;
  blockPackSearch: SearchBlockPacksQuery;
  stationSearch: SearchStationsQuery;
  routineSearch: SearchRoutinesQuery;
};

const typeMetadata = {
  rootShelf: { icon: RootShelfIcon, label: "Root shelf" },
  subShelf: { icon: SubShelfIcon, label: "Sub shelf" },
  material: { icon: MaterialIcon, label: "Material" },
  blockPack: { icon: BlockPackIcon, label: "Block pack" },
  station: { icon: StationIcon, label: "Station" },
  routine: { icon: RoutineIcon, label: "Routine" },
} as const;

const TrashPage = ({
  query: initialQuery,
  searchData,
  onQueryChange,
}: {
  query: string;
  searchData: TrashSearchData;
  onQueryChange: (query: string) => void;
}) => {
  const [query, setQuery] = useState(initialQuery);
  const [selectedType, setSelectedType] = useState<TrashItemType | "all">(
    "all"
  );
  const deferredQuery = useDeferredValue(query);

  useEffect(() => {
    setQuery(initialQuery);
  }, [initialQuery]);

  useEffect(() => {
    if (deferredQuery !== initialQuery) onQueryChange(deferredQuery);
  }, [deferredQuery, initialQuery, onQueryChange]);

  const entries = useMemo<TrashEntry[]>(
    () => [
      ...searchData.rootShelfSearch.searchRootShelves.searchEdges.map(edge => {
        const node = edge.node as unknown as TrashEntry;
        return { ...node, type: "rootShelf" as const };
      }),
      ...searchData.subShelfSearch.searchSubShelves.searchEdges.map(edge => {
        const node = edge.node as unknown as TrashEntry;
        return { ...node, type: "subShelf" as const };
      }),
      ...searchData.materialSearch.searchMaterials.searchEdges.map(edge => {
        const node = edge.node as unknown as TrashEntry;
        return { ...node, type: "material" as const };
      }),
      ...searchData.blockPackSearch.searchBlockPacks.searchEdges.map(edge => {
        const node = edge.node as unknown as TrashEntry;
        return { ...node, type: "blockPack" as const };
      }),
      ...searchData.stationSearch.searchStations.searchEdges.map(edge => {
        const node = edge.node as unknown as TrashEntry;
        return { ...node, type: "station" as const };
      }),
      ...searchData.routineSearch.searchRoutines.searchEdges.map(edge => {
        const node = edge.node as unknown as TrashEntry;
        return {
          ...node,
          name: node.title,
          type: "routine" as const,
        };
      }),
    ],
    [searchData]
  );
  const visibleEntries = entries
    .filter(entry => selectedType === "all" || entry.type === selectedType)
    .sort(
      (left, right) =>
        new Date(right.deletedAt ?? 0).getTime() -
        new Date(left.deletedAt ?? 0).getTime()
    );
  return (
    <main className="h-full min-h-0 overflow-y-auto bg-canvas px-4 py-8 sm:px-6 lg:px-10">
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-8 pb-10">
        <header className="flex flex-col gap-3">
          <div className="flex items-center gap-3 text-muted-foreground">
            <Trash2Icon className="size-5" />
            <span className="font-mono text-xs uppercase tracking-[0.16em]">
              Workspace
            </span>
          </div>
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">垃圾桶</h1>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              查看已軟刪除的資料。還原與永久清除操作會在後端行為確認後加入。
            </p>
          </div>
        </header>

        <div className="relative">
          <SearchIcon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={event => setQuery(event.target.value)}
            placeholder="搜尋垃圾桶中的資料"
            className="pl-9"
          />
        </div>

        <div className="overflow-x-auto rounded-md border border-border bg-card p-1">
          <ToggleGroup
            type="single"
            value={selectedType}
            onValueChange={value => {
              if (value) setSelectedType(value as TrashItemType | "all");
            }}
            className="w-max min-w-full justify-start"
          >
            {[
              ["all", "全部"],
              ["rootShelf", "Root shelves"],
              ["subShelf", "Sub shelves"],
              ["material", "Materials"],
              ["blockPack", "Block packs"],
              ["station", "Stations"],
              ["routine", "Routines"],
            ].map(([value, label]) => (
              <ToggleGroupItem
                key={value}
                value={value}
                variant="outline"
                size="sm"
                className="h-8 flex-none rounded-sm px-3 text-xs data-[state=on]:bg-accent data-[state=on]:text-accent-foreground border-none"
              >
                {label}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </div>

        <section className="border-y border-border">
          {visibleEntries.length === 0 ? (
            <div className="flex min-h-48 flex-col items-center justify-center gap-2 text-center">
              <Trash2Icon className="size-6 text-muted-foreground" />
              <p className="text-sm font-medium">垃圾桶是空的</p>
              <p className="text-sm text-muted-foreground">
                沒有符合目前搜尋與類型篩選的已刪除資料。
              </p>
            </div>
          ) : (
            visibleEntries.map(entry => {
              const metadata = typeMetadata[entry.type];
              const Icon = metadata.icon;

              return (
                <div
                  key={`${entry.type}-${entry.id}`}
                  className="flex min-w-0 items-center gap-4 border-b border-border px-1 py-4 last:border-b-0"
                >
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
                    <Icon className="size-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">
                      {entry.name ?? entry.title ?? "Untitled"}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {metadata.label} · 已刪除於{" "}
                      {entry.deletedAt
                        ? new Date(entry.deletedAt).toLocaleString()
                        : "未知時間"}
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </section>
      </div>
    </main>
  );
};

export default TrashPage;
