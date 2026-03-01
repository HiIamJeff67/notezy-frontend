"use client";

import DropFileZone from "@/components/DropFileZone/DropFileZone";
import ItemPath from "@/components/ItemPath/ItemPath";
import StrictLoadingOutlay from "@/components/LoadingOutlay/StrictLoadingOutlay";
import TruncatedText from "@/components/TruncatedText/TruncatedText";
import ChevronDownIcon from "@/components/icons/ChevronDownIcon";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarTrigger,
} from "@/components/ui/menubar";
import { SidebarTrigger, useSidebar } from "@/components/ui/sidebar";
import { Spinner } from "@/components/ui/spinner";
import { useAppRouter, useLanguage, useLoading, useShelfItem } from "@/hooks";
import { useBlockEditor } from "@/hooks/useBlockEditor";
import {
  convertBlocksToDOCX,
  convertBlocksToHTML,
  convertBlocksToJSON,
  convertBlocksToMarkdown,
  convertBlocksToPDF,
  convertBlocksToPlainText,
} from "@/util/convertBlocksToFiles";
import { PartialBlock } from "@blocknote/core";
import "@blocknote/core/style.css";
import { BlockNoteView } from "@blocknote/shadcn";
import { useGetMyBlockGroupsAndTheirBlocksByBlockPackId } from "@shared/api/hooks/blockGroup.hook";
import { ContentType } from "@shared/enums/blockPackContentType.enum";
import { BlockPackMeta } from "@shared/types/blockPackMeta.type";
import { useState, useTransition } from "react";
import toast from "react-hot-toast";

interface BlockPackEditorContentProps {
  blockPackMeta: BlockPackMeta;
}

const BlockPackEditorContent = ({
  blockPackMeta,
}: BlockPackEditorContentProps) => {
  const router = useAppRouter();
  const loadingManager = useLoading();
  const languageManager = useLanguage();
  const sidebarManager = useSidebar();
  const shelfItemManager = useShelfItem();

  const getMyBlockGroupsAndTheirBlocksQuerier =
    useGetMyBlockGroupsAndTheirBlocksByBlockPackId();

  const { editor, state } = useBlockEditor();
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
  const [isSaving, startSavingTransition] = useTransition();
  const [isImporting, startImportingTransition] = useTransition();
  const [isExporting, startExportingTransition] = useTransition();

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
            a.download = `${blockPackMeta.name}.md`;
            break;
          case ContentType.HTML:
            blob = await convertBlocksToHTML(editor);
            a.download = `${blockPackMeta.name}.html`;
            break;
          case ContentType.PlainText:
            blob = await convertBlocksToPlainText(editor);
            a.download = `${blockPackMeta.name}.txt`;
            break;
          case ContentType.JSON:
            blob = await convertBlocksToJSON(editor);
            a.download = `${blockPackMeta.name}.json`;
            break;
          case ContentType.PDF:
            blob = await convertBlocksToPDF(editor);
            a.download = `${blockPackMeta.name}.pdf`;
            break;
          case ContentType.DOCX:
            blob = await convertBlocksToDOCX(editor);
            a.download = `${blockPackMeta.name}.docx`;
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
                <TruncatedText width="1/2">{blockPackMeta.name}</TruncatedText>
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
                  if (blockPackMeta.id)
                    copyToClipboard(blockPackMeta.id.toString());
                }}
                className="hover:cursor-pointer"
              >
                <span className="font-semibold">Id</span>
                <TruncatedText width="200px" className="text-muted-foreground">
                  {blockPackMeta.id}
                </TruncatedText>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => copyToClipboard(blockPackMeta.name)}
                className="hover:cursor-pointer"
              >
                <span className="font-semibold">Name</span>
                <TruncatedText width="200px" className="text-muted-foreground">
                  {blockPackMeta.name}
                </TruncatedText>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() =>
                  copyToClipboard(blockPackMeta.blockCount.toString())
                }
                className="hover:cursor-pointer"
              >
                <span className="font-semibold">Block Count</span>
                <TruncatedText width="200px" className="text-muted-foreground">
                  {blockPackMeta.blockCount}
                </TruncatedText>
              </DropdownMenuItem>
              {blockPackMeta.updatedAt && (
                <DropdownMenuItem
                  onClick={() => {
                    if (blockPackMeta.updatedAt)
                      copyToClipboard(blockPackMeta.updatedAt.toLocaleString());
                  }}
                  className="hover:cursor-pointer"
                >
                  <span className="font-semibold">Updated At</span>
                  <span className="text-muted-foreground">
                    {blockPackMeta.updatedAt.toLocaleString()}
                  </span>
                </DropdownMenuItem>
              )}
              {blockPackMeta.createdAt && (
                <DropdownMenuItem
                  onClick={() => {
                    if (blockPackMeta.createdAt)
                      copyToClipboard(blockPackMeta.createdAt.toLocaleString());
                  }}
                  className="hover:cursor-pointer"
                >
                  <span className="font-semibold">Created At</span>
                  <span className="text-muted-foreground">
                    {blockPackMeta.createdAt.toLocaleString()}
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
                onClick={async () => {
                  const blob = await convertBlocksToMarkdown(editor);
                  await handleExportFiles(ContentType.Markdown);
                }}
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
        parentSubShelfId={blockPackMeta.parentId}
        itemId={blockPackMeta.id}
        itemType="BlockPack"
        path={blockPackMeta.path}
        summary={shelfItemManager.expandedShelves.get(
          blockPackMeta.rootId.toString()
        )}
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

export default BlockPackEditorContent;
