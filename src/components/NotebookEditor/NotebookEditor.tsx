"use client";

import ChevronDownIcon from "@/components/icons/ChevronDownIcon";
import TruncatedText from "@/components/TruncatedText/TruncatedText";
import { Button } from "@/components/ui/button";
import { useLanguage, useLoading, useShelfMaterial } from "@/hooks";
import {
  convertBlocksToDOCX,
  convertBlocksToHTML,
  convertBlocksToJSON,
  convertBlocksToMarkdown,
  convertBlocksToPDF,
  convertBlocksToPlainText,
} from "@/util/convertBlocksToFiles";
import { getAuthorization } from "@/util/getAuthorization";
import { loadFileFromDownloadURL } from "@/util/loadFiles";
import { LocalStorageManipulator } from "@/util/localStorageManipulator";
import { choiceRandom } from "@/util/random";
import { BlockNoteEditor, PartialBlock } from "@blocknote/core";
import "@blocknote/core/style.css";
import { BlockNoteView } from "@blocknote/shadcn";
import {
  useGetMyMaterialById,
  useSaveMyNotebookMaterialById,
} from "@shared/api/hooks/material.hook";
import { AllDefaultNotebookInitialContents } from "@shared/constants/defaultNotebookInitialContent.constant";
import {
  ExportableMaterialContentTypes,
  MaterialContentType,
  MaterialType,
} from "@shared/types/enums";
import { LocalStorageKeys } from "@shared/types/localStorage.type";
import {
  NotebookMaterialMeta,
  notebookMaterialMetaReducer,
} from "@shared/types/notebookMaterialMeta.type";
import { UUID } from "crypto";
import { useEffect, useReducer, useState, useTransition } from "react";
import toast from "react-hot-toast";
import DropFileZone from "../DropFileZone/DropFileZone";
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
  defaultMeta: NotebookMaterialMeta;
}

