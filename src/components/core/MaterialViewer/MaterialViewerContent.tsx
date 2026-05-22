import {
  useSaveMyMaterialById,
  useUpdateMyMaterialById,
} from "@shared/api/hooks/material.hook";
import { LocalStorageManipulator } from "@shared/lib/localStorageManipulator";
import toast from "@shared/lib/toast";
import { LocalStorageKey } from "@shared/types/localStorage.type";
import { MaterialMeta } from "@shared/types/materialMeta.type";
import { getAuthorization } from "@shared/util/getAuthorization";
import { ChevronDownIcon } from "lucide-react";
import { Dispatch, useEffect, useMemo, useState, useTransition } from "react";
import DropFileZone from "@/components/commons/DropFileZone/DropFileZone";
import TruncatedText from "@/components/commons/TruncatedText/TruncatedText";
import ItemPath from "@/components/paths/ItemPath/ItemPath";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarTrigger,
} from "@/components/ui/menubar";
import { SidebarTrigger, useSidebar } from "@/components/ui/sidebar";
import { Spinner } from "@/components/ui/spinner";
import { useAppRouter, useLanguage, useShelfItem } from "@/hooks";
import { MaterialMetaAction } from "@/reducers/materialMeta.reducer";

interface MaterialViewerContentProps {
  meta: MaterialMeta;
  dispatchMeta: Dispatch<MaterialMetaAction>;
}

