import * as PopoverPrimitive from "@radix-ui/react-popover";
import {
  SearchRootShelfSortBy,
  SearchSortOrder,
  SearchStationSortBy,
  SearchSubShelfSortBy,
} from "@shared/api/graphql/generated/graphql";
import { useSearchRootShelvesLazyQuery } from "@shared/api/graphql/hooks/useSearchShelves";
import { useSearchStationsLazyQuery } from "@shared/api/graphql/hooks/useSearchStations";
import { useSearchSubShelvesLazyQuery } from "@shared/api/graphql/hooks/useSearchSubShelves";
import { cn } from "@shared/util/utils";
import type { UUID } from "crypto";
import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface SearchOptionDetail {
  label: string;
  value: string | number | boolean | null | undefined;
}

interface SearchOption {
  id: string;
  label: string;
  description?: string;
  details?: SearchOptionDetail[];
}

interface LoadSearchOptionsResult {
  options: SearchOption[];
  cursor: string | null;
  hasMore: boolean;
}

interface SearchPickerProps {
  label: string;
  placeholder: string;
  searchPlaceholder: string;
  emptyLabel: string;
  value: string;
  onValueChange: (id: string) => void;
  loadOptions: (input: {
    query: string;
    after?: string;
    first: number;
  }) => Promise<LoadSearchOptionsResult>;
}

const SearchOptionButton = ({
  option,
  isSelected,
  onSelect,
}: {
  option: SearchOption;
  isSelected: boolean;
  onSelect: () => void;
}) => (
  <HoverCard openDelay={250}>
    <HoverCardTrigger asChild>
      <Button
        type="button"
        variant="ghost"
        className={cn(
          "h-auto min-h-9 w-full justify-start rounded-sm px-2 py-1.5 text-left",
          isSelected && "bg-accent text-accent-foreground"
        )}
        onClick={onSelect}
      >
        <span className="min-w-0">
          <span className="block truncate text-sm">{option.label}</span>
          {option.description && (
            <span className="block truncate text-muted-foreground text-xs">
              {option.description}
            </span>
          )}
        </span>
      </Button>
    </HoverCardTrigger>
    <HoverCardContent
      side="right"
      align="start"
      className="z-[240] w-80 rounded-sm p-0"
    >
      <div className="border-b px-3 py-2">
        <p className="truncate text-sm font-medium">{option.label}</p>
        <p className="truncate font-mono text-muted-foreground text-xs">
          {option.id}
        </p>
      </div>
      <div className="max-h-72 overflow-y-auto px-3 py-2">
        {(option.details ?? []).length === 0 ? (
          <p className="text-muted-foreground text-xs">No extra metadata</p>
        ) : (
          <dl className="grid grid-cols-[112px_minmax(0,1fr)] gap-x-3 gap-y-1.5 text-xs">
            {option.details?.map(detail => {
              const value =
                detail.value === undefined
                  ? null
                  : detail.value === null || detail.value === ""
                    ? "None"
                    : String(detail.value);
              if (value === null) return null;
              return (
                <div key={detail.label} className="contents">
                  <dt className="text-muted-foreground">{detail.label}</dt>
                  <dd className="min-w-0 truncate font-mono" title={value}>
                    {value}
                  </dd>
                </div>
              );
            })}
          </dl>
        )}
      </div>
    </HoverCardContent>
  </HoverCard>
);

