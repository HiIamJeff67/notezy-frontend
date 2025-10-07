import { SidebarMenu, SidebarMenuItem } from "@/components/ui/sidebar";
import { useLanguage, useLoading, useShelfMaterial } from "@/hooks";
import { RootShelfNode } from "@shared/types/shelfMaterialNodes";
import { ShelfTreeSummary } from "@shared/types/shelfTreeSummary.type";
import { CheckIcon } from "lucide-react";
import { Suspense, useCallback } from "react";
import toast from "react-hot-toast";
import SubShelfMenuItem from "./SubShelfMenuItem";
import SubShelfMenuItemSkeleton from "./SubShelfMenuItemSkeleton";

interface SubShelfMenuProps {
  summary: ShelfTreeSummary;
  root: RootShelfNode;
}

// handle the translation and some loading states here
const SubShelfMenu = ({ summary, root }: SubShelfMenuProps) => {
  const loadingManager = useLoading();
  const languageManager = useLanguage();
  const shelfMaterialManager = useShelfMaterial();

  const handleRenameSubShelfOnSubmit = useCallback(async (): Promise<void> => {
    loadingManager.setIsStrictLoading(true);

    try {
      await shelfMaterialManager.renameEditingSubShelf();
    } catch (error) {
      toast.error(languageManager.tError(error));
    } finally {
      loadingManager.setIsStrictLoading(false);
    }
  }, [loadingManager, languageManager, shelfMaterialManager]);

  return (
    <SidebarMenu>
      <Suspense fallback={<SubShelfMenuItemSkeleton />}>
        {Object.entries(root.children).map(([subShelfId, subShelfNode]) => {
          return (
            <Suspense fallback={<SubShelfMenuItemSkeleton />} key={subShelfId}>
              {shelfMaterialManager.isSubShelfNodeEditing(subShelfNode.id) ? (
                <SidebarMenuItem className="flex items-center justify-end rounded-sm px-2 py-1 bg-muted border-1 border-foreground relative">
                  <input
                    ref={shelfMaterialManager.inputRef}
                    type="text"
                    value={shelfMaterialManager.editSubShelfNodeName}
                    className="flex-1 bg-transparent w-full h-6 outline-none caret-foreground overflow-hidden"
                    onChange={e =>
                      shelfMaterialManager.setEditSubShelfNodeName(
                        e.target.value
                      )
                    }
                    onKeyDown={async e => {
                      switch (e.key) {
                        case "Enter":
                          await handleRenameSubShelfOnSubmit();
                        case "Escape":
                          shelfMaterialManager.cancelRenamingSubShelfNode();
                      }
                    }}
                    // note that autoFocus doesn't work in this case,
                    // bcs the user clicked context menu trigger before the input element rendering
                  />
                  {shelfMaterialManager.isNewSubShelfNodeName() && (
                    <button
                      className="rounded hover:bg-primary/60 absolute w-4 h-4"
                      onClick={async () => await handleRenameSubShelfOnSubmit()}
                      onMouseDown={e => e.stopPropagation()}
                    >
                      <CheckIcon className="w-full h-full" />
                    </button>
                  )}
                </SidebarMenuItem>
              ) : (
                <SubShelfMenuItem
                  key={subShelfId}
                  summary={summary}
                  root={root}
                  prev={null}
                  current={subShelfNode}
                  depth={1}
                />
              )}
            </Suspense>
          );
        })}
      </Suspense>
    </SidebarMenu>
  );
};

export default SubShelfMenu;