const NotebookEditor = ({ defaultMeta }: NotebookEditorProps) => {
  const loadingManager = useLoading();
  const languageManager = useLanguage();
  const shelfMaterialManager = useShelfMaterial();

  const getMyMaterialQuerier = useGetMyMaterialById();
  const saveMyNotebookMaterialMutator = useSaveMyNotebookMaterialById();

  const [editor, setEditor] = useState<BlockNoteEditor | undefined>(undefined);
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);

  const [isSaving, startSavingTransition] = useTransition();
  const [isImporting, startImportingTransition] = useTransition();
  const [isExporting, startExportingTransition] = useTransition();
  const [meta, dispatchMeta] = useReducer(
    notebookMaterialMetaReducer,
    defaultMeta
  );

  // update the file name in this page
  useEffect(() => {
    if (shelfMaterialManager.isMaterialNodeEditing(meta.id)) {
      dispatchMeta({
        type: "setName",
        newName: shelfMaterialManager.editMaterialNodeName,
      });
    }
  }, [shelfMaterialManager.editMaterialNodeName]);

  useEffect(() => {
    const initializeMaterial = async () => {
      try {
        loadingManager.startAsyncTransactionLoading(async () => {
          const notebookMaterialMeta = await loadNotebookMaterial(
            meta.id as UUID
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
  }, []);

  const loadNotebookMaterial = async (
    materialId: UUID
  ): Promise<NotebookMaterialMeta | undefined> => {
    const userAgent = navigator.userAgent;
    const accessToken = LocalStorageManipulator.getItemByKey(
      LocalStorageKeys.AccessToken
    );
    const responseOfGettingMaterial = await getMyMaterialQuerier.queryAsync({
      header: {
        userAgent: userAgent,
        authorization: getAuthorization(accessToken),
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
      parentId: responseOfGettingMaterial.data.parentSubShelfId as UUID,
      name: responseOfGettingMaterial.data.name,
      type: responseOfGettingMaterial.data.type,
      initialContent: parsedContent,
      updatedAt: new Date(responseOfGettingMaterial.data.updatedAt),
      createdAt: new Date(responseOfGettingMaterial.data.createdAt),
    };
  };

  if (!editor || !meta.parentId) {
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
        const filename = `${meta.name || meta.id}.notebook.json`;
        const contentFile = new File([json], filename, {
          type: "application/json",
        });

        dispatchMeta({
          type: "setInitialContent",
          newInitialContent: blocks,
        });

        const userAgent = navigator.userAgent;
        const accessToken = LocalStorageManipulator.getItemByKey(
          LocalStorageKeys.AccessToken
        );
        await saveMyNotebookMaterialMutator.mutateAsync({
          header: {
            userAgent: userAgent,
            authorization: getAuthorization(accessToken),
          },
          body: {
            materialId: meta.id,
            contentFile: contentFile,
          },
          affected: {
            parentSubShelfId: meta.parentId as UUID,
          },
        });
      });

      toast.success("Successfully saving the notebook");
    } catch (error) {
      toast.error(languageManager.tError(error));
    }
  };

  const handleImportFiles = async (files: File[]) => {
    if (!files.length) return;

    startImportingTransition(async () => {
      try {
        const file = files[0];
        let blocks: PartialBlock[] | undefined = undefined;
        switch (file.type) {
          case MaterialContentType.Markdown:
          case MaterialContentType.PlainText: // use the same way as markdown to parse the text
            const markdownText = await file.text();
            blocks = await editor.tryParseMarkdownToBlocks(markdownText);
            break;
          case MaterialContentType.HTML:
            const htmlText = await file.text();
            blocks = await editor.tryParseHTMLToBlocks(htmlText);
            break;
          case MaterialContentType.JSON:
            const jsonText = await file.text();
            blocks = JSON.parse(jsonText) as PartialBlock[];
            break;
          default:
            throw new Error(`Unexpected content type received`);
        }
        if (!blocks) {
          throw new Error(`Unexpected content type received`);
        }

        editor.replaceBlocks([editor.document[0]?.id], blocks);
        dispatchMeta({
          type: "setInitialContent",
          newInitialContent: blocks,
        });

        toast.success(`Imported ${file.name}`);
      } catch (error) {
        toast.error(languageManager.tError(error));
      }
    });
  };

  const handleExportFiles = async (
    contentType: (typeof ExportableMaterialContentTypes)[MaterialType.Notebook][number]
  ) => {
    startExportingTransition(async () => {
      try {
        let blob: Blob | undefined = undefined;
        const a = document.createElement("a");

        switch (contentType) {
          case MaterialContentType.Markdown:
            blob = await convertBlocksToMarkdown(editor);
            a.download = `${meta.name}.md`;
            break;
          case MaterialContentType.HTML:
            blob = await convertBlocksToHTML(editor);
            a.download = `${meta.name}.html`;
            break;
          case MaterialContentType.PlainText:
            blob = await convertBlocksToPlainText(editor);
            a.download = `${meta.name}.txt`;
            break;
          case MaterialContentType.JSON:
            blob = await convertBlocksToJSON(editor);
            a.download = `${meta.name}.json`;
            break;
          case MaterialContentType.PDF:
            blob = await convertBlocksToPDF(editor);
            a.download = `${meta.name}.pdf`;
            break;
          case MaterialContentType.DOCX:
            blob = await convertBlocksToDOCX(editor);
            a.download = `${meta.name}.docx`;
            break;
          default:
            throw new Error(`Unexpected content type received`);
        }
        if (!blob) {
          throw new Error(`Unexpected content type received`);
        }

        const url = URL.createObjectURL(blob);
        a.href = url;
        a.click();
        URL.revokeObjectURL(url);

        toast.success(`Exported`);
      } catch (error) {
        toast.error(languageManager.tError(error));
      }
    });
  };

  return (
    <div className="w-full h-full flex flex-col justify-center items-center">
      <header className="w-full h-12 flex shrink-0 justify-between items-center pt-4 p-2 pl-8 gap-2 bg-transparent">
        <DropdownMenu open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
          <DropdownMenuTrigger asChild>
            <Button className="font-semibold text-2xl border-none border-transparent bg-transparent hover:bg-muted/50 focus-visible:ring-0 focus-visible:ring-offset-0">
              <TruncatedText width="1/2">{meta.name}</TruncatedText>
              <ChevronDownIcon
                className={`transition ${isDropdownOpen ? "-rotate-180" : ""}`}
              />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" side="bottom">
            <DropdownMenuItem
              onClick={() => {
                if (meta.id) copyToClipboard(meta.id.toString());
              }}
              className="hover:cursor-pointer"
            >
              <span className="font-semibold">Id</span>
              <TruncatedText width="200px" className="text-muted-foreground">
                {meta.id}
              </TruncatedText>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => copyToClipboard(meta.name)}
              className="hover:cursor-pointer"
            >
              <span className="font-semibold">Name</span>
              <TruncatedText width="200px" className="text-muted-foreground">
                {meta.name}
              </TruncatedText>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => copyToClipboard(meta.type)}
              className="hover:cursor-pointer"
            >
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
                className="hover:cursor-pointer"
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
                className="hover:cursor-pointer"
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
              {isImporting ? <Spinner /> : <span>Import</span>}
            </MenubarTrigger>
            <MenubarContent align="end" side="bottom">
              <DropFileZone
                disabled={!editor}
                width="300px"
                height="200px"
                onDrop={handleImportFiles}
              />
            </MenubarContent>
          </MenubarMenu>
          <MenubarMenu>
            <MenubarTrigger>
              {isExporting ? <Spinner /> : <span>Export</span>}
            </MenubarTrigger>
            <MenubarContent align="end" side="bottom">
              <MenubarItem
                onClick={async () =>
                  await handleExportFiles(MaterialContentType.Markdown)
                }
              >
                <span className="font-semibold">Markdown</span>
                <span className="text-muted-foreground">(.md)</span>
              </MenubarItem>
              <MenubarItem
                onClick={async () =>
                  await handleExportFiles(MaterialContentType.HTML)
                }
              >
                <span className="font-semibold">HTML</span>
                <span className="text-muted-foreground">(.html)</span>
              </MenubarItem>
              <MenubarItem
                onClick={async () =>
                  await handleExportFiles(MaterialContentType.PlainText)
                }
              >
                <span className="font-semibold">Plain Text</span>
                <span className="text-muted-foreground">(.txt)</span>
              </MenubarItem>
              <MenubarItem
                onClick={async () =>
                  await handleExportFiles(MaterialContentType.JSON)
                }
              >
                <span className="font-semibold">Raw JSON</span>
                <span className="text-muted-foreground">(.json)</span>
              </MenubarItem>
              <MenubarItem
                onClick={async () =>
                  await handleExportFiles(MaterialContentType.PDF)
                }
              >
                <span className="font-semibold">PDF</span>
                <span className="text-muted-foreground">(.pdf)</span>
              </MenubarItem>
              <MenubarItem
                onClick={async () =>
                  await handleExportFiles(MaterialContentType.DOCX)
                }
              >
                <span className="font-semibold">Word</span>
                <span className="text-muted-foreground">(.docx)</span>
              </MenubarItem>
            </MenubarContent>
          </MenubarMenu>
        </Menubar>
      </header>
      <div className="w-full h-full rounded-none p-8">
        <BlockNoteView editor={editor} className="caret-foreground" />
      </div>
    </div>
  );
};

export default NotebookEditor;
