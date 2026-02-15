import BlockPackMenuItem from "@/components/BlockPackMenu/BlockPackMenuItem";
import BlockPackMenuItemSkeleton from "@/components/BlockPackMenu/BlockPackMenuItemSkeleton";
import CheckIcon from "@/components/icons/CheckIcon";
import { SidebarMenuItem } from "@/components/ui/sidebar";
import { useLanguage, useLoading, useShelfItem } from "@/hooks";
import { SubShelfNode } from "@shared/types/shelfNodes.type";
import { Suspense, useCallback } from "react";
import toast from "react-hot-toast";

interface BlockPackMenuProps {
  parent: SubShelfNode;
}

const BlockPackMenu = ({ parent }: BlockPackMenuProps) => {
  const loadingManager = useLoading();
  const languageManager = useLanguage();
  const shelfItemManager = useShelfItem();

  const handleRenameBlockPackOnSubmit = useCallback(async (): Promise<void> => {
    loadingManager.startAsyncTransactionLoading(async () => {
      try {
        await shelfItemManager.renameEditingBlockPack();
      } catch (error) {
        toast.error(languageManager.tError(error));
      }
    });
  }, [loadingManager, languageManager, shelfItemManager]);

  return (
    <Suspense fallback={<BlockPackMenuItemSkeleton />}>
      {Object.entries(parent.blockPackNodes).map(
        ([blockPackId, blockPackNode]) => {
          return (
            <Suspense
              fallback={<BlockPackMenuItemSkeleton />}
              key={blockPackId}
            >
              {shelfItemManager.isItemNodeEditing(blockPackNode.id) ? (
                <SidebarMenuItem
                  key={blockPackId}
                  className="flex items-center justify-end rounded-sm px-2 py-1 bg-muted border-1 border-foreground relative"
                >
                  <input
                    ref={shelfItemManager.inputRef}
                    type="text"
                    value={shelfItemManager.editItemNodeName}
                    className="flex-1 bg-transparent w-full h-6 outline-none overflow-hidden"
                    onChange={e =>
                      shelfItemManager.setEditItemNodeName(e.target.value)
                    }
                    onKeyDown={async e => {
                      switch (e.key) {
                        case "Enter":
                          await handleRenameBlockPackOnSubmit();
                        case "Escape":
                          shelfItemManager.cancelRenamingItemNode();
                      }
                    }}
                  />
                  {shelfItemManager.isNewItemNodeName() && (
                    <button
                      onClick={async e => {
                        await handleRenameBlockPackOnSubmit();
                        e.stopPropagation();
                      }}
                      className="rounded hover:bg-primary/60 absolute w-4 h-4"
                      onMouseDown={e => e.stopPropagation()}
                    >
                      <CheckIcon className="w-full h-full" />
                    </button>
                  )}
                </SidebarMenuItem>
              ) : (
                <BlockPackMenuItem
                  key={blockPackId}
                  parent={parent}
                  current={blockPackNode}
                />
              )}
            </Suspense>
          );
        }
      )}
    </Suspense>
  );
};

export default BlockPackMenu;
