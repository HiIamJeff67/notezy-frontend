import * as PopoverPrimitive from "@radix-ui/react-popover";
import type { GetAllMySubShelvesByRootShelfIdResponse } from "@shared/api/interfaces/subShelf.interface";
import toast from "@shared/lib/toast";
import { CopyIcon, PlusIcon, Trash2Icon } from "lucide-react";
import type { Dispatch, RefObject, SetStateAction } from "react";
import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { PatternBlock } from "./RoutineTaskPayloadEditor";

interface RoutineTaskPayloadEditorSidebarProps {
  purpose: string;
  rootShelfNodes: Array<{ id: string; name: string }>;
  selectedTargetSubShelf?: { id: string; name: string };
  targetSubShelfPickerTriggerRef: RefObject<HTMLButtonElement | null>;
  targetSubShelfPickerPortalContainer: Element | null;
  isTargetSubShelfPickerOpen: boolean;
  setIsTargetSubShelfPickerOpen: Dispatch<SetStateAction<boolean>>;
  setTargetSubShelfPickerPortalContainer: Dispatch<
    SetStateAction<Element | null>
  >;
  activeRootShelfId: string | null;
  setActiveRootShelfId: Dispatch<SetStateAction<string | null>>;
  subShelvesByRootShelfId: Record<
    string,
    GetAllMySubShelvesByRootShelfIdResponse["data"]
  >;
  targetSubShelfId: string;
  setTargetSubShelfId: Dispatch<SetStateAction<string>>;
  templateName: string;
  setTemplateName: Dispatch<SetStateAction<string>>;
  blockGroupId: string;
  setBlockGroupId: Dispatch<SetStateAction<string>>;
  parentBlockId: string;
  setParentBlockId: Dispatch<SetStateAction<string>>;
  blockId: string;
  setBlockId: Dispatch<SetStateAction<string>>;
  patternBlocks: PatternBlock[];
  availablePatternBlocks: PatternBlock[];
  setPatternBlocks: Dispatch<SetStateAction<PatternBlock[]>>;
  onAddPatternBlock: (patternBlock: PatternBlock) => void;
  selectedPatternIds: Set<string>;
  setSelectedPatternIds: Dispatch<SetStateAction<Set<string>>>;
  payloadPreview: string;
}

