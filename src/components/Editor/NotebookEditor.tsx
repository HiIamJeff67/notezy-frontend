"use client";

import { Button } from "@/components/ui/button";
import { SidebarTrigger, useSidebar } from "@/components/ui/sidebar";
import { useLanguage, useLoading, useShelfMaterial } from "@/hooks";
import { loadFileFromDownloadURL } from "@/util/loadFiles";
import { choiceRandom } from "@/util/random";
import { BlockNoteEditor, PartialBlock } from "@blocknote/core";
import "@blocknote/core/style.css";
import { BlockNoteView } from "@blocknote/shadcn";
import { GetMyMaterialById } from "@shared/api/functions/material.api";
import { useSaveMyNotebookMaterialById } from "@shared/api/hooks/material.hook";
import { AllDefaultNotebookInitialContents } from "@shared/constants/defaultNotebookInitialContent.constant";
import { EditableNotebookMaterial } from "@shared/types/editableMaterial.type";
import { MaterialType } from "@shared/types/enums";
import { UUID } from "crypto";
import { Download, Save } from "lucide-react";
import { useEffect, useState, useTransition } from "react";
import toast from "react-hot-toast";
import { Spinner } from "../ui/spinner";

interface NotebookEditorProps {
  materialId: UUID;
  parentSubShelfId: UUID;
}

const NotebookEditor = ({
  materialId,
  parentSubShelfId,
}: NotebookEditorProps) => {
  const loadingManager = useLoading();
  const languageManager = useLanguage();
  const sidebarManager = useSidebar();
  const shelfMaterialManager = useShelfMaterial();

  const saveMyNotebookMaterialMutator = useSaveMyNotebookMaterialById();

  const [editor, setEditor] = useState<BlockNoteEditor | undefined>(undefined);
  const [isSaving, startSavingTransition] = useTransition();
  const [fileName, setFileName] = useState<string>("Untitled");

  // update the file name in this page
  useEffect(() => {
    if (shelfMaterialManager.isMaterialNodeEditing(materialId)) {
      setFileName(shelfMaterialManager.editMaterialNodeName);
    }
  }, [shelfMaterialManager.editMaterialNodeName]);

  useEffect(() => {
    const initializeMaterial = async () => {
      try {
        loadingManager.startTransactionLoading(async () => {
          const editableMaterial = await loadNotebookMaterial(
            materialId as UUID
          );

          if (editableMaterial) {
            setFileName(editableMaterial.name);
            setEditor(
              BlockNoteEditor.create({
                initialContent:
                  editableMaterial.initialContent ?? ([] as PartialBlock[]),
              })
            );
          }
        });
      } catch (error) {
        toast.error(languageManager.tError(error));
      }
    };

    initializeMaterial();
  }, [materialId]);

  const loadNotebookMaterial = async (
    materialId: UUID
  ): Promise<EditableNotebookMaterial | undefined> => {
    const userAgent = navigator.userAgent;
    const responseOfGettingMaterial = await GetMyMaterialById({
      header: {
        userAgent: userAgent,
      },
      param: {
        materialId: materialId,
      },
    });
    if (responseOfGettingMaterial.data.type !== MaterialType.Notebook) {
      return undefined;
    }

    const fileContentString = await loadFileFromDownloadURL(
      responseOfGettingMaterial.data.downloadURL
    );
    const parsedContent = (
      fileContentString && fileContentString.trim() !== ""
        ? JSON.parse(fileContentString)
        : choiceRandom(AllDefaultNotebookInitialContents)
    ) as PartialBlock[];
    if (!Array.isArray(parsedContent)) return undefined;

    return {
      id: responseOfGettingMaterial.data.id as UUID,
      name: responseOfGettingMaterial.data.name,
      type: responseOfGettingMaterial.data.type,
      initialContent: parsedContent,
      updatedAt: responseOfGettingMaterial.data.updatedAt,
      createdAt: responseOfGettingMaterial.data.createdAt,
    };
  };

  const handleSaveNotebookMaterial = async () => {
    if (!editor) return;

    try {
      startSavingTransition(async () => {
        const blocks = editor.document;
        const json = JSON.stringify(blocks, null, 2);
        const filename = `${fileName || materialId}.notebook.json`;
        const contentFile = new File([json], filename, {
          type: "application/json",
        });

        const userAgent = navigator.userAgent;
        await saveMyNotebookMaterialMutator.mutateAsync({
          header: {
            userAgent: userAgent,
          },
          body: {
            materialId: materialId,
            contentFile: contentFile,
          },
          affected: {
            parentSubShelfId: parentSubShelfId,
          },
        });
      });

      toast.success("Successfully saving the notebook");
    } catch (error) {
      toast.error(languageManager.tError(error));
    }
  };

  const handleExportMarkdown = async () => {
    if (!editor) return;

    try {
      const markdown = await editor.blocksToMarkdownLossy();
      const blob = new Blob([markdown], { type: "text/markdown" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${fileName}.md`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      toast.error(languageManager.tError(error));
    }
  };

  if (!editor) {
    return undefined;
  }

  return (
    <div className="w-full h-full flex flex-col justify-center items-center">
      <header className="w-full h-12 flex shrink-0 items-center gap-2 border-b px-4 bg-popover">
        {sidebarManager.isMobile && <SidebarTrigger />}
        <h1 className="font-semibold">{fileName}</h1>
        <div className="ml-auto flex items-center gap-2">
          {isSaving ? (
            <Spinner />
          ) : (
            <Button
              variant="outline"
              size="icon"
              onClick={handleSaveNotebookMaterial}
              disabled={isSaving}
            >
              <Save />
            </Button>
          )}
          <Button variant="outline" size="icon" onClick={handleExportMarkdown}>
            <Download />
          </Button>
        </div>
      </header>

      <div className="w-full h-full rounded-none p-8">
        <BlockNoteView editor={editor} />
      </div>
    </div>
  );
};

export default NotebookEditor;
