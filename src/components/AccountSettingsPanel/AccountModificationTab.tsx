"use client";

import SettingMenuItem from "@/components/SettingMenuItem/SettingMenuItem";
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
import { Label } from "@/components/ui/label";
import { useState } from "react";
import toast from "react-hot-toast";

const AccountModificationTab = () => {
  const [resetDialogOpen, setResetDialogOpen] = useState(false);
  const [changePasswordDialogOpen, setChangePasswordDialogOpen] =
    useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [confirmText, setConfirmText] = useState("");

  // 重置帳戶
  const handleResetAccount = async () => {
    try {
      console.log("重置帳戶");
      toast.success("帳戶已重置");
      setResetDialogOpen(false);
    } catch (error) {
      toast.error("重置帳戶失敗");
    }
  };

  // 更改密碼
  const handleChangePassword = async (
    oldPassword: string,
    newPassword: string
  ) => {
    try {
      console.log("更改密碼", { oldPassword, newPassword });
      toast.success("密碼已更新");
      setChangePasswordDialogOpen(false);
    } catch (error) {
      toast.error("密碼更新失敗");
    }
  };

  // 刪除帳戶
  const handleDeleteAccount = async () => {
    if (confirmText !== "DELETE") {
      toast.error("請輸入 DELETE 以確認刪除");
      return;
    }

    try {
      console.log("刪除帳戶");
      toast.success("帳戶已刪除");
      setDeleteDialogOpen(false);
      setConfirmText("");
    } catch (error) {
      toast.error("刪除帳戶失敗");
    }
  };

  return (
    <div className="w-full h-full overflow-y-scroll">
      <div className="px-8 pt-12 pb-8 bg-secondary flex flex-col gap-6 min-h-full">
        <SettingMenuItem
          title="重置帳戶"
          description="將你的帳戶回復到初始狀態，清除所有個人資料但保留帳戶"
        >
          <Button variant="outline" onClick={() => setResetDialogOpen(true)}>
            重置
          </Button>
        </SettingMenuItem>

        <SettingMenuItem
          title="更改密碼"
          description="更新你的帳戶密碼以確保安全性"
        >
          <Button
            variant="outline"
            onClick={() => setChangePasswordDialogOpen(true)}
          >
            更改密碼
          </Button>
        </SettingMenuItem>

        <SettingMenuItem
          title="刪除帳戶"
          description="永久刪除該帳號並無法再存取任何內部資訊"
          titleClassName="text-destructive"
          isLast={true}
        >
          <Button
            variant="destructive"
            onClick={() => setDeleteDialogOpen(true)}
          >
            刪除帳戶
          </Button>
        </SettingMenuItem>
      </div>

      <Dialog open={resetDialogOpen} onOpenChange={setResetDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>確認重置帳戶</DialogTitle>
            <DialogDescription>
              這將會清除你的所有個人資料，包括筆記、設定等。此操作無法復原。
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setResetDialogOpen(false)}>
              取消
            </Button>
            <Button variant="destructive" onClick={handleResetAccount}>
              確認重置
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={changePasswordDialogOpen}
        onOpenChange={setChangePasswordDialogOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>更改密碼</DialogTitle>
            <DialogDescription>請輸入你的舊密碼和新密碼</DialogDescription>
          </DialogHeader>
          <form
            onSubmit={e => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              const oldPassword = formData.get("oldPassword") as string;
              const newPassword = formData.get("newPassword") as string;
              const confirmPassword = formData.get("confirmPassword") as string;

              if (newPassword !== confirmPassword) {
                toast.error("新密碼確認不符");
                return;
              }

              handleChangePassword(oldPassword, newPassword);
            }}
            className="space-y-4"
          >
            <div>
              <Label htmlFor="oldPassword">舊密碼</Label>
              <Input
                id="oldPassword"
                name="oldPassword"
                type="password"
                required
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="newPassword">新密碼</Label>
              <Input
                id="newPassword"
                name="newPassword"
                type="password"
                required
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="confirmPassword">確認新密碼</Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                className="mt-1"
              />
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setChangePasswordDialogOpen(false)}
              >
                取消
              </Button>
              <Button type="submit">更新密碼</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog
        open={deleteDialogOpen}
        onOpenChange={open => {
          setDeleteDialogOpen(open);
          if (!open) setConfirmText("");
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-destructive">永久刪除帳戶</DialogTitle>
            <DialogDescription>
              <strong>警告：</strong>
              這將永久刪除你的帳戶和所有資料，包括所有筆記、個人設定和帳戶資訊。此操作無法復原。
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="confirmDelete">
                請輸入 <code className="bg-muted px-1 rounded">DELETE</code>{" "}
                以確認刪除
              </Label>
              <Input
                id="confirmDelete"
                value={confirmText}
                onChange={e => setConfirmText(e.target.value)}
                placeholder="輸入 DELETE"
                className="mt-1"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setDeleteDialogOpen(false);
                setConfirmText("");
              }}
            >
              取消
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteAccount}
              disabled={confirmText !== "DELETE"}
            >
              永久刪除帳戶
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AccountModificationTab;
