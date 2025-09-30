import { useLanguage, useLoading, useShelf } from "@/hooks";
import {
  RootShelfNode,
  ShelfTreeSummary,
} from "@shared/lib/shelfMaterialNodes";
import { CheckIcon } from "lucide-react";
import { Suspense, useCallback } from "react";
import toast from "react-hot-toast";
import MapPlaceholder from "../MapPlaceholder/MapPlaceholder";
import { SidebarMenu, SidebarMenuItem } from "../ui/sidebar";
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
  const shelfManager = useShelf();

  const handleRenameSubShelfOnSubmit = useCallback(async (): Promise<void> => {
    loadingManager.setIsLoading(true);

    try {
      await shelfManager.renameEditingSubShelf();
    } catch (error) {
      toast.error(languageManager.tError(error));
    } finally {
      loadingManager.setIsLoading(false);
    }
  }, [loadingManager, languageManager, shelfManager]);

  return (
    <SidebarMenu>
      {Object.entries(root.children).map(([subShelfId, subShelfNode]) => {
        if (subShelfNode === undefined)
          return <MapPlaceholder key={subShelfId} />;

        return (
          <Suspense fallback={<SubShelfMenuItemSkeleton />} key={subShelfId}>
            {shelfManager.isSubShelfNodeEditing(subShelfNode) ? (
              <SidebarMenuItem className="flex items-center justify-end rounded-sm px-2 py-1 bg-muted border-1 border-foreground relative">
                <input
                  ref={shelfManager.inputRef}
                  type="text"
                  value={shelfManager.editSubShelfName}
                  className="flex-1 bg-transparent w-full h-6 outline-none caret-foreground overflow-hidden"
                  onChange={e =>
                    shelfManager.setEditSubShelfName(e.target.value)
                  }
                  onKeyDown={async e => {
                    switch (e.key) {
                      case "Enter":
                        await handleRenameSubShelfOnSubmit();
                      case "Escape":
                        shelfManager.cancelRenamingSubShelf();
                    }
                  }}
                  // note that autoFocus doesn't work in this case,
                  // bcs the user clicked context menu trigger before the input element rendering
                />
                {shelfManager.isNewSubShelfName() && (
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
    </SidebarMenu>
  );
};

export default SubShelfMenu;
