import { AccessControlPermission } from "@shared/api/interfaces/enums/accessControlPermission.enum";
import type { UUID } from "crypto";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export type ShelfCollaboratorPermission =
  | AccessControlPermission.Admin
  | AccessControlPermission.Write
  | AccessControlPermission.Read;

interface AddShelfCollaboratorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userPublicId: string;
  onUserPublicIdChange: (userPublicId: string) => void;
  permission: ShelfCollaboratorPermission;
  onPermissionChange: (permission: ShelfCollaboratorPermission) => void;
  permissionOptions: readonly ShelfCollaboratorPermission[];
  canManageSharing: boolean;
  currentUserPublicId?: UUID;
  isPending: boolean;
  onSubmit: () => void;
}

const AddShelfCollaboratorDialog = ({
  open,
  onOpenChange,
  userPublicId,
  onUserPublicIdChange,
  permission,
  onPermissionChange,
  permissionOptions,
  canManageSharing,
  currentUserPublicId,
  isPending,
  onSubmit,
}: AddShelfCollaboratorDialogProps) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent overlayClassName="z-[170]" className="z-[180] sm:max-w-md">
      <DialogHeader>
        <DialogTitle>Add collaborator</DialogTitle>
        <DialogDescription>
          Paste a user public ID and choose the RootShelf permission.
        </DialogDescription>
      </DialogHeader>
      <div className="grid gap-4">
        <Input
          value={userPublicId}
          onChange={event => onUserPublicIdChange(event.target.value)}
          placeholder="User public ID"
        />
        <Select
          value={permission}
          onValueChange={value =>
            onPermissionChange(value as ShelfCollaboratorPermission)
          }
        >
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="z-[190]">
            {permissionOptions.map(value => (
              <SelectItem key={value} value={value}>
                {value}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={() => onOpenChange(false)}>
          Cancel
        </Button>
        <Button
          disabled={
            !canManageSharing ||
            isPending ||
            !userPublicId.trim() ||
            userPublicId.trim() === currentUserPublicId
          }
          onClick={onSubmit}
        >
          {isPending ? "Adding..." : "Add"}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
);

export default AddShelfCollaboratorDialog;
