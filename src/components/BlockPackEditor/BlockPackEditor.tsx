"use client";

import { SidebarTrigger, useSidebar } from "@/components/ui/sidebar";
import { useAppRouter, useLanguage, useLoading, useShelfItem } from "@/hooks";
import { blockPackMetaReducer } from "@/reducers/blockPackMeta.reducer";
import {
  convertBlocksToDOCX,
  convertBlocksToHTML,
  convertBlocksToJSON,
  convertBlocksToMarkdown,
  convertBlocksToPDF,
  convertBlocksToPlainText,
} from "@/util/convertBlocksToFiles";
import { getAuthorization } from "@/util/getAuthorization";
import { LocalStorageManipulator } from "@/util/localStorageManipulator";
import { choiceRandom } from "@/util/random";
import { BlockNoteEditor, PartialBlock } from "@blocknote/core";
import { BlockNoteView } from "@blocknote/shadcn";
import { useGetMyBlockGroupsAndTheirBlocksByBlockPackId } from "@shared/api/hooks/blockGroup.hook";
import { useGetMyBlockPackAndItsParentById } from "@shared/api/hooks/blockPack.hook";
import { AllDefaultNotebookInitialContents } from "@shared/constants/defaultNotebookInitialContent.constant";
import { ContentType } from "@shared/enums/blockPackContentType.enum";
import { BlockGroupMeta } from "@shared/types/blockGroupMeta.type";
import { BlockPackMeta } from "@shared/types/blockPackMeta.type";
import { LocalStorageKeys } from "@shared/types/localStorage.type";
import { UUID } from "crypto";
import { useEffect, useReducer, useState, useTransition } from "react";
import toast from "react-hot-toast";
import DropFileZone from "../DropFileZone/DropFileZone";
import ItemPath from "../ItemPath/ItemPath";
import StrictLoadingOutlay from "../LoadingOutlay/StrictLoadingOutlay";
import TruncatedText from "../TruncatedText/TruncatedText";
import ChevronDownIcon from "../icons/ChevronDownIcon";
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

interface BlockPackEditorProps {
  defaultBlockPackMeta: BlockPackMeta;
}

