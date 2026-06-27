import { BlockNoteEditor } from "@blocknote/core";
import { useGetAllMySubShelvesByRootShelfId } from "@shared/api/hooks/subShelf.hook";
import { RoutineTaskPurpose } from "@shared/api/interfaces/enums";
import { GetAllMySubShelvesByRootShelfIdResponse } from "@shared/api/interfaces/subShelf.interface";
import { convertBlocksToJSON } from "@shared/util/convertBlocksToFiles";
import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useShelfItem } from "@/hooks";
import RoutineTaskPayloadEditorSidebar from "./RoutineTaskPayloadEditorSidebar";
import RoutineTaskPayloadTemplateEditor from "./RoutineTaskPayloadTemplateEditor";
// @ts-ignore allow side-effect import of BlockNote
import "@blocknote/core/style.css";

export interface PatternBlock {
  id: string;
  type: string;
  label: string;
  reference: string;
}

interface RoutineTaskPayloadEditorProps {
  isOpen: boolean;
  purpose: RoutineTaskPurpose;
  initialPayload: string;
  onClose: () => void;
  onConfirm: (payload: string) => void;
}

const RoutineTaskPayloadEditor = ({
  isOpen,
  purpose,
  initialPayload,
  onClose,
  onConfirm,
}: RoutineTaskPayloadEditorProps) => {
  const shelfItemManager = useShelfItem();
  const getAllSubShelvesByRootShelfIdQuerier =
    useGetAllMySubShelvesByRootShelfId();
  const loadingSubShelvesByRootShelfIdRef = useRef<Set<string>>(new Set());
  const targetSubShelfPickerTriggerRef = useRef<HTMLButtonElement>(null);
  const didInitializeOpenDialogRef = useRef(false);
  const parsedInitialPayload = useMemo(() => {
    try {
      return initialPayload.trim().length === 0
        ? {}
        : JSON.parse(initialPayload);
    } catch {
      return {};
    }
  }, [initialPayload]);

  const [targetSubShelfId, setTargetSubShelfId] = useState<string>(
    typeof parsedInitialPayload.targetSubShelfId === "string"
      ? parsedInitialPayload.targetSubShelfId
      : ""
  );
  const [subShelvesByRootShelfId, setSubShelvesByRootShelfId] = useState<
    Record<string, GetAllMySubShelvesByRootShelfIdResponse["data"]>
  >({});
  const [isTargetSubShelfPickerOpen, setIsTargetSubShelfPickerOpen] =
    useState(false);
  const [
    targetSubShelfPickerPortalContainer,
    setTargetSubShelfPickerPortalContainer,
  ] = useState<Element | null>(null);
  const [activeRootShelfId, setActiveRootShelfId] = useState<string | null>(
    null
  );
  const [templateName, setTemplateName] = useState<string>(
    typeof parsedInitialPayload.template?.name === "string"
      ? parsedInitialPayload.template.name
      : "Routine block pack"
  );
  const [blockPackId, setBlockPackId] = useState<string>(
    typeof parsedInitialPayload.blockPackId === "string"
      ? parsedInitialPayload.blockPackId
      : ""
  );
  const [blockGroupId, setBlockGroupId] = useState<string>(
    typeof parsedInitialPayload.blockGroupId === "string"
      ? parsedInitialPayload.blockGroupId
      : ""
  );
  const [parentBlockId, setParentBlockId] = useState<string>(
    typeof parsedInitialPayload.parentBlockId === "string"
      ? parsedInitialPayload.parentBlockId
      : ""
  );
  const [blockId, setBlockId] = useState<string>(
    typeof parsedInitialPayload.blockId === "string"
      ? parsedInitialPayload.blockId
      : ""
  );
  const [rawPayload, setRawPayload] = useState<string>(
    JSON.stringify(parsedInitialPayload, null, 2)
  );
  const [selectedPatternIds, setSelectedPatternIds] = useState<Set<string>>(
    new Set()
  );
  const [patternBlocks, setPatternBlocks] = useState<PatternBlock[]>([]);
  const [payloadPreview, setPayloadPreview] = useState<string>(
    JSON.stringify(parsedInitialPayload, null, 2)
  );
  const [editorVersion, setEditorVersion] = useState(0);

  const editor = useMemo(
    () =>
      BlockNoteEditor.create({
        initialContent: [
          {
            id: crypto.randomUUID(),
            type: "paragraph",
            content: [],
          },
        ],
        trailingBlock: false,
      }),
    []
  );

  const usesBlockLiteEditor =
    purpose === RoutineTaskPurpose.CreateBlockPack ||
    purpose === RoutineTaskPurpose.CreateBlock ||
    purpose === RoutineTaskPurpose.UpdateBlock;
  const isDeleteBlockPack = purpose === RoutineTaskPurpose.DeleteBlockPack;
  const isDeleteBlock = purpose === RoutineTaskPurpose.DeleteBlock;
  const rootShelfNodes = shelfItemManager.expandedShelves
    .values()
    .map(shelfTreeSummary => shelfTreeSummary.root);
  const selectedTargetSubShelf = Object.values(subShelvesByRootShelfId)
    .flat()
    .find(subShelf => subShelf.id === targetSubShelfId);
  const availablePatternBlocks = useMemo(() => {
    const patternBlocksFromEditor: PatternBlock[] = [];
    const blocks: any[] = [...editor.document];

    while (blocks.length > 0) {
      const block = blocks.shift();
      if (!block) continue;

      patternBlocksFromEditor.push({
        id: block.id,
        type: block.type,
        label: Array.isArray(block.content)
          ? block.content
              .map((content: any) => {
                if (content.type === "text") {
                  return content.text;
                }
                if (content.type === "link" && Array.isArray(content.content)) {
                  return content.content
                    .map((linkContent: any) => linkContent.text ?? "")
                    .join("");
                }
                return "";
              })
              .join("")
              .trim() || block.type
          : block.type,
        reference: "{{customString}}",
      });

      if (Array.isArray(block.children)) {
        blocks.unshift(...block.children);
      }
    }

    return patternBlocksFromEditor;
  }, [editor, editorVersion]);

  const addPatternBlock = (nextPatternBlock: PatternBlock) => {
    setPatternBlocks(previousPatternBlocks => {
      if (
        previousPatternBlocks.some(
          patternBlock => patternBlock.id === nextPatternBlock.id
        )
      ) {
        return previousPatternBlocks;
      }

      return [...previousPatternBlocks, nextPatternBlock];
    });
  };

  const removePatternBlock = (blockId: string) => {
    setPatternBlocks(previousPatternBlocks =>
      previousPatternBlocks.filter(patternBlock => patternBlock.id !== blockId)
    );
    setSelectedPatternIds(previousSelectedPatternIds => {
      if (!previousSelectedPatternIds.has(blockId)) {
        return previousSelectedPatternIds;
      }

      const nextSelectedPatternIds = new Set(previousSelectedPatternIds);
      nextSelectedPatternIds.delete(blockId);
      return nextSelectedPatternIds;
    });
  };

  useEffect(() => {
    if (!isTargetSubShelfPickerOpen) return;

    if (rootShelfNodes.length === 0) {
      setActiveRootShelfId(null);
      return;
    }

    if (
      !activeRootShelfId ||
      !rootShelfNodes.some(
        rootShelfNode => rootShelfNode.id === activeRootShelfId
      )
    ) {
      setActiveRootShelfId(rootShelfNodes[0].id);
    }
  }, [
    activeRootShelfId,
    isTargetSubShelfPickerOpen,
    rootShelfNodes.length,
    rootShelfNodes[0]?.id,
  ]);

  useEffect(() => {
    if (
      !isTargetSubShelfPickerOpen ||
      !activeRootShelfId ||
      subShelvesByRootShelfId[activeRootShelfId] ||
      loadingSubShelvesByRootShelfIdRef.current.has(activeRootShelfId)
    ) {
      return;
    }

    loadingSubShelvesByRootShelfIdRef.current.add(activeRootShelfId);
    void getAllSubShelvesByRootShelfIdQuerier
      .fetch({
        param: {
          rootShelfId: activeRootShelfId,
          areDeleted: false,
        },
      })
      .then(response =>
        setSubShelvesByRootShelfId(previousSubShelvesByRootShelfId => ({
          ...previousSubShelvesByRootShelfId,
          [activeRootShelfId]: response.data,
        }))
      )
      .finally(() =>
        loadingSubShelvesByRootShelfIdRef.current.delete(activeRootShelfId)
      );
  }, [activeRootShelfId, isTargetSubShelfPickerOpen, subShelvesByRootShelfId]);

  useEffect(() => {
    if (!isOpen) {
      didInitializeOpenDialogRef.current = false;
      return;
    }
    if (didInitializeOpenDialogRef.current) return;
    didInitializeOpenDialogRef.current = true;

    setTargetSubShelfId(
      typeof parsedInitialPayload.targetSubShelfId === "string"
        ? parsedInitialPayload.targetSubShelfId
        : ""
    );
    setTemplateName(
      typeof parsedInitialPayload.template?.name === "string"
        ? parsedInitialPayload.template.name
        : "Routine block pack"
    );
    setBlockPackId(
      typeof parsedInitialPayload.blockPackId === "string"
        ? parsedInitialPayload.blockPackId
        : ""
    );
    setBlockGroupId(
      typeof parsedInitialPayload.blockGroupId === "string"
        ? parsedInitialPayload.blockGroupId
        : ""
    );
    setParentBlockId(
      typeof parsedInitialPayload.parentBlockId === "string"
        ? parsedInitialPayload.parentBlockId
        : ""
    );
    setBlockId(
      typeof parsedInitialPayload.blockId === "string"
        ? parsedInitialPayload.blockId
        : ""
    );
    setRawPayload(JSON.stringify(parsedInitialPayload, null, 2));
    setSelectedPatternIds(new Set());
    setPatternBlocks(
      parsedInitialPayload.pattern &&
        typeof parsedInitialPayload.pattern === "object"
        ? Object.values(parsedInitialPayload.pattern).map((pattern: any) => ({
            id:
              typeof pattern.blockId === "string"
                ? pattern.blockId
                : typeof pattern.id === "string"
                  ? pattern.id
                  : crypto.randomUUID(),
            type: typeof pattern.type === "string" ? pattern.type : "block",
            label:
              typeof pattern.label === "string" ? pattern.label : "Pattern",
            reference:
              typeof pattern.reference === "string"
                ? pattern.reference
                : "{{customString}}",
          }))
        : []
    );
    setPayloadPreview(JSON.stringify(parsedInitialPayload, null, 2));

    const blocks =
      purpose === RoutineTaskPurpose.CreateBlockPack &&
      Array.isArray(parsedInitialPayload.template?.blockGroups)
        ? parsedInitialPayload.template.blockGroups.map(
            (blockGroup: any) => blockGroup.arborizedEditableBlock
          )
        : (purpose === RoutineTaskPurpose.CreateBlock ||
              purpose === RoutineTaskPurpose.UpdateBlock) &&
            parsedInitialPayload.arborizedEditableBlock
          ? [parsedInitialPayload.arborizedEditableBlock]
          : [
              {
                id: crypto.randomUUID(),
                type: "paragraph",
                content: [],
              },
            ];
    editor.replaceBlocks(
      editor.document.map(block => block.id),
      blocks
    );
    setEditorVersion(version => version + 1);
  }, [editor, isOpen, parsedInitialPayload, purpose]);

  useEffect(() => {
    if (!isOpen || !usesBlockLiteEditor) return;
    return editor.onChange(() => setEditorVersion(version => version + 1));
  }, [editor, isOpen, usesBlockLiteEditor]);

  const normalizeBlock = (block: any): any => {
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return {
      id: uuidRegex.test(block.id) ? block.id : crypto.randomUUID(),
      type: block.type,
      props: block.props ?? {},
      content: block.content ?? [],
      children: Array.isArray(block.children)
        ? block.children.map((child: any) => normalizeBlock(child))
        : [],
    };
  };

  const buildBlockPayload = async () => {
    const jsonBlob = await convertBlocksToJSON(editor);
    const blocks = JSON.parse(await jsonBlob.text());
    const normalizedBlocks = blocks.map((block: any) => normalizeBlock(block));
    const firstBlock = normalizedBlocks[0] ?? {
      id: crypto.randomUUID(),
      type: "paragraph",
      props: {},
      content: [],
      children: [],
    };

    if (purpose === RoutineTaskPurpose.CreateBlockPack) {
      const blockGroups = normalizedBlocks.map((block: any) => ({
        clientId: crypto.randomUUID(),
        arborizedEditableBlock: {
          ...block,
          children: [...(block.children ?? [])],
        },
      }));

      return {
        targetSubShelfId,
        template: {
          name: templateName.trim() || "Routine block pack",
          icon: null,
          headerBackgroundURL: null,
          finalBlockGroupClientId: null,
          blockGroups: blockGroups.map((blockGroup: any, index: number) => ({
            ...blockGroup,
            prevClientId: index === 0 ? null : blockGroups[index - 1].clientId,
          })),
        },
        pattern: patternBlocks.reduce<Record<string, unknown>>(
          (pattern, patternBlock) => {
            pattern[patternBlock.id] = {
              blockId: patternBlock.id,
              type: patternBlock.type,
              label: patternBlock.label,
              reference: patternBlock.reference,
            };
            return pattern;
          },
          {}
        ),
      };
    }

    if (purpose === RoutineTaskPurpose.CreateBlock) {
      return {
        blockGroupId,
        parentBlockId: parentBlockId.trim().length > 0 ? parentBlockId : null,
        arborizedEditableBlock: firstBlock,
      };
    }

    return {
      blockId,
      arborizedEditableBlock: firstBlock,
    };
  };

  useEffect(() => {
    if (!isOpen) return;

    let isCanceled = false;
    void (async () => {
      if (usesBlockLiteEditor) {
        const payload = JSON.stringify(await buildBlockPayload(), null, 2);
        if (!isCanceled) setPayloadPreview(payload);
        return;
      }

      if (isDeleteBlockPack) {
        setPayloadPreview(JSON.stringify({ blockPackId }, null, 2));
        return;
      }

      if (isDeleteBlock) {
        setPayloadPreview(JSON.stringify({ blockId }, null, 2));
        return;
      }

      try {
        setPayloadPreview(JSON.stringify(JSON.parse(rawPayload), null, 2));
      } catch {
        setPayloadPreview(rawPayload);
      }
    })();

    return () => {
      isCanceled = true;
    };
  }, [
    blockGroupId,
    blockId,
    blockPackId,
    editorVersion,
    isDeleteBlock,
    isDeleteBlockPack,
    isOpen,
    parentBlockId,
    patternBlocks,
    rawPayload,
    targetSubShelfId,
    templateName,
    usesBlockLiteEditor,
  ]);

  return (
    <Dialog open={isOpen} onOpenChange={open => !open && onClose()}>
      <DialogContent
        className={
          usesBlockLiteEditor
            ? "z-[180] max-h-[92vh] !w-[min(1600px,97vw)] !max-w-none gap-0 overflow-hidden rounded-sm bg-muted p-0"
            : "max-h-[90vh] overflow-visible rounded-sm bg-muted sm:max-w-xl"
        }
      >
        <DialogHeader
          className={usesBlockLiteEditor ? "border-b px-5 py-4" : ""}
        >
          <DialogTitle>Payload editor</DialogTitle>
          <DialogDescription>
            Build the payload for {purpose}. Backend cost is authoritative.
          </DialogDescription>
        </DialogHeader>

        {usesBlockLiteEditor ? (
          <div className="grid min-h-0 flex-1 grid-cols-[500px_minmax(0,1fr)] overflow-hidden">
            <RoutineTaskPayloadEditorSidebar
              purpose={purpose}
              rootShelfNodes={rootShelfNodes}
              selectedTargetSubShelf={selectedTargetSubShelf}
              targetSubShelfPickerTriggerRef={targetSubShelfPickerTriggerRef}
              targetSubShelfPickerPortalContainer={
                targetSubShelfPickerPortalContainer
              }
              isTargetSubShelfPickerOpen={isTargetSubShelfPickerOpen}
              setIsTargetSubShelfPickerOpen={setIsTargetSubShelfPickerOpen}
              setTargetSubShelfPickerPortalContainer={
                setTargetSubShelfPickerPortalContainer
              }
              activeRootShelfId={activeRootShelfId}
              setActiveRootShelfId={setActiveRootShelfId}
              subShelvesByRootShelfId={subShelvesByRootShelfId}
              targetSubShelfId={targetSubShelfId}
              setTargetSubShelfId={setTargetSubShelfId}
              templateName={templateName}
              setTemplateName={setTemplateName}
              blockGroupId={blockGroupId}
              setBlockGroupId={setBlockGroupId}
              parentBlockId={parentBlockId}
              setParentBlockId={setParentBlockId}
              blockId={blockId}
              setBlockId={setBlockId}
              patternBlocks={patternBlocks}
              availablePatternBlocks={availablePatternBlocks}
              setPatternBlocks={setPatternBlocks}
              onAddPatternBlock={addPatternBlock}
              selectedPatternIds={selectedPatternIds}
              setSelectedPatternIds={setSelectedPatternIds}
              payloadPreview={payloadPreview}
            />
            <RoutineTaskPayloadTemplateEditor
              editor={editor}
              payloadPreview={payloadPreview}
              patternBlockIds={
                new Set(patternBlocks.map(patternBlock => patternBlock.id))
              }
              onAddPatternBlock={addPatternBlock}
              onRemovePatternBlock={removePatternBlock}
              onClose={onClose}
              onConfirm={onConfirm}
            />
          </div>
        ) : (
          <>
            {isDeleteBlockPack ? (
              <div className="flex flex-col gap-2">
                <Label>Block pack id</Label>
                <Input
                  value={blockPackId}
                  onChange={event => setBlockPackId(event.currentTarget.value)}
                />
              </div>
            ) : isDeleteBlock ? (
              <div className="flex flex-col gap-2">
                <Label>Block id</Label>
                <Input
                  value={blockId}
                  onChange={event => setBlockId(event.currentTarget.value)}
                />
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                <Label>Raw JSON payload</Label>
                <Textarea
                  value={rawPayload}
                  onChange={event => setRawPayload(event.currentTarget.value)}
                  className="min-h-64 font-mono text-xs"
                />
              </div>
            )}
            <DialogFooter>
              <span className="mr-auto self-center text-xs text-muted-foreground">
                Estimated payload cost:{" "}
                {Math.ceil(new Blob([payloadPreview]).size / 1024)} CostUnits
              </span>
              <Button type="button" variant="destructive" onClick={onClose}>
                Cancel
              </Button>
              <Button
                type="button"
                onClick={() => {
                  JSON.parse(payloadPreview);
                  onConfirm(
                    JSON.stringify(JSON.parse(payloadPreview), null, 2)
                  );
                  onClose();
                }}
              >
                Confirm
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default RoutineTaskPayloadEditor;