const SearchPicker = ({
  label,
  placeholder,
  searchPlaceholder,
  emptyLabel,
  value,
  onValueChange,
  loadOptions,
}: SearchPickerProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [options, setOptions] = useState<SearchOption[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedOption, setSelectedOption] = useState<SearchOption | null>(
    null
  );
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [portalContainer, setPortalContainer] = useState<HTMLElement | null>(
    null
  );
  const isLoadingRef = useRef(false);
  const lastRequestKeyRef = useRef<string | null>(null);

  const load = useCallback(
    async (reset: boolean) => {
      if (isLoadingRef.current) return;
      if (!reset && (!hasMore || !cursor)) return;

      const requestKey = `${reset ? "reset" : "page"}:${query.trim()}:${
        reset ? "" : cursor
      }`;
      if (lastRequestKeyRef.current === requestKey) return;
      lastRequestKeyRef.current = requestKey;

      isLoadingRef.current = true;
      setIsLoading(true);
      try {
        const result = await loadOptions({
          query: query.trim(),
          after: reset ? undefined : (cursor ?? undefined),
          first: reset ? 20 : 10,
        });

        setOptions(previousOptions => {
          if (reset) return result.options;
          const nextIds = new Set(result.options.map(option => option.id));
          return [
            ...previousOptions.filter(option => !nextIds.has(option.id)),
            ...result.options,
          ];
        });
        setCursor(result.cursor);
        setHasMore(result.hasMore);
      } finally {
        isLoadingRef.current = false;
        setIsLoading(false);
      }
    },
    [cursor, hasMore, loadOptions, query]
  );

  useEffect(() => {
    if (!isOpen) return;

    const timeout = window.setTimeout(() => {
      void load(true);
    }, 220);
    return () => window.clearTimeout(timeout);
  }, [isOpen, query]);

  useEffect(() => {
    if (!value || selectedOption?.id === value) return;
    setSelectedOption(null);
  }, [selectedOption?.id, value]);

  return (
    <div className="flex flex-col gap-2">
      <Label>{label}</Label>
      <PopoverPrimitive.Root
        open={isOpen}
        onOpenChange={open => {
          if (open) {
            setPortalContainer(
              (triggerRef.current?.closest(
                '[data-slot="dialog-content"], [data-slot="sheet-content"]'
              ) ?? null) as HTMLElement | null
            );
          }
          setIsOpen(open);
          if (!open) return;
          setQuery("");
          setOptions([]);
          setCursor(null);
          setHasMore(true);
          lastRequestKeyRef.current = null;
        }}
      >
        <PopoverPrimitive.Trigger asChild>
          <Button
            ref={triggerRef}
            type="button"
            variant="outline"
            className="w-full justify-start rounded-sm"
          >
            <span className="truncate">
              {selectedOption?.id === value ? (
                selectedOption.label
              ) : value ? (
                value.length > 8 ? (
                  value.slice(0, 8)
                ) : (
                  value
                )
              ) : (
                <span className="text-muted-foreground">{placeholder}</span>
              )}
            </span>
          </Button>
        </PopoverPrimitive.Trigger>
        <PopoverPrimitive.Portal container={portalContainer}>
          <PopoverPrimitive.Content
            align="start"
            sideOffset={4}
            className="z-[220] flex h-80 w-[420px] origin-[--radix-popover-content-transform-origin] flex-col overflow-hidden rounded-sm border bg-popover p-0 text-popover-foreground shadow-md outline-none data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95"
          >
            <div className="shrink-0 border-b p-2">
              <Input
                value={query}
                onChange={event => setQuery(event.currentTarget.value)}
                placeholder={searchPlaceholder}
                className="h-8"
              />
            </div>
            <div
              className="min-h-0 flex-1 overflow-y-auto p-2"
              onScroll={event => {
                const element = event.currentTarget;
                if (
                  element.scrollTop + element.clientHeight <
                  element.scrollHeight - 24
                ) {
                  return;
                }
                void load(false);
              }}
            >
              {options.length === 0 ? (
                <div className="px-2 py-8 text-center text-muted-foreground text-xs">
                  {isLoading ? "Searching" : emptyLabel}
                </div>
              ) : (
                <div className="space-y-1">
                  {options.map(option => (
                    <SearchOptionButton
                      key={option.id}
                      option={option}
                      isSelected={value === option.id}
                      onSelect={() => {
                        setSelectedOption(option);
                        onValueChange(option.id);
                        setIsOpen(false);
                      }}
                    />
                  ))}
                </div>
              )}
            </div>
            {hasMore && (
              <div className="shrink-0 border-t px-3 py-2 text-center text-muted-foreground text-xs">
                {isLoading ? "Loading more" : "Scroll to load more"}
              </div>
            )}
          </PopoverPrimitive.Content>
        </PopoverPrimitive.Portal>
      </PopoverPrimitive.Root>
    </div>
  );
};

