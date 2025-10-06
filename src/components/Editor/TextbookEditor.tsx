"use client";

import { Button } from "@/components/ui/button";
import { SidebarTrigger, useSidebar } from "@/components/ui/sidebar";
import { useLanguage, useLoading } from "@/hooks";
import { loadFileFromDownloadURL } from "@/util/loadFiles";
import { choiceRandom } from "@/util/random";
import { BlockNoteEditor, PartialBlock } from "@blocknote/core";
import "@blocknote/core/style.css";
import { BlockNoteView } from "@blocknote/shadcn";
import { GetMyMaterialById } from "@shared/api/functions/material.api";
import { AllDefaultTextbookInitialContents } from "@shared/constants";
import { EditableMaterial } from "@shared/types/editableMaterial.type";
import { MaterialType } from "@shared/types/enums";
import { UUID } from "crypto";
import { Download, Save } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

interface TextbookEditorProps {
  materialId: UUID;
}

const TextbookEditor = ({ materialId }: TextbookEditorProps) => {
  const router = useRouter();
  const loadingManager = useLoading();
  const languageManager = useLanguage();
  const sidebarManager = useSidebar();

  const [editor, setEditor] = useState<BlockNoteEditor | undefined>(undefined);

  const [saving, setSaving] = useState<boolean>(false);
  const [fileName, setFileName] = useState<string>("Untitled");

  useEffect(() => {
    const initializeMaterial = async () => {
      try {
        loadingManager.setIsLoading(true);
        const editableMaterial = await loadTextbookMaterial(materialId as UUID);
        if (editableMaterial) {
          console.log(editableMaterial);
          setFileName(editableMaterial.name);
          setEditor(
            BlockNoteEditor.create({
              initialContent:
                editableMaterial.initialContent ?? ([] as PartialBlock[]),
            })
          );
        }
      } catch (error) {
        toast.error(languageManager.tError(error));
        console.error(error);
      } finally {
        loadingManager.setIsLoading(false);
      }
    };

    initializeMaterial();
  }, [materialId]);

  const loadTextbookMaterial = async (
    materialId: UUID
  ): Promise<EditableMaterial | undefined> => {
    const userAgent = navigator.userAgent;
    const responseOfGettingMaterial = await GetMyMaterialById({
      header: {
        userAgent: userAgent,
      },
      param: {
        materialId: materialId,
      },
    });
    if (responseOfGettingMaterial.data.type !== MaterialType.Textbook) {
      return undefined;
    }

    const fileContentString = await loadFileFromDownloadURL(
      responseOfGettingMaterial.data.downloadURL
    );
    const parsedContent = (
      fileContentString && fileContentString.trim() !== ""
        ? JSON.parse(fileContentString)
        : choiceRandom(AllDefaultTextbookInitialContents)
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

  const handleSave = async () => {
    if (!editor) return;

    setSaving(true);
    try {
      const content = editor.document;

      // 調用儲存 API
      const response = await fetch(`/api/materials/${materialId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content }),
      });

      if (!response.ok) {
        throw new Error("儲存失敗");
      }

      console.log("檔案已儲存");
    } catch (error) {
      console.error("儲存錯誤:", error);
    } finally {
      setSaving(false);
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
      console.error("匯出失敗:", error);
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
          <Button
            variant="outline"
            size="icon"
            onClick={handleSave}
            disabled={saving}
          >
            <Save />
          </Button>
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

export default TextbookEditor;
