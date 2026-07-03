import toast from "@shared/lib/toast";
import { Clipboard, Copy } from "lucide-react";
import { ContextMenuItem } from "@/components/ui/context-menu";

type ContextMenuCopyItemsProps = {
  id: string;
  name: string;
  nameLabel?: string;
};

const ContextMenuCopyItems = ({
  id,
  name,
  nameLabel = "Name",
}: ContextMenuCopyItemsProps) => (
  <>
    <ContextMenuItem
      onSelect={() => {
        void navigator.clipboard
          .writeText(name)
          .then(() => toast.success(`${nameLabel} copied`))
          .catch(() =>
            toast.error(`Unable to copy ${nameLabel.toLowerCase()}`)
          );
      }}
    >
      <Copy className="mr-2 size-4" />
      Copy {nameLabel}
    </ContextMenuItem>
    <ContextMenuItem
      onSelect={() => {
        void navigator.clipboard
          .writeText(id)
          .then(() => toast.success("Id copied"))
          .catch(() => toast.error("Unable to copy id"));
      }}
    >
      <Clipboard className="mr-2 size-4" />
      Copy Id
    </ContextMenuItem>
  </>
);

export default ContextMenuCopyItems;