export const RootShelfPicker = ({
  value,
  onValueChange,
  label = "Root shelf ID",
}: {
  value: string;
  onValueChange: (id: string) => void;
  label?: string;
}) => {
  const [executeSearchRootShelves] = useSearchRootShelvesLazyQuery();
  const loadOptions = useCallback(
    async ({
      query,
      after,
      first,
    }: {
      query: string;
      after?: string;
      first: number;
    }) => {
      const result = await executeSearchRootShelves({
        variables: {
          input: {
            query,
            after,
            first,
            sortBy: SearchRootShelfSortBy.LastUpdate,
            sortOrder: SearchSortOrder.Desc,
          },
        },
      }).retain();

      return {
        options:
          result.data?.searchRootShelves.searchEdges.map(edge => {
            const node = edge.node as unknown as {
              id: string;
              name: string;
              permission: string;
              subShelfCount: number;
              itemCount: number;
              lastAnalyzedAt: Date | string | number;
              deletedAt: Date | string | number | null;
              updatedAt: Date | string | number;
              createdAt: Date | string | number;
              ownerId: string;
              sharerIds: string[];
              itemIds: string[];
            };
            return {
              id: node.id,
              label: node.name,
              description: node.id,
              details: [
                { label: "Permission", value: node.permission },
                { label: "Sub shelves", value: node.subShelfCount },
                { label: "Items", value: node.itemCount },
                { label: "Owner ID", value: node.ownerId },
                { label: "Sharers", value: node.sharerIds?.length ?? 0 },
                { label: "Item IDs", value: node.itemIds?.length ?? 0 },
                {
                  label: "Last analyzed",
                  value: Number.isNaN(new Date(node.lastAnalyzedAt).getTime())
                    ? String(node.lastAnalyzedAt)
                    : new Date(node.lastAnalyzedAt).toLocaleString(),
                },
                {
                  label: "Updated",
                  value: Number.isNaN(new Date(node.updatedAt).getTime())
                    ? String(node.updatedAt)
                    : new Date(node.updatedAt).toLocaleString(),
                },
                {
                  label: "Created",
                  value: Number.isNaN(new Date(node.createdAt).getTime())
                    ? String(node.createdAt)
                    : new Date(node.createdAt).toLocaleString(),
                },
                {
                  label: "Deleted",
                  value:
                    node.deletedAt === null
                      ? "No"
                      : Number.isNaN(new Date(node.deletedAt).getTime())
                        ? String(node.deletedAt)
                        : new Date(node.deletedAt).toLocaleString(),
                },
              ],
            };
          }) ?? [],
        cursor:
          result.data?.searchRootShelves.searchPageInfo
            .endEncodedSearchCursor ?? null,
        hasMore:
          result.data?.searchRootShelves.searchPageInfo.hasNextPage ?? false,
      };
    },
    [executeSearchRootShelves]
  );

  return (
    <SearchPicker
      label={label}
      placeholder="Select RootShelf"
      searchPlaceholder="Search root shelves"
      emptyLabel="No RootShelves"
      value={value}
      onValueChange={onValueChange}
      loadOptions={loadOptions}
    />
  );
};

