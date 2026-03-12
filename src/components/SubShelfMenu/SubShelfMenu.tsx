import SubShelfMenuItem from "@/components/SubShelfMenu/SubShelfMenuItem";
import SubShelfMenuItemSkeleton from "@/components/SubShelfMenu/SubShelfMenuItemSkeleton";
import { SidebarMenu, SidebarMenuItem } from "@/components/ui/sidebar";
import { useLanguage, useLoading, useShelfItem } from "@/hooks";
import { RootShelfNode } from "@shared/types/shelfNodes.type";
import { ShelfTreeSummary } from "@shared/types/shelfTreeSummary.type";
import { CheckIcon } from "lucide-react";
import { Suspense, useCallback } from "react";
import toast from "react-hot-toast";

interface SubShelfMenuProps {
  summary: ShelfTreeSummary;
  root: RootShelfNode;
}

// handle the translation and some loading states here
const SubShelfMenu = ({ summary, root }: SubShelfMenuProps) => {
  const loadingManager = useLoading();
  const languageManager = useLanguage();
  const shelfItemManager = useShelfItem();

  const handleRenameSubShelfOnSubmit = useCallback(
    async () =>
      await loadingManager.startAsyncTransactionLoading(
        async () =>
          await shelfItemManager
            .renameEditingSubShelf()
            .catch(error => toast.error(languageManager.tError(error)))
      ),
    [loadingManager, languageManager, shelfItemManager]
  );

  return (
    <SidebarMenu>
      <Suspense fallback={<SubShelfMenuItemSkeleton />}>
        {Object.entries(root.children).map(([subShelfId, subShelfNode]) => {
          return (
            <Suspense fallback={<SubShelfMenuItemSkeleton />} key={subShelfId}>
              {shelfItemManager.isSubShelfNodeEditing(subShelfNode.id) ? (
                <SidebarMenuItem className="flex items-center justify-end rounded-sm px-2 py-1 bg-muted border-1 border-foreground relative">
                  <input
                    ref={shelfItemManager.inputRef}
                    type="text"
                    value={shelfItemManager.editSubShelfNodeName}
                    className="flex-1 bg-transparent w-full h-6 outline-none overflow-hidden"
                    onChange={e =>
                      shelfItemManager.setEditSubShelfNodeName(e.target.value)
                    }
                    onKeyDown={async e => {
                      switch (e.key) {
                        case "Enter":
                          await handleRenameSubShelfOnSubmit();
                        case "Escape":
                          shelfItemManager.cancelRenamingSubShelfNode();
                      }
                    }}
                    // note that autoFocus doesn't work in this case,
                    // bcs the user clicked context menu trigger before the input element rendering
                  />
                  {shelfItemManager.isNewSubShelfNodeName() && (
                    <button
                      className="rounded hover:bg-primary/60 absolute w-4 h-4"
                      onClick={handleRenameSubShelfOnSubmit}
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