const BlockPackEditor = ({ defaultBlockPackMeta }: BlockPackEditorProps) => {
  const router = useAppRouter();
  const loadingManager = useLoading();
  const languageManager = useLanguage();
  const sidebarManager = useSidebar();
  const shelfItemManager = useShelfItem();

  const getMyBlockPackAndItsParentQuerier = useGetMyBlockPackAndItsParentById();
  const getMyBlockGroupsAndTheirBlocksQuerier =
    useGetMyBlockGroupsAndTheirBlocksByBlockPackId();

  const [editor, setEditor] = useState<BlockNoteEditor | undefined>(undefined);
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
  const [isSaving, startSavingTransition] = useTransition();
  const [isImporting, startImportingTransition] = useTransition();
  const [isExporting, startExportingTransition] = useTransition();
  const [meta, dispatchMeta] = useReducer(
    blockPackMetaReducer,
    defaultBlockPackMeta
  );

  useEffect(() => {
    if (shelfItemManager.isItemNodeEditing(meta.id)) {
      dispatchMeta({
        type: "setName",
        newName: shelfItemManager.editItemNodeName,
      });
    }
  }, [shelfItemManager.editItemNodeName]);

  useEffect(() => {
    const initializeBlockPack = async () => {
      try {
        loadingManager.startAsyncTransactionLoading(
          async () => {
            const { blockPackMeta, fallback } = await loadBlockPack(meta.id);

            if (blockPackMeta) {
              const initialContent = blockPackMeta.blockGroups.map(
                blockGroup => blockGroup.rawArborizedEditableBlock
              );
              dispatchMeta({
                type: "init",
                payload: blockPackMeta,
              });
              const editor = BlockNoteEditor.create({
                initialContent:
                  initialContent.length === 0 ? fallback : initialContent,
              });
              setEditor(editor);
            }
          },
          3000,
          5000
        );
      } catch (error) {
        toast.error(languageManager.tError(error));
      }
    };

    initializeBlockPack();
  }, []);

  const loadBlockPack = async (
    blockPackId: UUID
  ): Promise<{
    blockPackMeta: BlockPackMeta | undefined;
    fallback: PartialBlock[];
  }> => {
    const userAgent = navigator.userAgent;
    const accessToken = LocalStorageManipulator.getItemByKey(
      LocalStorageKeys.accessToken
    );
    const responseOfGettingBlockPack =
      await getMyBlockPackAndItsParentQuerier.queryAsync({
        header: {
          userAgent: userAgent,
          authorization: getAuthorization(accessToken),
        },
        param: {
          blockPackId: blockPackId,
        },
      });
    if (
      responseOfGettingBlockPack.data.id !== defaultBlockPackMeta.id ||
      responseOfGettingBlockPack.data.parentSubShelfId !==
        defaultBlockPackMeta.parentId
    ) {
      return { blockPackMeta: undefined, fallback: [] };
    }
    const responseOfGettingBlockGroupsAndTheirBlocks =
      await getMyBlockGroupsAndTheirBlocksQuerier.queryAsync({
        header: {
          userAgent: userAgent,
          authorization: getAuthorization(accessToken),
        },
        param: {
          blockPackId: blockPackId,
        },
      });

    return {
      blockPackMeta: {
        id: defaultBlockPackMeta.id,
        parentId: defaultBlockPackMeta.parentId,
        rootId: defaultBlockPackMeta.rootId,
        name: responseOfGettingBlockPack.data.name,
        icon: responseOfGettingBlockPack.data.icon,
        headerBackgroundURL:
          responseOfGettingBlockPack.data.headerBackgroundURL,
        blockCount: BigInt(responseOfGettingBlockPack.data.blockCount),
        path: responseOfGettingBlockPack.data.parentSubShelfPath as UUID[],
        deletedAt: responseOfGettingBlockPack.data.deletedAt
          ? new Date(responseOfGettingBlockPack.data.deletedAt)
          : null,
        updatedAt: new Date(responseOfGettingBlockPack.data.updatedAt),
        createdAt: new Date(responseOfGettingBlockPack.data.createdAt),
        blockGroups:
          responseOfGettingBlockGroupsAndTheirBlocks.data as BlockGroupMeta[],
      },
      fallback: choiceRandom(AllDefaultNotebookInitialContents),
    };
  };

  if (!editor || !meta.id || !meta.parentId || !meta.rootId) {
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

  const handleImportFiles = async (files: File[]) => {
    if (!files.length) return;

    startImportingTransition(async () => {
      try {
        const file = files[0];
        let blocks: PartialBlock[] | undefined = undefined;
        switch (file.type) {
          case ContentType.Markdown:
          case ContentType.PlainText: // use the same way as markdown to parse the text
            const markdownText = await file.text();
            blocks = await editor.tryParseMarkdownToBlocks(markdownText);
            break;
          case ContentType.HTML:
            const htmlText = await file.text();
            blocks = await editor.tryParseHTMLToBlocks(htmlText);
            break;
          case ContentType.JSON:
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

        // dispatchMeta({
        //   type: "setBlockGroupMetas",
        //   newBlockGroupMetas: {},
        // });

        toast.success(`Imported ${file.name}`);
      } catch (error) {
        toast.error(languageManager.tError(error));
      }
    });
  };

  const handleExportFiles = async (contentType: ContentType) => {
    startExportingTransition(async () => {
      try {
        let blob: Blob | undefined = undefined;
        const a = document.createElement("a");

        switch (contentType) {
          case ContentType.Markdown:
            blob = await convertBlocksToMarkdown(editor);
            a.download = `${meta.name}.md`;
            break;
          case ContentType.HTML:
            blob = await convertBlocksToHTML(editor);
            a.download = `${meta.name}.html`;
            break;
          case ContentType.PlainText:
            blob = await convertBlocksToPlainText(editor);
            a.download = `${meta.name}.txt`;
            break;
          case ContentType.JSON:
            blob = await convertBlocksToJSON(editor);
            a.download = `${meta.name}.json`;
            break;
          case ContentType.PDF:
            blob = await convertBlocksToPDF(editor);
            a.download = `${meta.name}.pdf`;
            break;
          case ContentType.DOCX:
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
    <div className="w-full h-full flex flex-col justify-center items-start bg-cover bg-center bg-no-repeat">
      <header className="w-full h-14 flex shrink-0 justify-between items-center px-4 gap-2 bg-background/15 backdrop-blur-md border-b border-background/10">
        <div className="flex justify-start items-center gap-2">
          {sidebarManager.isMobile && <SidebarTrigger />}
          <DropdownMenu open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="font-semibold text-2xl select-none border-none focus-visible:ring-0 focus-visible:ring-offset-0"
              >
                <TruncatedText width="1/2">{meta.name}</TruncatedText>
                <ChevronDownIcon
                  className={`transition ${
                    isDropdownOpen ? "-rotate-180" : ""
                  }`}
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
                onClick={() => copyToClipboard(meta.blockCount.toString())}
                className="hover:cursor-pointer"
              >
                <span className="font-semibold">Block Count</span>
                <TruncatedText width="200px" className="text-muted-foreground">
                  {meta.blockCount}
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
                  <span className="font-semibold">Updated At</span>
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
                  <span className="font-semibold">Created At</span>
                  <span className="text-muted-foreground">
                    {meta.createdAt.toLocaleString()}
                  </span>
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <Menubar className="bg-muted/25">
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
                  await handleExportFiles(ContentType.Markdown)
                }
              >
                <span className="font-semibold">Markdown</span>
                <span className="text-muted-foreground">(.md)</span>
              </MenubarItem>
              <MenubarItem
                onClick={async () => await handleExportFiles(ContentType.HTML)}
              >
                <span className="font-semibold">HTML</span>
                <span className="text-muted-foreground">(.html)</span>
              </MenubarItem>
              <MenubarItem
                onClick={async () =>
                  await handleExportFiles(ContentType.PlainText)
                }
              >
                <span className="font-semibold">Plain Text</span>
                <span className="text-muted-foreground">(.txt)</span>
              </MenubarItem>
              <MenubarItem
                onClick={async () => await handleExportFiles(ContentType.JSON)}
              >
                <span className="font-semibold">Raw JSON</span>
                <span className="text-muted-foreground">(.json)</span>
              </MenubarItem>
              <MenubarItem
                onClick={async () => await handleExportFiles(ContentType.PDF)}
              >
                <span className="font-semibold">PDF</span>
                <span className="text-muted-foreground">(.pdf)</span>
              </MenubarItem>
              <MenubarItem
                onClick={async () => await handleExportFiles(ContentType.DOCX)}
              >
                <span className="font-semibold">Word</span>
                <span className="text-muted-foreground">(.docx)</span>
              </MenubarItem>
            </MenubarContent>
          </MenubarMenu>
        </Menubar>
      </header>
      <ItemPath
        parentSubShelfId={meta.parentId}
        itemId={meta.id}
        itemType="BlockPack"
        path={meta.path}
        summary={shelfItemManager.expandedShelves.get(meta.rootId.toString())}
      />
      <div className="w-full h-full rounded-none p-8 z-0">
        {getMyBlockGroupsAndTheirBlocksQuerier.isFetching ? (
          <StrictLoadingOutlay />
        ) : (
          <BlockNoteView
            editor={editor}
            className="caret-muted-foreground z-10"
          />
        )}
      </div>
    </div>
  );
};

export default BlockPackEditor;