export const StationPicker = ({
  value,
  onValueChange,
  label = "Station ID",
}: {
  value: string;
  onValueChange: (id: string) => void;
  label?: string;
}) => {
  const [executeSearchStations] = useSearchStationsLazyQuery();
  const loadOptions = useCallback(
    async ({
      query,
      after,
      first,
    }: {
      query: string;
      after?: string;
      first: number;
    }) => {
      const result = await executeSearchStations({
        variables: {
          input: {
            query,
            after,
            first,
            sortBy: SearchStationSortBy.LastUpdate,
            sortOrder: SearchSortOrder.Desc,
          },
        },
      }).retain();

      return {
        options:
          result.data?.searchStations.searchEdges.map(edge => {
            const node = edge.node as unknown as {
              id: string;
              name: string;
              permission: string;
              icon: string | null;
              headerBackgroundURL: string | null;
              routineCount: number;
              deletedAt: Date | string | number | null;
              updatedAt: Date | string | number;
              createdAt: Date | string | number;
            };
            return {
              id: node.id,
              label: node.name,
              description: node.id,
              details: [
                { label: "Permission", value: node.permission },
                { label: "Routines", value: node.routineCount },
                { label: "Icon", value: node.icon },
                { label: "Header", value: node.headerBackgroundURL },
                {
                  label: "Updated",
                  value: Number.isNaN(new Date(node.updatedAt).getTime())
                    ? String(node.updatedAt)
                    : new Date(node.updatedAt).toLocaleString(),
                },
                {
                  label: "Created",
                  value: Number.isNaN(new Date(node.createdAt).getTime())
                    ? String(node.createdAt)
                    : new Date(node.createdAt).toLocaleString(),
                },
                {
                  label: "Deleted",
                  value:
                    node.deletedAt === null
                      ? "No"
                      : Number.isNaN(new Date(node.deletedAt).getTime())
                        ? String(node.deletedAt)
                        : new Date(node.deletedAt).toLocaleString(),
                },
              ],
            };
          }) ?? [],
        cursor:
          result.data?.searchStations.searchPageInfo.endEncodedSearchCursor ??
          null,
        hasMore:
          result.data?.searchStations.searchPageInfo.hasNextPage ?? false,
      };
    },
    [executeSearchStations]
  );

  return (
    <SearchPicker
      label={label}
      placeholder="Select Station"
      searchPlaceholder="Search stations"
      emptyLabel="No Stations"
      value={value}
      onValueChange={onValueChange}
      loadOptions={loadOptions}
    />
  );
};

export const SubShelfPicker = ({
  value,
  onValueChange,
  rootShelfId,
  label = "Sub shelf ID",
}: {
  value: string;
  onValueChange: (id: string) => void;
  rootShelfId?: string;
  label?: string;
}) => {
  const [executeSearchSubShelves] = useSearchSubShelvesLazyQuery();
  const loadOptions = useCallback(
    async ({
      query,
      after,
      first,
    }: {
      query: string;
      after?: string;
      first: number;
    }) => {
      const result = await executeSearchSubShelves({
        variables: {
          input: {
            query,
            after,
            first,
            ...(rootShelfId ? { rootShelfId: rootShelfId as UUID } : {}),
            sortBy: SearchSubShelfSortBy.LastUpdate,
            sortOrder: SearchSortOrder.Desc,
          },
        },
      }).retain();

      return {
        options:
          result.data?.searchSubShelves.searchEdges.map(edge => {
            const node = edge.node as unknown as {
              id: string;
              name: string;
              rootShelfId: string;
              prevSubShelfId: string | null;
              path: string[];
              deletedAt: Date | string | number | null;
              updatedAt: Date | string | number;
              createdAt: Date | string | number;
              nextSubShelfIds: string[];
              itemIds: string[];
            };
            return {
              id: node.id,
              label: node.name,
              description: `${node.id} · Root ${node.rootShelfId.length > 8 ? node.rootShelfId.slice(0, 8) : node.rootShelfId}`,
              details: [
                { label: "Root shelf", value: node.rootShelfId },
                { label: "Previous", value: node.prevSubShelfId },
                { label: "Path depth", value: node.path?.length ?? 0 },
                { label: "Children", value: node.nextSubShelfIds?.length ?? 0 },
                { label: "Items", value: node.itemIds?.length ?? 0 },
                {
                  label: "Updated",
                  value: Number.isNaN(new Date(node.updatedAt).getTime())
                    ? String(node.updatedAt)
                    : new Date(node.updatedAt).toLocaleString(),
                },
                {
                  label: "Created",
                  value: Number.isNaN(new Date(node.createdAt).getTime())
                    ? String(node.createdAt)
                    : new Date(node.createdAt).toLocaleString(),
                },
                {
                  label: "Deleted",
                  value:
                    node.deletedAt === null
                      ? "No"
                      : Number.isNaN(new Date(node.deletedAt).getTime())
                        ? String(node.deletedAt)
                        : new Date(node.deletedAt).toLocaleString(),
                },
              ],
            };
          }) ?? [],
        cursor:
          result.data?.searchSubShelves.searchPageInfo.endEncodedSearchCursor ??
          null,
        hasMore:
          result.data?.searchSubShelves.searchPageInfo.hasNextPage ?? false,
      };
    },
    [executeSearchSubShelves, rootShelfId]
  );

  return (
    <SearchPicker
      label={label}
      placeholder="Select SubShelf"
      searchPlaceholder="Search sub shelves"
      emptyLabel="No SubShelves"
      value={value}
      onValueChange={onValueChange}
      loadOptions={loadOptions}
    />
  );
};

