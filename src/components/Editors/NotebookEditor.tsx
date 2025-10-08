"use client";

import { SidebarTrigger, useSidebar } from "@/components/ui/sidebar";
import { useLanguage, useLoading, useShelfMaterial } from "@/hooks";
import {
  convertBlocksToDOCX,
  convertBlocksToHTML,
  convertBlocksToMarkdown,
  convertBlocksToPDF,
  convertBlocksToPlainText,
} from "@/util/convertBlocksToFiles";
import { loadFileFromDownloadURL } from "@/util/loadFiles";
import { choiceRandom } from "@/util/random";
import { BlockNoteEditor, PartialBlock } from "@blocknote/core";
import "@blocknote/core/style.css";
import { BlockNoteView } from "@blocknote/shadcn";
import {
  useGetMyMaterialById,
  useSaveMyNotebookMaterialById,
} from "@shared/api/hooks/material.hook";
import { AllDefaultNotebookInitialContents } from "@shared/constants/defaultNotebookInitialContent.constant";
import { MaterialType } from "@shared/types/enums";
import {
  DefaultNotebookMaterialMeta,
  NotebookMaterialMeta,
  notebookMaterialMetaReducer,
} from "@shared/types/notebookMaterialMeta.type";
import { UUID } from "crypto";
import { useEffect, useReducer, useState, useTransition } from "react";
import toast from "react-hot-toast";
import ChevronDownIcon from "../icons/ChevronDownIcon";
import ChevronUpIcon from "../icons/ChevronUpIcon";
import TruncatedText from "../TruncatedText/TruncatedText";
import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarTrigger,
} from "../ui/menubar";
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

  const getMyMaterialQuerier = useGetMyMaterialById();
  const saveMyNotebookMaterialMutator = useSaveMyNotebookMaterialById();

  const [editor, setEditor] = useState<BlockNoteEditor | undefined>(undefined);
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);

  const [isSaving, startSavingTransition] = useTransition();
  const [isExporting, startExportingTransition] = useTransition();
  const [meta, dispatchMeta] = useReducer(
    notebookMaterialMetaReducer,
    DefaultNotebookMaterialMeta
  );

  // update the file name in this page
  useEffect(() => {
    if (shelfMaterialManager.isMaterialNodeEditing(materialId)) {
      dispatchMeta({
        type: "setName",
        newName: shelfMaterialManager.editMaterialNodeName,
      });
    }
  }, [shelfMaterialManager.editMaterialNodeName]);

  useEffect(() => {
    const initializeMaterial = async () => {
      try {
        loadingManager.startTransactionLoading(async () => {
          const notebookMaterialMeta = await loadNotebookMaterial(
            materialId as UUID
          );

          if (notebookMaterialMeta) {
            dispatchMeta({
              type: "init",
              payload: notebookMaterialMeta,
            });
            setEditor(
              BlockNoteEditor.create({
                initialContent:
                  notebookMaterialMeta.initialContent ?? ([] as PartialBlock[]),
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
  ): Promise<NotebookMaterialMeta | undefined> => {
    const userAgent = navigator.userAgent;
    const responseOfGettingMaterial = await getMyMaterialQuerier.queryAsync({
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
      updatedAt: new Date(responseOfGettingMaterial.data.updatedAt),
      createdAt: new Date(responseOfGettingMaterial.data.createdAt),
    };
  };

  if (!editor) {
    return undefined;
  }

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success("Copied");
    } catch (error) {
      toast.error(languageManager.tError(error));
    }
  };

  const handleSaveNotebookMaterial = async () => {
    try {
      startSavingTransition(async () => {
        const blocks = editor.document;
        const json = JSON.stringify(blocks, null, 2);
        const filename = `${meta.name || materialId}.notebook.json`;
        const contentFile = new File([json], filename, {
          type: "application/json",
        });

        dispatchMeta({
          type: "setInitialContent",
          newInitialContent: blocks,
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

  const handleExportAsMarkdown = async () => {
    try {
      startExportingTransition(async () => {
        const blob = await convertBlocksToMarkdown(editor);
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${meta.name}.md`;
        a.click();
        URL.revokeObjectURL(url);
      });
    } catch (error) {
      toast.error(languageManager.tError(error));
    }
  };

  const handleExportAsHTML = async () => {
    try {
      startExportingTransition(async () => {
        const blob = await convertBlocksToHTML(editor);
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${meta.name}.html`;
        a.click();
        URL.revokeObjectURL(url);
      });
    } catch (error) {
      toast.error(languageManager.tError(error));
    }
  };

  const handleExportAsPlainText = async () => {
    try {
      startExportingTransition(async () => {
        const blob = await convertBlocksToPlainText(editor);
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${meta.name}.txt`;
        a.click();
        URL.revokeObjectURL(url);
      });
    } catch (error) {
      toast.error(languageManager.tError(error));
    }
  };

  const handleExportAsPDF = async () => {
    try {
      startExportingTransition(async () => {
        const blob = await convertBlocksToPDF(editor);
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${meta.name}.pdf`;
        a.click();
        URL.revokeObjectURL(url);
      });
    } catch (error) {
      toast.error(languageManager.tError(error));
    }
  };

  const handleExportAsDOCX = async () => {
    try {
      startExportingTransition(async () => {
        const blob = await convertBlocksToDOCX(editor);
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${meta.name}.docx`;
        a.click();
        URL.revokeObjectURL(url);
      });
    } catch (error) {
      toast.error(languageManager.tError(error));
    }
  };

  return (
    <div className="w-full h-full flex flex-col justify-center items-center">
      <header className="w-full h-12 flex shrink-0 justify-between items-center pt-4 p-2 gap-2 bg-transparent">
        {sidebarManager.isMobile && <SidebarTrigger />}
        <DropdownMenu open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
          <DropdownMenuTrigger asChild>
            <Button className="font-semibold text-2xl border-none border-transparent bg-transparent hover:bg-muted/50 focus-visible:ring-0 focus-visible:ring-offset-0">
              <span>{meta.name}</span>
              {isDropdownOpen ? <ChevronUpIcon /> : <ChevronDownIcon />}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" side="bottom">
            <DropdownMenuItem
              onClick={() => {
                if (meta.id) copyToClipboard(meta.id.toString());
              }}
            >
              <span className="font-semibold">Id</span>
              <TruncatedText width="200px" className="text-muted-foreground">
                {meta.id}
              </TruncatedText>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => copyToClipboard(meta.name)}>
              <span className="font-semibold">Name</span>
              <TruncatedText width="200px" className="text-muted-foreground">
                {meta.name}
              </TruncatedText>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => copyToClipboard(meta.type)}>
              <span className="font-semibold">Type</span>
              <TruncatedText width="200px" className="text-muted-foreground">
                {meta.type}
              </TruncatedText>
            </DropdownMenuItem>
            {meta.updatedAt && (
              <DropdownMenuItem
                onClick={() => {
                  if (meta.updatedAt)
                    copyToClipboard(meta.updatedAt.toLocaleString());
                }}
              >
                <span className="font-semibold">UpdatedAt</span>
                <span className="text-muted-foreground">
                  {meta.updatedAt.toLocaleString()}
                </span>
              </DropdownMenuItem>
            )}
            {meta.createdAt && (
              <DropdownMenuItem
                onClick={() => {
                  if (meta.createdAt)
                    copyToClipboard(meta.createdAt.toLocaleString());
                }}
              >
                <span className="font-semibold">CreatedAt</span>
                <span className="text-muted-foreground">
                  {meta.createdAt.toLocaleString()}
                </span>
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
        <Menubar className="bg-muted">
          <MenubarMenu>
            <MenubarTrigger
              onClick={handleSaveNotebookMaterial}
              disabled={isSaving}
            >
              {isSaving ? <Spinner /> : <span>Save</span>}
            </MenubarTrigger>
          </MenubarMenu>
          <MenubarMenu>
            <MenubarTrigger>
              <span>Import</span>
            </MenubarTrigger>
          </MenubarMenu>
          <MenubarMenu>
            <MenubarTrigger>
              {isExporting ? <Spinner /> : <span>Export</span>}
            </MenubarTrigger>
            <MenubarContent>
              <MenubarItem onClick={handleExportAsMarkdown}>
                <span className="font-semibold">Markdown</span>
                <span className="text-muted-foreground">(.md)</span>
              </MenubarItem>
              <MenubarItem onClick={handleExportAsHTML}>
                <span className="font-semibold">HTML</span>
                <span className="text-muted-foreground">(.html)</span>
              </MenubarItem>
              <MenubarItem onClick={handleExportAsPlainText}>
                <span className="font-semibold">Plain Text</span>
                <span className="text-muted-foreground">(.txt)</span>
              </MenubarItem>
              <MenubarItem onClick={handleExportAsPDF}>
                <span className="font-semibold">PDF</span>
                <span className="text-muted-foreground">(.pdf)</span>
              </MenubarItem>
              <MenubarItem onClick={handleExportAsDOCX}>
                <span className="font-semibold">Word</span>
                <span className="text-muted-foreground">(.docx)</span>
              </MenubarItem>
            </MenubarContent>
          </MenubarMenu>
        </Menubar>
      </header>

      <div className="w-full h-full rounded-none p-8">
        <BlockNoteView editor={editor} />
      </div>
    </div>
  );
};

export default NotebookEditor;
