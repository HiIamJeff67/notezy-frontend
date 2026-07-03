import { BlockNoteEditor } from "@blocknote/core";
import { RoutineTaskPurpose } from "@shared/api/interfaces/enums";
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
import type { RoutineTaskNamePattern } from "../NamePatternEditor";
import CreateBlockPackPayloadEditorSidebar from "./CreateBlockPackPayloadEditorSidebar";
import CreateBlockPackPayloadTemplateEditor from "./CreateBlockPackPayloadTemplateEditor";
// @ts-ignore allow side-effect import of BlockNote
import "@blocknote/core/style.css";

export interface PatternBlock {
  id: string;
  type: string;
  label: string;
  reference: string;
}

export interface SelectedBlockPayloadTarget {
  id: string;
  type: string;
  props: unknown;
  content: unknown;
  contentText: string;
}

interface CreateBlockPackPayloadEditorProps {
  isOpen: boolean;
  purpose: RoutineTaskPurpose;
  initialPayload: string;
  onClose: () => void;
  onConfirm: (payload: string) => void;
}

const CreateBlockPackPayloadEditor = ({
  isOpen,
  purpose,
  initialPayload,
  onClose,
  onConfirm,
}: CreateBlockPackPayloadEditorProps) => {
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
  const [templateName, setTemplateName] = useState<string>(
    typeof parsedInitialPayload.template?.name === "string"
      ? parsedInitialPayload.template.name
      : "Routine block pack"
  );
  const [templateNamePattern, setTemplateNamePattern] =
    useState<RoutineTaskNamePattern>(
      parsedInitialPayload.template?.namePattern &&
        typeof parsedInitialPayload.template.namePattern === "object"
        ? parsedInitialPayload.template.namePattern
        : {}
    );
  const [blockPackId, setBlockPackId] = useState<string>(
    typeof parsedInitialPayload.blockPackId === "string"
      ? parsedInitialPayload.blockPackId
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
  const [selectedBlock, setSelectedBlock] =
    useState<SelectedBlockPayloadTarget | null>(null);
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
  const originalBlockEditor = useMemo(
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
    purpose === RoutineTaskPurpose.AppendBlock ||
    purpose === RoutineTaskPurpose.UpdateBlock;
  const usesPayloadSidebar =
    usesBlockLiteEditor || purpose === RoutineTaskPurpose.ResetBlock;
  const isResetBlockPack = purpose === RoutineTaskPurpose.ResetBlockPack;
  const isResetBlock = purpose === RoutineTaskPurpose.ResetBlock;
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
              .trim()
          : "",
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
    setTemplateNamePattern(
      parsedInitialPayload.template?.namePattern &&
        typeof parsedInitialPayload.template.namePattern === "object"
        ? parsedInitialPayload.template.namePattern
        : {}
    );
    setBlockPackId(
      typeof parsedInitialPayload.blockPackId === "string"
        ? parsedInitialPayload.blockPackId
        : ""
    );
    setBlockId(
      typeof parsedInitialPayload.blockId === "string"
        ? parsedInitialPayload.blockId
        : ""
    );
    setSelectedBlock(null);
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
            label: typeof pattern.label === "string" ? pattern.label : "",
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
        : (purpose === RoutineTaskPurpose.AppendBlock ||
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
    originalBlockEditor.replaceBlocks(
      originalBlockEditor.document.map(block => block.id),
      blocks.length > 0 ? [blocks[0]] : blocks
    );
    setEditorVersion(version => version + 1);
  }, [editor, originalBlockEditor, isOpen, parsedInitialPayload, purpose]);

  useEffect(() => {
    if (!isOpen || !usesBlockLiteEditor) return;
    return editor.onChange(() => {
      if (
        (purpose === RoutineTaskPurpose.AppendBlock ||
          purpose === RoutineTaskPurpose.UpdateBlock) &&
        editor.document.length > 1
      ) {
        editor.removeBlocks(editor.document.slice(1).map(block => block.id));
      }
      setEditorVersion(version => version + 1);
    });
  }, [editor, isOpen, purpose, usesBlockLiteEditor]);

  useEffect(() => {
    if (
      !isOpen ||
      purpose !== RoutineTaskPurpose.UpdateBlock ||
      !selectedBlock
    ) {
      return;
    }

    const block = {
      id: selectedBlock.id,
      type: selectedBlock.type
        .replace(/^BlockType_/, "")
        .replace(/^[A-Z]/, character => character.toLowerCase()),
      props: selectedBlock.props ?? {},
      content: Array.isArray(selectedBlock.content)
        ? selectedBlock.content
        : Array.isArray((selectedBlock.content as any)?.content)
          ? (selectedBlock.content as any).content
          : selectedBlock.contentText,
      children: [],
    };
    editor.replaceBlocks(
      editor.document.map(editorBlock => editorBlock.id),
      [block as any]
    );
    originalBlockEditor.replaceBlocks(
      originalBlockEditor.document.map(editorBlock => editorBlock.id),
      [block as any]
    );
    setEditorVersion(version => version + 1);
  }, [editor, originalBlockEditor, isOpen, purpose, selectedBlock]);

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
          ...(Object.keys(templateNamePattern).length > 0 && {
            namePattern: templateNamePattern,
          }),
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

    if (purpose === RoutineTaskPurpose.AppendBlock) {
      return { blockPackId, arborizedEditableBlock: firstBlock };
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

      if (isResetBlockPack) {
        setPayloadPreview(JSON.stringify({ blockPackId }, null, 2));
        return;
      }

      if (isResetBlock) {
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
    blockId,
    blockPackId,
    editorVersion,
    isResetBlock,
    isResetBlockPack,
    isOpen,
    patternBlocks,
    rawPayload,
    targetSubShelfId,
    templateName,
    templateNamePattern,
    usesBlockLiteEditor,
  ]);

  return (
    <Dialog open={isOpen} onOpenChange={open => !open && onClose()}>
      <DialogContent
        className={
          usesPayloadSidebar
            ? "z-[180] max-h-[92vh] !w-[min(1600px,97vw)] !max-w-none gap-0 overflow-hidden rounded-sm bg-muted p-0"
            : "max-h-[90vh] overflow-visible rounded-sm bg-muted sm:max-w-xl"
        }
      >
        <DialogHeader
          className={usesPayloadSidebar ? "border-b px-5 py-4" : ""}
        >
          <DialogTitle>Payload editor</DialogTitle>
          <DialogDescription>
            Build the payload for {purpose}. Backend cost is authoritative.
          </DialogDescription>
        </DialogHeader>

        {usesPayloadSidebar ? (
          <div className="grid min-h-0 flex-1 grid-cols-[500px_minmax(0,1fr)] overflow-hidden">
            <CreateBlockPackPayloadEditorSidebar
              purpose={purpose}
              targetSubShelfId={targetSubShelfId}
              setTargetSubShelfId={setTargetSubShelfId}
              templateName={templateName}
              setTemplateName={setTemplateName}
              templateNamePattern={templateNamePattern}
              setTemplateNamePattern={setTemplateNamePattern}
              blockPackId={blockPackId}
              setBlockPackId={setBlockPackId}
              blockId={blockId}
              setBlockId={setBlockId}
              setSelectedBlock={setSelectedBlock}
              patternBlocks={patternBlocks}
              availablePatternBlocks={availablePatternBlocks}
              setPatternBlocks={setPatternBlocks}
              onAddPatternBlock={addPatternBlock}
              selectedPatternIds={selectedPatternIds}
              setSelectedPatternIds={setSelectedPatternIds}
              payloadPreview={payloadPreview}
            />
            {usesBlockLiteEditor ? (
              <CreateBlockPackPayloadTemplateEditor
                editor={editor}
                originalBlockEditor={originalBlockEditor}
                purpose={purpose}
                payloadPreview={payloadPreview}
                patternBlockIds={
                  new Set(patternBlocks.map(patternBlock => patternBlock.id))
                }
                onAddPatternBlock={addPatternBlock}
                onRemovePatternBlock={removePatternBlock}
                onClose={onClose}
                onConfirm={onConfirm}
                isSaveDisabled={
                  purpose === RoutineTaskPurpose.CreateBlockPack &&
                  targetSubShelfId.trim().length === 0
                }
              />
            ) : (
              <main className="flex max-h-[72vh] min-h-0 flex-col overflow-hidden bg-background/30">
                <div className="min-h-0 flex-1 overflow-y-auto p-5">
                  <Label>Payload Preview</Label>
                  <pre className="mt-2 min-h-64 whitespace-pre-wrap break-words rounded-sm border bg-background/45 p-3 font-mono text-xs">
                    {payloadPreview}
                  </pre>
                </div>
                <DialogFooter className="min-h-10 border-t bg-muted/80 px-4 py-2">
                  <span className="mr-auto self-center text-xs text-muted-foreground">
                    Estimated payload cost:{" "}
                    {Math.ceil(new Blob([payloadPreview]).size / 1024)}{" "}
                    CostUnits
                  </span>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      onConfirm(payloadPreview);
                      onClose();
                    }}
                  >
                    Save
                  </Button>
                </DialogFooter>
              </main>
            )}
          </div>
        ) : (
          <>
            {isResetBlockPack ? (
              <div className="flex flex-col gap-2">
                <Label>Block pack id</Label>
                <Input
                  value={blockPackId}
                  onChange={event => setBlockPackId(event.currentTarget.value)}
                />
              </div>
            ) : isResetBlock ? (
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

export default CreateBlockPackPayloadEditor;