export const ShelfLocationPicker = ({
  mode,
  label,
  placeholder,
  rootShelfId,
  subShelfId,
  onSelectRoot,
  onSelectSub,
}: {
  mode: "root-or-sub" | "sub-only";
  label: string;
  placeholder: string;
  rootShelfId: string;
  subShelfId: string;
  onSelectRoot?: (rootShelfId: string) => void;
  onSelectSub: (subShelfId: string, rootShelfId: string) => void;
}) => {
  const [executeSearchRootShelves] = useSearchRootShelvesLazyQuery({
    fetchPolicy: "network-only",
    nextFetchPolicy: "network-only",
  });
  const [executeSearchSubShelves] = useSearchSubShelvesLazyQuery({
    fetchPolicy: "network-only",
    nextFetchPolicy: "network-only",
  });
  const [isOpen, setIsOpen] = useState(false);
  const [rootQuery, setRootQuery] = useState("");
  const [subShelfQuery, setSubShelfQuery] = useState("");
  const [rootOptions, setRootOptions] = useState<SearchOption[]>([]);
  const [subShelfOptions, setSubShelfOptions] = useState<
    Array<SearchOption & { rootShelfId: string }>
  >([]);
  const [rootCursor, setRootCursor] = useState<string | null>(null);
  const [subShelfCursor, setSubShelfCursor] = useState<string | null>(null);
  const [hasMoreRoots, setHasMoreRoots] = useState(true);
  const [hasMoreSubShelves, setHasMoreSubShelves] = useState(true);
  const [isLoadingRoots, setIsLoadingRoots] = useState(false);
  const [isLoadingSubShelves, setIsLoadingSubShelves] = useState(false);
  const [activeRootShelfId, setActiveRootShelfId] = useState("");
  const [selectedRootOption, setSelectedRootOption] =
    useState<SearchOption | null>(null);
  const [selectedSubShelfOption, setSelectedSubShelfOption] =
    useState<SearchOption | null>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [portalContainer, setPortalContainer] = useState<HTMLElement | null>(
    null
  );
  const isLoadingRootsRef = useRef(false);
  const isLoadingSubShelvesRef = useRef(false);
  const lastRootRequestKeyRef = useRef<string | null>(null);
  const lastSubShelfRequestKeyRef = useRef<string | null>(null);

  const loadRoots = useCallback(
    async (reset: boolean) => {
      if (isLoadingRootsRef.current) return;
      if (!reset && (!hasMoreRoots || !rootCursor)) return;

      const requestKey = `${reset ? "reset" : "page"}:${rootQuery.trim()}:${
        reset ? "" : rootCursor
      }`;
      if (lastRootRequestKeyRef.current === requestKey) return;
      lastRootRequestKeyRef.current = requestKey;

      isLoadingRootsRef.current = true;
      setIsLoadingRoots(true);
      try {
        const result = await executeSearchRootShelves({
          variables: {
            input: {
              query: rootQuery.trim(),
              after: reset ? undefined : (rootCursor ?? undefined),
              first: reset ? 20 : 10,
              sortBy: SearchRootShelfSortBy.LastUpdate,
              sortOrder: SearchSortOrder.Desc,
            },
          },
        }).retain();
        const nextOptions =
          result.data?.searchRootShelves.searchEdges.map(edge => {
            const node = edge.node as unknown as {
              id: string;
              name: string;
              permission: string;
              subShelfCount: number;
              itemCount: number;
              lastAnalyzedAt: Date | string | number;
              deletedAt: Date | string | number | null;
              updatedAt: Date | string | number;
              createdAt: Date | string | number;
              ownerId: string;
              sharerIds: string[];
              itemIds: string[];
            };
            return {
              id: node.id,
              label: node.name,
              description: node.id,
              details: [
                { label: "Permission", value: node.permission },
                { label: "Sub shelves", value: node.subShelfCount },
                { label: "Items", value: node.itemCount },
                { label: "Owner ID", value: node.ownerId },
                { label: "Sharers", value: node.sharerIds?.length ?? 0 },
                { label: "Item IDs", value: node.itemIds?.length ?? 0 },
                {
                  label: "Last analyzed",
                  value: Number.isNaN(new Date(node.lastAnalyzedAt).getTime())
                    ? String(node.lastAnalyzedAt)
                    : new Date(node.lastAnalyzedAt).toLocaleString(),
                },
                {
                  label: "Updated",
                  value: Number.isNaN(new Date(node.updatedAt).getTime())
                    ? String(node.updatedAt)
                    : new Date(node.updatedAt).toLocaleString(),
                },
                {
                  label: "Created",
                  value: Number.isNaN(new Date(node.createdAt).getTime())
                    ? String(node.createdAt)
                    : new Date(node.createdAt).toLocaleString(),
                },
                {
                  label: "Deleted",
                  value:
                    node.deletedAt === null
                      ? "No"
                      : Number.isNaN(new Date(node.deletedAt).getTime())
                        ? String(node.deletedAt)
                        : new Date(node.deletedAt).toLocaleString(),
                },
              ],
            };
          }) ?? [];

        setRootOptions(previousOptions => {
          if (reset) return nextOptions;
          const nextIds = new Set(nextOptions.map(option => option.id));
          return [
            ...previousOptions.filter(option => !nextIds.has(option.id)),
            ...nextOptions,
          ];
        });
        setRootCursor(
          result.data?.searchRootShelves.searchPageInfo
            .endEncodedSearchCursor ?? null
        );
        setHasMoreRoots(
          result.data?.searchRootShelves.searchPageInfo.hasNextPage ?? false
        );
      } finally {
        isLoadingRootsRef.current = false;
        setIsLoadingRoots(false);
      }
    },
    [executeSearchRootShelves, hasMoreRoots, rootCursor, rootQuery]
  );

  const loadSubShelves = useCallback(
    async (reset: boolean) => {
      if (!activeRootShelfId) return;
      if (isLoadingSubShelvesRef.current) return;
      if (!reset && (!hasMoreSubShelves || !subShelfCursor)) return;

      const requestKey = `${activeRootShelfId}:${
        reset ? "reset" : "page"
      }:${subShelfQuery.trim()}:${reset ? "" : subShelfCursor}`;
      if (lastSubShelfRequestKeyRef.current === requestKey) return;
      lastSubShelfRequestKeyRef.current = requestKey;

      isLoadingSubShelvesRef.current = true;
      setIsLoadingSubShelves(true);
      try {
        const result = await executeSearchSubShelves({
          variables: {
            input: {
              rootShelfId: activeRootShelfId as UUID,
              query: subShelfQuery.trim(),
              after: reset ? undefined : (subShelfCursor ?? undefined),
              first: reset ? 20 : 10,
              sortBy: SearchSubShelfSortBy.LastUpdate,
              sortOrder: SearchSortOrder.Desc,
            },
          },
        }).retain();
        const nextOptions =
          result.data?.searchSubShelves.searchEdges.map(edge => {
            const node = edge.node as unknown as {
              id: string;
              name: string;
              rootShelfId: string;
              prevSubShelfId: string | null;
              path: string[];
              deletedAt: Date | string | number | null;
              updatedAt: Date | string | number;
              createdAt: Date | string | number;
              nextSubShelfIds: string[];
              itemIds: string[];
            };
            return {
              id: node.id,
              label: node.name,
              rootShelfId: node.rootShelfId,
              description: node.id,
              details: [
                { label: "Root shelf", value: node.rootShelfId },
                { label: "Previous", value: node.prevSubShelfId },
                { label: "Path depth", value: node.path?.length ?? 0 },
                { label: "Children", value: node.nextSubShelfIds?.length ?? 0 },
                { label: "Items", value: node.itemIds?.length ?? 0 },
                {
                  label: "Updated",
                  value: Number.isNaN(new Date(node.updatedAt).getTime())
                    ? String(node.updatedAt)
                    : new Date(node.updatedAt).toLocaleString(),
                },
                {
                  label: "Created",
                  value: Number.isNaN(new Date(node.createdAt).getTime())
                    ? String(node.createdAt)
                    : new Date(node.createdAt).toLocaleString(),
                },
                {
                  label: "Deleted",
                  value:
                    node.deletedAt === null
                      ? "No"
                      : Number.isNaN(new Date(node.deletedAt).getTime())
                        ? String(node.deletedAt)
                        : new Date(node.deletedAt).toLocaleString(),
                },
              ],
            };
          }) ?? [];

        setSubShelfOptions(previousOptions => {
          if (reset) return nextOptions;
          const nextIds = new Set(nextOptions.map(option => option.id));
          return [
            ...previousOptions.filter(option => !nextIds.has(option.id)),
            ...nextOptions,
          ];
        });
        setSubShelfCursor(
          result.data?.searchSubShelves.searchPageInfo.endEncodedSearchCursor ??
            null
        );
        setHasMoreSubShelves(
          result.data?.searchSubShelves.searchPageInfo.hasNextPage ?? false
        );
      } finally {
        isLoadingSubShelvesRef.current = false;
        setIsLoadingSubShelves(false);
      }
    },
    [
      activeRootShelfId,
      executeSearchSubShelves,
      hasMoreSubShelves,
      subShelfCursor,
      subShelfQuery,
    ]
  );

  useEffect(() => {
    if (!isOpen) return;
    const timeout = window.setTimeout(() => {
      void loadRoots(true);
    }, 220);
    return () => window.clearTimeout(timeout);
  }, [isOpen, rootQuery]);

  useEffect(() => {
    if (!isOpen || !activeRootShelfId) return;
    const timeout = window.setTimeout(() => {
      void loadSubShelves(true);
    }, 220);
    return () => window.clearTimeout(timeout);
  }, [activeRootShelfId, isOpen, subShelfQuery]);

  useEffect(() => {
    if (!isOpen) return;
    if (activeRootShelfId) return;
    if (rootShelfId) {
      setActiveRootShelfId(rootShelfId);
      return;
    }
    if (rootOptions[0]) {
      setActiveRootShelfId(rootOptions[0].id);
    }
  }, [activeRootShelfId, isOpen, rootOptions, rootShelfId]);

  useEffect(() => {
    setSubShelfOptions([]);
    setSubShelfCursor(null);
    setHasMoreSubShelves(true);
  }, [activeRootShelfId]);

  const triggerLabel = (() => {
    if (selectedSubShelfOption?.id === subShelfId) {
      return selectedSubShelfOption.label;
    }
    if (mode === "root-or-sub" && selectedRootOption?.id === rootShelfId) {
      return selectedRootOption.label;
    }
    if (subShelfId)
      return subShelfId.length > 8 ? subShelfId.slice(0, 8) : subShelfId;
    if (mode === "root-or-sub" && rootShelfId)
      return rootShelfId.length > 8 ? rootShelfId.slice(0, 8) : rootShelfId;
    return "";
  })();

  return (
    <div className="flex flex-col gap-2">
      <Label>{label}</Label>
      <PopoverPrimitive.Root
        open={isOpen}
        onOpenChange={open => {
          if (open) {
            setPortalContainer(
              (triggerRef.current?.closest(
                '[data-slot="dialog-content"], [data-slot="sheet-content"]'
              ) ?? null) as HTMLElement | null
            );
          }
          setIsOpen(open);
          if (!open) return;
          setRootQuery("");
          setSubShelfQuery("");
          setRootOptions([]);
          setSubShelfOptions([]);
          setRootCursor(null);
          setSubShelfCursor(null);
          setHasMoreRoots(true);
          setHasMoreSubShelves(true);
          lastRootRequestKeyRef.current = null;
          lastSubShelfRequestKeyRef.current = null;
          setActiveRootShelfId(rootShelfId);
        }}
      >
        <PopoverPrimitive.Trigger asChild>
          <Button
            ref={triggerRef}
            type="button"
            variant="outline"
            className="w-full justify-start rounded-sm"
          >
            <span className="truncate">
              {triggerLabel || (
                <span className="text-muted-foreground">{placeholder}</span>
              )}
            </span>
          </Button>
        </PopoverPrimitive.Trigger>
        <PopoverPrimitive.Portal container={portalContainer}>
          <PopoverPrimitive.Content
            align="start"
            sideOffset={4}
            className="z-[220] w-[620px] origin-[--radix-popover-content-transform-origin] overflow-hidden rounded-sm border bg-popover p-0 text-popover-foreground shadow-md outline-none data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95"
          >
            <div className="grid h-96 grid-cols-[240px_minmax(0,1fr)]">
              <div className="flex min-w-0 flex-col border-r">
                <div className="shrink-0 border-b p-2">
                  <Input
                    value={rootQuery}
                    onChange={event => setRootQuery(event.currentTarget.value)}
                    placeholder="Search root shelves"
                    className="h-8"
                  />
                </div>
                <div
                  className="min-h-0 flex-1 overflow-y-auto p-2"
                  onScroll={event => {
                    const element = event.currentTarget;
                    if (
                      element.scrollTop + element.clientHeight <
                      element.scrollHeight - 24
                    ) {
                      return;
                    }
                    void loadRoots(false);
                  }}
                >
                  <div className="px-2 py-1.5 text-muted-foreground text-xs">
                    Root shelves
                  </div>
                  {rootOptions.length === 0 ? (
                    <div className="px-2 py-8 text-center text-muted-foreground text-xs">
                      {isLoadingRoots ? "Searching" : "No RootShelves"}
                    </div>
                  ) : (
                    <div className="space-y-1">
                      {rootOptions.map(option => (
                        <SearchOptionButton
                          key={option.id}
                          option={option}
                          isSelected={activeRootShelfId === option.id}
                          onSelect={() => {
                            setActiveRootShelfId(option.id);
                            setSelectedRootOption(option);
                            if (mode === "root-or-sub") {
                              setSelectedSubShelfOption(null);
                              onSelectRoot?.(option.id);
                            }
                          }}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <div className="flex min-w-0 flex-col">
                <div className="shrink-0 border-b p-2">
                  <Input
                    value={subShelfQuery}
                    onChange={event =>
                      setSubShelfQuery(event.currentTarget.value)
                    }
                    placeholder="Search sub shelves"
                    className="h-8"
                    disabled={!activeRootShelfId}
                  />
                </div>
                <div
                  className="min-h-0 flex-1 overflow-y-auto p-2"
                  onScroll={event => {
                    const element = event.currentTarget;
                    if (
                      element.scrollTop + element.clientHeight <
                      element.scrollHeight - 24
                    ) {
                      return;
                    }
                    void loadSubShelves(false);
                  }}
                >
                  <div className="px-2 py-1.5 text-muted-foreground text-xs">
                    SubShelves
                  </div>
                  {!activeRootShelfId ? (
                    <div className="px-2 py-8 text-center text-muted-foreground text-xs">
                      Select a RootShelf
                    </div>
                  ) : subShelfOptions.length === 0 ? (
                    <div className="px-2 py-8 text-center text-muted-foreground text-xs">
                      {isLoadingSubShelves ? "Searching" : "No SubShelves"}
                    </div>
                  ) : (
                    <div className="space-y-1">
                      {subShelfOptions.map(option => (
                        <SearchOptionButton
                          key={option.id}
                          option={option}
                          isSelected={subShelfId === option.id}
                          onSelect={() => {
                            setSelectedSubShelfOption(option);
                            onSelectSub(option.id, option.rootShelfId);
                            setIsOpen(false);
                          }}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </PopoverPrimitive.Content>
        </PopoverPrimitive.Portal>
      </PopoverPrimitive.Root>
    </div>
  );
};
