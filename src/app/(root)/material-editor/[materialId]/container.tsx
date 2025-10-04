"use client";

import { Button } from "@/components/ui/button";
import { SidebarTrigger, useSidebar } from "@/components/ui/sidebar";
import { useLanguage, useLoading } from "@/hooks";
import { loadFileFromDownloadURL } from "@/util/loadFiles";
import { Block, BlockNoteEditor } from "@blocknote/core";
import "@blocknote/core/style.css";
import { BlockNoteView } from "@blocknote/shadcn";
import { GetMyMaterialById } from "@shared/api/functions/material.api";
import { Download, Save } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import MaterialEditorNotFoundPage from "./not-found";

interface MaterialEditorContainerProps {
  materialId: string;
}

const MaterialEditorContainer = ({
  materialId,
}: MaterialEditorContainerProps) => {
  const router = useRouter();
  const loadingManager = useLoading();
  const languageManager = useLanguage();
  const sidebarManager = useSidebar();

  const [editor, setEditor] = useState<BlockNoteEditor | null>(null);
  const [rendering, setRendering] = useState(true);
  const [saving, setSaving] = useState(false);
  const [fileName, setFileName] = useState("");

  useEffect(() => {
    const initEditor = async () => {
      setRendering(true);
      try {
        const userAgent = navigator.userAgent;
        const responseOfGettingMaterial = await GetMyMaterialById({
          header: {
            userAgent: userAgent,
          },
          param: {
            materialId: materialId,
          },
        });

        setFileName(responseOfGettingMaterial.data.name || "Untitled");

        console.log(responseOfGettingMaterial.data.downloadURL);
        const fileContentString = await loadFileFromDownloadURL(
          responseOfGettingMaterial.data.downloadURL
        );
        const fileContent = convertTextToBlocks(fileContentString);

        const newEditor = BlockNoteEditor.create({
          initialContent: fileContent,
          editable: true,
          animations: true,
        });

        setEditor(newEditor);
      } catch (error) {
        toast.error(languageManager.tError(error));
        setEditor(null);
      } finally {
        setRendering(false);
        loadingManager.setIsLoading(false);
      }
    };

    if (materialId) {
      initEditor();
    }
  }, [materialId]);

  const convertTextToBlocks = (text: string): Block[] => {
    const lines = text.split("\n");
    return lines.map((line, index) => ({
      type: "paragraph" as const,
      content: [
        {
          type: "text",
          text: line || " ",
          styles: {}, // Add empty styles object to satisfy StyledText type
        },
      ],
      id: `block-${index}`,
      props: {
        backgroundColor: "default",
        textColor: "default",
        textAlignment: "left",
      },
    })) as Block[];
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
    return <MaterialEditorNotFoundPage />;
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
        {editor && <BlockNoteView editor={editor} />}
      </div>
    </div>
  );
};

export default MaterialEditorContainer;
