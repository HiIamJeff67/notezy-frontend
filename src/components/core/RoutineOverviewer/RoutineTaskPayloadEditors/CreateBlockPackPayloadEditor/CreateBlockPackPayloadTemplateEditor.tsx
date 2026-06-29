import type { BlockNoteEditor } from "@blocknote/core";
import {
  AddBlockButton,
  DragHandleButton,
  SideMenu,
  SideMenuController,
} from "@blocknote/react";
import {
  BlockNoteView,
  components as blockNoteShadcnComponents,
} from "@blocknote/shadcn";
import { RoutineTaskPurpose } from "@shared/api/interfaces/enums";
import { Form, XIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DialogFooter } from "@/components/ui/dialog";
import type { PatternBlock } from "./CreateBlockPackPayloadEditor";

interface CreateBlockPackPayloadTemplateEditorProps {
  editor: BlockNoteEditor<any, any, any>;
  originalBlockEditor: BlockNoteEditor<any, any, any>;
  purpose: RoutineTaskPurpose;
  payloadPreview: string;
  patternBlockIds: Set<string>;
  onAddPatternBlock: (patternBlock: PatternBlock) => void;
  onRemovePatternBlock: (blockId: string) => void;
  onClose: () => void;
  onConfirm: (payload: string) => void;
}

const CreateBlockPackPayloadTemplateEditor = ({
  editor,
  originalBlockEditor,
  purpose,
  payloadPreview,
  patternBlockIds,
  onAddPatternBlock,
  onRemovePatternBlock,
  onClose,
  onConfirm,
}: CreateBlockPackPayloadTemplateEditorProps) => (
  <main className="flex max-h-[72vh] min-h-0 flex-col overflow-hidden bg-background/30">
    <div
      className={
        purpose === RoutineTaskPurpose.UpdateBlock
          ? "grid min-h-0 flex-1 grid-rows-[minmax(160px,0.8fr)_minmax(220px,1.2fr)] overflow-hidden"
          : "min-h-0 flex-1 overflow-y-auto overflow-x-visible py-6 pr-6 pl-16"
      }
    >
      {purpose === RoutineTaskPurpose.UpdateBlock && (
        <section className="min-h-0 overflow-y-auto border-b bg-muted/25 py-4 pr-6 pl-16">
          <div className="mb-2 text-muted-foreground text-xs">
            Current Block
          </div>
          <BlockNoteView
            editor={originalBlockEditor}
            editable={false}
            sideMenu={false}
            className="caret-muted-foreground [&_.bn-editor]:px-8"
          />
        </section>
      )}
      <section
        className={
          purpose === RoutineTaskPurpose.UpdateBlock
            ? "min-h-0 overflow-y-auto overflow-x-visible py-4 pr-6 pl-16"
            : ""
        }
      >
        {purpose === RoutineTaskPurpose.UpdateBlock && (
          <div className="mb-2 text-muted-foreground text-xs">Next Block</div>
        )}
        <BlockNoteView
          editor={editor}
          sideMenu={false}
          className="caret-muted-foreground [&_.bn-editor]:px-8 [&_.bn-side-menu_.bn-button]:size-7 [&_.bn-side-menu_.bn-button]:min-w-0 [&_.bn-side-menu_.bn-button]:p-1.5 [&_.bn-side-menu_.bn-button_svg]:size-4"
        >
          <SideMenuController
            sideMenu={sideMenuProps => (
              <SideMenu {...sideMenuProps}>
                <AddBlockButton {...sideMenuProps} />
                <blockNoteShadcnComponents.SideMenu.Button
                  className="bn-button size-7 min-w-0 p-1.5 text-gray-400"
                  label={
                    patternBlockIds.has(sideMenuProps.block.id)
                      ? "Remove from pattern table"
                      : "Add to pattern table"
                  }
                  icon={
                    patternBlockIds.has(sideMenuProps.block.id) ? (
                      <XIcon className="size-4" />
                    ) : (
                      <Form className="size-4" />
                    )
                  }
                  onClick={event => {
                    event.preventDefault();
                    event.stopPropagation();
                    if (patternBlockIds.has(sideMenuProps.block.id)) {
                      onRemovePatternBlock(sideMenuProps.block.id);
                      return;
                    }
                    onAddPatternBlock({
                      id: sideMenuProps.block.id,
                      type: sideMenuProps.block.type,
                      label: Array.isArray(sideMenuProps.block.content)
                        ? sideMenuProps.block.content
                            .map((content: any) => {
                              if (content.type === "text") {
                                return content.text;
                              }
                              if (
                                content.type === "link" &&
                                Array.isArray(content.content)
                              ) {
                                return content.content
                                  .map(
                                    (linkContent: any) => linkContent.text ?? ""
                                  )
                                  .join("");
                              }
                              return "";
                            })
                            .join("")
                            .trim()
                        : "",
                      reference: "{{customString}}",
                    });
                  }}
                />
                <DragHandleButton {...sideMenuProps} />
              </SideMenu>
            )}
          />
        </BlockNoteView>
      </section>
    </div>
    <DialogFooter className="min-h-10 border-t bg-muted/80 px-4 py-2">
      <span className="mr-auto self-center text-xs text-muted-foreground">
        Estimated payload cost:{" "}
        {Math.ceil(new Blob([payloadPreview]).size / 1024)} CostUnits
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
);

export default CreateBlockPackPayloadTemplateEditor;