const RoutineTaskPayloadEditorSidebar = ({
  purpose,
  rootShelfNodes,
  selectedTargetSubShelf,
  targetSubShelfPickerTriggerRef,
  targetSubShelfPickerPortalContainer,
  isTargetSubShelfPickerOpen,
  setIsTargetSubShelfPickerOpen,
  setTargetSubShelfPickerPortalContainer,
  activeRootShelfId,
  setActiveRootShelfId,
  subShelvesByRootShelfId,
  targetSubShelfId,
  setTargetSubShelfId,
  templateName,
  setTemplateName,
  blockGroupId,
  setBlockGroupId,
  parentBlockId,
  setParentBlockId,
  blockId,
  setBlockId,
  patternBlocks,
  availablePatternBlocks,
  setPatternBlocks,
  onAddPatternBlock,
  selectedPatternIds,
  setSelectedPatternIds,
  payloadPreview,
}: RoutineTaskPayloadEditorSidebarProps) => {
  const [isPatternBlockPickerOpen, setIsPatternBlockPickerOpen] =
    useState(false);
  const [selectedAvailablePatternIds, setSelectedAvailablePatternIds] =
    useState<Set<string>>(new Set());
  const availableUnselectedPatternBlocks = availablePatternBlocks.filter(
    availablePatternBlock =>
      !patternBlocks.some(
        patternBlock => patternBlock.id === availablePatternBlock.id
      )
  );

  return (
    <aside className="flex max-h-[72vh] min-h-0 flex-col gap-4 overflow-y-auto border-r bg-muted/60 p-4">
      {purpose === "CreateBlockPack" && (
        <>
          <div className="flex flex-col gap-2">
            <Label>Target SubShelf</Label>
            <PopoverPrimitive.Root
              open={isTargetSubShelfPickerOpen}
              onOpenChange={open => {
                if (open) {
                  setTargetSubShelfPickerPortalContainer(
                    targetSubShelfPickerTriggerRef.current?.closest(
                      '[data-slot="dialog-content"], [data-slot="sheet-content"]'
                    ) ?? null
                  );
                }
                setIsTargetSubShelfPickerOpen(open);
              }}
            >
              <PopoverPrimitive.Trigger asChild>
                <Button
                  ref={targetSubShelfPickerTriggerRef}
                  type="button"
                  variant="outline"
                  className="w-full justify-start rounded-sm"
                >
                  <span className="truncate">
                    {selectedTargetSubShelf?.name ? (
                      selectedTargetSubShelf.name
                    ) : (
                      <span className="text-muted-foreground">
                        Select SubShelf
                      </span>
                    )}
                  </span>
                </Button>
              </PopoverPrimitive.Trigger>
              <PopoverPrimitive.Portal
                container={targetSubShelfPickerPortalContainer}
              >
                <PopoverPrimitive.Content
                  align="start"
                  sideOffset={4}
                  className="z-[190] w-[560px] origin-[--radix-popover-content-transform-origin] overflow-hidden rounded-sm border bg-popover p-0 text-popover-foreground shadow-md outline-none data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95"
                >
                  <div className="grid h-80 grid-cols-[220px_minmax(0,1fr)]">
                    <div className="min-w-0 space-y-1.5 overflow-y-auto border-r p-2">
                      <div className="px-2 py-1.5 text-muted-foreground text-xs">
                        Root shelves
                      </div>
                      {rootShelfNodes.length === 0 ? (
                        <div className="px-2 py-6 text-center text-muted-foreground text-xs">
                          No root shelves loaded
                        </div>
                      ) : (
                        rootShelfNodes.map(rootShelfNode => (
                          <Button
                            key={rootShelfNode.id}
                            type="button"
                            variant="ghost"
                            className={`h-8 w-full justify-start rounded-sm px-2 text-left text-sm ${
                              activeRootShelfId === rootShelfNode.id
                                ? "bg-accent text-accent-foreground"
                                : ""
                            }`}
                            onClick={() =>
                              setActiveRootShelfId(rootShelfNode.id)
                            }
                          >
                            <span className="truncate">
                              {rootShelfNode.name}
                            </span>
                          </Button>
                        ))
                      )}
                    </div>
                    <div className="min-w-0 space-y-1.5 overflow-y-auto p-2">
                      <div className="px-2 py-1.5 text-muted-foreground text-xs">
                        SubShelves
                      </div>
                      {!activeRootShelfId ? (
                        <div className="px-2 py-6 text-center text-muted-foreground text-xs">
                          Select a RootShelf
                        </div>
                      ) : subShelvesByRootShelfId[activeRootShelfId]?.length ? (
                        subShelvesByRootShelfId[activeRootShelfId].map(
                          subShelf => (
                            <Button
                              key={subShelf.id}
                              type="button"
                              variant="ghost"
                              className={`h-8 w-full justify-start rounded-sm px-2 text-left text-sm ${
                                targetSubShelfId === subShelf.id
                                  ? "bg-accent text-accent-foreground"
                                  : ""
                              }`}
                              onClick={() => {
                                setTargetSubShelfId(subShelf.id);
                                setIsTargetSubShelfPickerOpen(false);
                              }}
                            >
                              <span className="truncate">{subShelf.name}</span>
                            </Button>
                          )
                        )
                      ) : (
                        <div className="px-2 py-6 text-center text-muted-foreground text-xs">
                          {subShelvesByRootShelfId[activeRootShelfId]
                            ? "No SubShelves"
                            : "Loading SubShelves"}
                        </div>
                      )}
                    </div>
                  </div>
                </PopoverPrimitive.Content>
              </PopoverPrimitive.Portal>
            </PopoverPrimitive.Root>
          </div>
          <div className="flex flex-col gap-2">
            <Label>Template Name</Label>
            <Input
              value={templateName}
              onChange={event => setTemplateName(event.currentTarget.value)}
            />
          </div>
        </>
      )}
      {purpose === "CreateBlock" && (
        <>
          <div className="flex flex-col gap-2">
            <Label>Block group id</Label>
            <Input
              value={blockGroupId}
              onChange={event => setBlockGroupId(event.currentTarget.value)}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label>Parent block id</Label>
            <Input
              value={parentBlockId}
              onChange={event => setParentBlockId(event.currentTarget.value)}
              placeholder="Optional"
            />
          </div>
        </>
      )}
      {purpose === "UpdateBlock" && (
        <div className="flex flex-col gap-2">
          <Label>Block id</Label>
          <Input
            value={blockId}
            onChange={event => setBlockId(event.currentTarget.value)}
          />
        </div>
      )}

      <div className="relative flex items-start justify-between gap-3">
        <div>
          <div className="text-sm font-semibold">Pattern Table</div>
          <div className="text-xs text-muted-foreground">
            Manage reusable values generated from selected blocks.
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <PopoverPrimitive.Root
            modal
            open={isPatternBlockPickerOpen}
            onOpenChange={open => {
              if (!open) {
                setSelectedAvailablePatternIds(new Set());
              }
              setIsPatternBlockPickerOpen(open);
            }}
          >
            <PopoverPrimitive.Trigger asChild>
              <Button type="button" variant="ghost" size="icon">
                <PlusIcon className="size-4" />
              </Button>
            </PopoverPrimitive.Trigger>
            <PopoverPrimitive.Portal>
              <PopoverPrimitive.Content
                align="end"
                side="bottom"
                sideOffset={6}
                collisionPadding={16}
                className="z-[220] flex h-72 w-[480px] origin-[--radix-popover-content-transform-origin] flex-col overflow-hidden rounded-sm border bg-popover p-0 text-popover-foreground shadow-md outline-none data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95"
              >
                <div className="shrink-0 border-b px-3 py-2">
                  <div className="text-sm font-semibold">Select Block</div>
                  <div className="text-xs text-muted-foreground">
                    Choose a block to add into Pattern Table.
                  </div>
                </div>
                <div className="min-h-0 flex-1 p-2">
                  <div className="h-full overflow-y-auto rounded-sm border px-2 py-1">
                    <Table className="table-fixed">
                      <TableHeader>
                        <TableRow>
                          <TableHead className="h-8 w-8 p-1.5"></TableHead>
                          <TableHead className="h-8 w-24 p-1.5">ID</TableHead>
                          <TableHead className="h-8 w-24 p-1.5">Type</TableHead>
                          <TableHead className="h-8 p-1.5">Name</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {availableUnselectedPatternBlocks.length === 0 ? (
                          <TableRow>
                            <TableCell
                              colSpan={4}
                              className="p-5 text-center text-xs text-muted-foreground"
                            >
                              No available blocks
                            </TableCell>
                          </TableRow>
                        ) : (
                          availableUnselectedPatternBlocks.map(
                            availablePatternBlock => (
                              <TableRow
                                key={availablePatternBlock.id}
                                className="transition-none hover:bg-transparent"
                              >
                                <TableCell className="p-1.5">
                                  <Checkbox
                                    checked={selectedAvailablePatternIds.has(
                                      availablePatternBlock.id
                                    )}
                                    onCheckedChange={checked => {
                                      setSelectedAvailablePatternIds(
                                        previousSelectedAvailablePatternIds => {
                                          const nextSelectedAvailablePatternIds =
                                            new Set(
                                              previousSelectedAvailablePatternIds
                                            );
                                          if (checked) {
                                            nextSelectedAvailablePatternIds.add(
                                              availablePatternBlock.id
                                            );
                                          } else {
                                            nextSelectedAvailablePatternIds.delete(
                                              availablePatternBlock.id
                                            );
                                          }
                                          return nextSelectedAvailablePatternIds;
                                        }
                                      );
                                    }}
                                    onClick={event => event.stopPropagation()}
                                  />
                                </TableCell>
                                <TableCell
                                  className="w-24 cursor-pointer overflow-hidden whitespace-nowrap p-1.5 font-mono text-[11px] hover:text-foreground"
                                  title={availablePatternBlock.id}
                                  onClick={() => {
                                    void navigator.clipboard
                                      .writeText(availablePatternBlock.id)
                                      .then(() =>
                                        toast.success("Block id copied")
                                      )
                                      .catch(() =>
                                        toast.error("Unable to copy block id")
                                      );
                                  }}
                                >
                                  {availablePatternBlock.id.length > 8
                                    ? availablePatternBlock.id.slice(0, 8)
                                    : availablePatternBlock.id}
                                </TableCell>
                                <TableCell
                                  className="w-24 cursor-pointer truncate p-1.5 text-xs hover:text-foreground"
                                  onClick={() => {
                                    void navigator.clipboard
                                      .writeText(
                                        JSON.stringify(
                                          availablePatternBlock,
                                          null,
                                          2
                                        )
                                      )
                                      .then(() => toast.success("Block copied"))
                                      .catch(() =>
                                        toast.error("Unable to copy block")
                                      );
                                  }}
                                >
                                  {availablePatternBlock.type}
                                </TableCell>
                                <TableCell
                                  className="cursor-pointer truncate p-1.5 text-xs hover:text-foreground"
                                  title={availablePatternBlock.label}
                                  onClick={() => {
                                    void navigator.clipboard
                                      .writeText(
                                        JSON.stringify(
                                          availablePatternBlock,
                                          null,
                                          2
                                        )
                                      )
                                      .then(() => toast.success("Block copied"))
                                      .catch(() =>
                                        toast.error("Unable to copy block")
                                      );
                                  }}
                                >
                                  {availablePatternBlock.label}
                                </TableCell>
                              </TableRow>
                            )
                          )
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </div>
                <div className="flex shrink-0 justify-end gap-2 border-t px-3 py-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSelectedAvailablePatternIds(new Set());
                      setIsPatternBlockPickerOpen(false);
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    disabled={selectedAvailablePatternIds.size === 0}
                    onClick={() => {
                      availableUnselectedPatternBlocks.forEach(
                        availablePatternBlock => {
                          if (
                            selectedAvailablePatternIds.has(
                              availablePatternBlock.id
                            )
                          ) {
                            onAddPatternBlock(availablePatternBlock);
                          }
                        }
                      );
                      setSelectedAvailablePatternIds(new Set());
                      setIsPatternBlockPickerOpen(false);
                    }}
                  >
                    Confirm
                  </Button>
                </div>
              </PopoverPrimitive.Content>
            </PopoverPrimitive.Portal>
          </PopoverPrimitive.Root>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            disabled={selectedPatternIds.size === 0}
            onClick={() => {
              setPatternBlocks(previousPatternBlocks =>
                previousPatternBlocks.filter(
                  patternBlock => !selectedPatternIds.has(patternBlock.id)
                )
              );
              setSelectedPatternIds(new Set());
            }}
          >
            <Trash2Icon className="size-4" />
          </Button>
        </div>
      </div>

      <Separator />
      <div className="h-72 min-h-72 shrink-0 overflow-y-auto rounded-sm border bg-muted/35">
        <Table className="table-fixed">
          <TableHeader>
            <TableRow className="transition-none hover:bg-transparent">
              <TableHead className="h-8 w-8 p-1.5"></TableHead>
              <TableHead className="h-8 w-16 p-1.5">ID</TableHead>
              <TableHead className="h-8 w-20 p-1.5">Name</TableHead>
              <TableHead className="h-8 w-auto p-1.5">Reference</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {patternBlocks.length === 0 ? (
              <TableRow className="transition-none hover:bg-transparent">
                <TableCell
                  colSpan={4}
                  className="h-56 px-2 py-6 text-center text-xs text-muted-foreground"
                >
                  No pattern blocks
                </TableCell>
              </TableRow>
            ) : (
              patternBlocks.map(patternBlock => (
                <TableRow
                  key={patternBlock.id}
                  className="transition-none hover:bg-transparent"
                >
                  <TableCell className="p-1.5">
                    <Checkbox
                      checked={selectedPatternIds.has(patternBlock.id)}
                      onCheckedChange={checked => {
                        setSelectedPatternIds(previousSelectedIds => {
                          const nextSelectedIds = new Set(previousSelectedIds);
                          if (checked) {
                            nextSelectedIds.add(patternBlock.id);
                          } else {
                            nextSelectedIds.delete(patternBlock.id);
                          }
                          return nextSelectedIds;
                        });
                      }}
                    />
                  </TableCell>
                  <TableCell
                    className="w-16 cursor-pointer overflow-hidden whitespace-nowrap p-1.5 font-mono text-[11px] hover:text-foreground"
                    title={patternBlock.id}
                    onClick={() => {
                      void navigator.clipboard
                        .writeText(patternBlock.id)
                        .then(() => toast.success("Pattern block id copied"))
                        .catch(() =>
                          toast.error("Unable to copy pattern block id")
                        );
                    }}
                  >
                    {patternBlock.id.length > 8
                      ? patternBlock.id.slice(0, 8)
                      : patternBlock.id}
                  </TableCell>
                  <TableCell
                    className="w-20 truncate p-1.5 text-xs"
                    title={patternBlock.label}
                  >
                    {patternBlock.label}
                  </TableCell>
                  <TableCell className="min-w-0 p-1.5">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-7 w-full min-w-0 justify-start px-2 text-xs"
                        >
                          <span className="truncate">
                            {patternBlock.reference}
                          </span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="z-[190] w-48">
                        <DropdownMenuLabel className="text-muted-foreground">
                          Value
                        </DropdownMenuLabel>
                        {[
                          ["{{currentDate}}", "Current date"],
                          ["{{currentTime}}", "Current time"],
                          ["{{routineTitle}}", "Routine title"],
                          ["{{item.id}}", "Item id"],
                          ["{{item.name}}", "Item name"],
                          ["{{rootShelf.id}}", "RootShelf id"],
                          ["{{subShelf.id}}", "SubShelf id"],
                        ].map(([value, label]) => (
                          <DropdownMenuItem
                            key={value}
                            onSelect={() =>
                              setPatternBlocks(previousPatternBlocks =>
                                previousPatternBlocks.map(
                                  previousPatternBlock =>
                                    previousPatternBlock.id === patternBlock.id
                                      ? {
                                          ...previousPatternBlock,
                                          reference: value,
                                        }
                                      : previousPatternBlock
                                )
                              )
                            }
                          >
                            {label}
                          </DropdownMenuItem>
                        ))}
                        <DropdownMenuSeparator />
                        <div
                          className="flex flex-col gap-1.5 px-2 py-1.5"
                          onKeyDown={event => event.stopPropagation()}
                        >
                          <Label className="text-xs text-muted-foreground">
                            Custom string
                          </Label>
                          <Input
                            value={
                              patternBlock.reference.startsWith("{{")
                                ? ""
                                : patternBlock.reference
                            }
                            onChange={event =>
                              setPatternBlocks(previousPatternBlocks =>
                                previousPatternBlocks.map(
                                  previousPatternBlock =>
                                    previousPatternBlock.id === patternBlock.id
                                      ? {
                                          ...previousPatternBlock,
                                          reference: event.currentTarget.value,
                                        }
                                      : previousPatternBlock
                                )
                              )
                            }
                            className="h-8"
                            placeholder="Specific text"
                          />
                        </div>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onSelect={() =>
                            setPatternBlocks(previousPatternBlocks =>
                              previousPatternBlocks.map(previousPatternBlock =>
                                previousPatternBlock.id === patternBlock.id
                                  ? {
                                      ...previousPatternBlock,
                                      reference: patternBlock.id,
                                    }
                                  : previousPatternBlock
                              )
                            )
                          }
                        >
                          This block id
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      <Separator />

      <div className="flex shrink-0 flex-col gap-2">
        <div className="flex items-center justify-between">
          <Label>Payload Preview</Label>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => {
              void navigator.clipboard
                .writeText(payloadPreview)
                .then(() => toast.success("Payload preview copied"))
                .catch(() => toast.error("Unable to copy payload preview"));
            }}
          >
            <CopyIcon className="size-4" />
          </Button>
        </div>
        <pre className="min-h-24 whitespace-pre-wrap break-words rounded-sm border bg-background/45 p-3 font-mono text-[11px] text-foreground">
          {payloadPreview}
        </pre>
      </div>
    </aside>
  );
};

export default RoutineTaskPayloadEditorSidebar;