const MaterialViewerContent = ({
  meta,
  dispatchMeta,
}: MaterialViewerContentProps) => {
  const router = useAppRouter();
  const languageManager = useLanguage();
  const sidebarManager = useSidebar();
  const shelfItemManager = useShelfItem();
  const saveMaterialMutator = useSaveMyMaterialById();
  const updateMaterialMutator = useUpdateMyMaterialById();

  const [nameDraft, setNameDraft] = useState<string>(meta.name);
  const [isMetaDropdownOpen, setIsMetaDropdownOpen] = useState<boolean>(false);
  const [isFileLoading, setIsFileLoading] = useState<boolean>(false);
  const [isFileAvailable, setIsFileAvailable] = useState<boolean>(false);
  const [textPreview, setTextPreview] = useState<string | null>(null);
  const [isRenaming, startRenamingTransition] = useTransition();
  const [isReplacing, startReplacingTransition] = useTransition();

  const isTextLike = useMemo(() => {
    return (
      meta.contentType.startsWith("text/") ||
      meta.contentType === "application/json"
    );
  }, [meta.contentType]);
  const isNoneContentType = useMemo(() => {
    return meta.contentType.trim().toLowerCase() === "none";
  }, [meta.contentType]);

  useEffect(() => {
    setNameDraft(meta.name);
  }, [meta.name]);

  const loadFile = async () => {
    setIsFileLoading(true);
    setTextPreview(null);

    if (isNoneContentType || !meta.downloadURL) {
      setIsFileAvailable(false);
      setIsFileLoading(false);
      return;
    }

    try {
      if (isTextLike) {
        const response = await fetch(meta.downloadURL);
        if (!response.ok) {
          setIsFileAvailable(false);
          return;
        }

        setIsFileAvailable(true);
        const rawText = await response.text();
        if (meta.contentType === "application/json") {
          try {
            setTextPreview(JSON.stringify(JSON.parse(rawText), null, 2));
          } catch {
            setTextPreview(rawText);
          }
        } else {
          setTextPreview(rawText);
        }
      } else {
        const response = await fetch(meta.downloadURL, {
          method: "HEAD",
        }).catch(() => null);
        if (response && response.ok) {
          setIsFileAvailable(true);
          return;
        }

        const fallback = await fetch(meta.downloadURL).catch(() => null);
        setIsFileAvailable(!!fallback?.ok);
      }
    } catch {
      setIsFileAvailable(false);
    } finally {
      setIsFileLoading(false);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success("Copied");
    } catch (error) {
      toast.error(languageManager.tError(error));
    }
  };

  const handleRenameMaterial = async () => {
    if (nameDraft.trim() === "" || nameDraft === meta.name) return;

    startRenamingTransition(async () => {
      try {
        const accessToken = LocalStorageManipulator.getItemByKey(
          LocalStorageKey.accessToken
        );
        const response = await updateMaterialMutator.mutateAsync({
          header: {
            userAgent: navigator.userAgent,
            authorization: getAuthorization(accessToken),
          },
          body: {
            materialId: meta.id,
            values: {
              name: nameDraft,
            },
          },
          affected: {
            parentSubShelfId: meta.parentId,
          },
        });

        dispatchMeta({ type: "setName", newName: nameDraft });
        dispatchMeta({
          type: "setUpdatedAt",
          newUpdatedAt: response.data.updatedAt,
        });
        toast.success("Material name updated");
      } catch (error) {
        toast.error(languageManager.tError(error));
      }
    });
  };

  const handleReplaceFile = async (contentFile: File) => {
    startReplacingTransition(async () => {
      try {
        const accessToken = LocalStorageManipulator.getItemByKey(
          LocalStorageKey.accessToken
        );
        await saveMaterialMutator.mutateAsync({
          header: {
            userAgent: navigator.userAgent,
            authorization: getAuthorization(accessToken),
          },
          body: {
            materialId: meta.id,
            contentFile: contentFile,
          },
          affected: {
            parentSubShelfId: meta.parentId,
          },
        });
        router.refresh();
        toast.success("Material file replaced");
      } catch (error) {
        toast.error(languageManager.tError(error));
      }
    });
  };

  useEffect(() => {
    void loadFile();
  }, [meta.id, meta.downloadURL, meta.contentType, isNoneContentType]);

  return (
    <div className="w-full h-full flex flex-col justify-center items-start bg-cover bg-center bg-no-repeat">
      <header className="w-full h-14 flex shrink-0 justify-between items-center px-4 gap-2 bg-background/15 backdrop-blur-md border-b border-background/10">
        <div className="flex justify-start items-center gap-2">
          {sidebarManager.isMobile && <SidebarTrigger />}
          <DropdownMenu
            open={isMetaDropdownOpen}
            onOpenChange={setIsMetaDropdownOpen}
          >
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="font-semibold text-2xl select-none border-none focus-visible:ring-0 focus-visible:ring-offset-0"
              >
                <TruncatedText width="1/2">{meta.name}</TruncatedText>
                <ChevronDownIcon
                  className={`transition ${isMetaDropdownOpen ? "-rotate-180" : ""}`}
                />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" side="bottom">
              <DropdownMenuItem
                onClick={() => copyToClipboard(meta.id.toString())}
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
                onClick={() => copyToClipboard(meta.contentType)}
                className="hover:cursor-pointer"
              >
                <span className="font-semibold">Content Type</span>
                <TruncatedText width="200px" className="text-muted-foreground">
                  {meta.contentType}
                </TruncatedText>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => copyToClipboard(String(meta.size))}
                className="hover:cursor-pointer"
              >
                <span className="font-semibold">Size</span>
                <span className="text-muted-foreground">
                  {String(meta.size)} bytes
                </span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => copyToClipboard(meta.updatedAt.toLocaleString())}
                className="hover:cursor-pointer"
              >
                <span className="font-semibold">Updated At</span>
                <span className="text-muted-foreground">
                  {meta.updatedAt.toLocaleString()}
                </span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => copyToClipboard(meta.createdAt.toLocaleString())}
                className="hover:cursor-pointer"
              >
                <span className="font-semibold">Created At</span>
                <span className="text-muted-foreground">
                  {meta.createdAt.toLocaleString()}
                </span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <Menubar className="bg-muted/25">
          <MenubarMenu>
            <MenubarTrigger>
              {isRenaming ? <Spinner /> : <span>Rename</span>}
            </MenubarTrigger>
            <MenubarContent align="end" side="bottom">
              <div className="w-[260px] p-2 space-y-2">
                <Input
                  value={nameDraft}
                  onChange={e => setNameDraft(e.target.value)}
                  placeholder="Material name"
                />
                <Button
                  className="w-full"
                  onClick={handleRenameMaterial}
                  disabled={
                    nameDraft.trim() === "" ||
                    nameDraft === meta.name ||
                    isRenaming
                  }
                >
                  Save Name
                </Button>
              </div>
            </MenubarContent>
          </MenubarMenu>
          <MenubarMenu>
            <MenubarTrigger>
              {isReplacing ? <Spinner /> : <span>Replace</span>}
            </MenubarTrigger>
            <MenubarContent align="end" side="bottom">
              <div className="w-[300px] p-2 space-y-2">
                <DropFileZone
                  disabled={isReplacing}
                  width="100%"
                  height="140px"
                  accept={undefined}
                  onDrop={async files => {
                    const targetFile = files[0];
                    if (!targetFile) return;
                    await handleReplaceFile(targetFile);
                  }}
                />
              </div>
            </MenubarContent>
          </MenubarMenu>
          <MenubarMenu>
            <MenubarTrigger>Actions</MenubarTrigger>
            <MenubarContent align="end" side="bottom">
              <MenubarItem
                disabled={!meta.downloadURL}
                onClick={async () => {
                  if (!meta.downloadURL) return;
                  await copyToClipboard(meta.downloadURL);
                }}
              >
                Copy Download URL
              </MenubarItem>
              <MenubarItem
                disabled={!meta.downloadURL}
                onClick={() => {
                  if (!meta.downloadURL) return;
                  window.open(
                    meta.downloadURL,
                    "_blank",
                    "noopener,noreferrer"
                  );
                }}
              >
                Open In New Tab
              </MenubarItem>
              <MenubarItem onClick={async () => await loadFile()}>
                Refresh
              </MenubarItem>
            </MenubarContent>
          </MenubarMenu>
        </Menubar>
      </header>
      <ItemPath
        parentSubShelfId={meta.parentId}
        itemId={meta.id}
        itemType="Material"
        path={meta.path}
        summary={shelfItemManager.expandedShelves.get(meta.rootId.toString())}
      />
      <div className="w-full h-full rounded-none p-8 z-0 overflow-auto">
        {isFileLoading && (
          <div className="text-muted-foreground text-sm">Loading file...</div>
        )}

        {!isFileLoading && !isFileAvailable && (
          <div className="w-full min-h-[60vh] flex justify-center items-center">
            <div className="font-bold text-foreground text-base text-center">
              No file uploaded, please upload a file to view.
            </div>
          </div>
        )}

        {!isFileLoading &&
          isFileAvailable &&
          meta.contentType.startsWith("image/") && (
            <img
              src={meta.downloadURL as string}
              alt={meta.name}
              className="max-h-[70vh] w-auto"
            />
          )}

        {!isFileLoading &&
          isFileAvailable &&
          meta.contentType.startsWith("video/") && (
            <video
              src={meta.downloadURL as string}
              controls
              className="max-h-[70vh] w-full"
            />
          )}

        {!isFileLoading &&
          isFileAvailable &&
          meta.contentType.startsWith("audio/") && (
            <audio
              src={meta.downloadURL as string}
              controls
              className="w-full"
            />
          )}

        {!isFileLoading &&
          isFileAvailable &&
          meta.contentType === "application/pdf" && (
            <iframe
              src={meta.downloadURL as string}
              title={meta.name}
              className="w-full h-[70vh]"
            />
          )}

        {!isFileLoading && isFileAvailable && isTextLike && (
          <pre className="whitespace-pre-wrap break-all text-sm">
            {textPreview ?? ""}
          </pre>
        )}

        {!isFileLoading &&
          isFileAvailable &&
          !meta.contentType.startsWith("image/") &&
          !meta.contentType.startsWith("video/") &&
          !meta.contentType.startsWith("audio/") &&
          meta.contentType !== "application/pdf" &&
          !isTextLike && (
            <a
              href={meta.downloadURL as string}
              target="_blank"
              rel="noreferrer"
              className="underline text-primary"
            >
              Open file in new tab
            </a>
          )}
      </div>
    </div>
  );
};

export default MaterialViewerContent;
