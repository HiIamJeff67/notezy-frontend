"use client";

import { UpdateMe } from "@/api/user.api";
import SettingMenuItem from "@/components/SettingMenuItem/SettingMenuItem";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useLanguage, useLoading } from "@/hooks";
import { useUserData } from "@/hooks/useUserData";
import { zodResolver } from "@hookform/resolvers/zod";
import { memo, useCallback, useMemo } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { AllUserStatus } from "../../../shared/types/enums";
import { PrivateUser, PrivateUserSchema } from "../../../shared/types/models";

interface AccountTabProps {
  user: PrivateUser;
}

const AccountTab = memo(({ user }: AccountTabProps) => {
  const loadingManager = useLoading();
  const languageManager = useLanguage();
  const userDataManager = useUserData();

  const userForm = useForm({
    resolver: zodResolver(PrivateUserSchema),
    defaultValues: user,
  });

  const statusOptions = useMemo(
    () =>
      AllUserStatus.map(status => (
        <SelectItem key={status} value={status}>
          {status}
        </SelectItem>
      )),
    []
  );

  const handleSaveUserOnSubmit = useCallback(
    async (user: PrivateUser) => {
      loadingManager.setIsLoading(true);

      try {
        const userAgent = navigator.userAgent;
        await UpdateMe({
          header: { userAgent },
          body: {
            values: {
              displayName: user.displayName,
              status: user.status,
            },
            setNull: {
              displayName: user.displayName === null,
              status: user.status === null,
            },
          },
        });

        userDataManager.updateUserData({
          ...(user.displayName !== undefined && {
            displayName: user.displayName,
          }),
          ...(user.status !== undefined && {
            status: user.status,
          }),
        });

        toast.success("Successfully updated account");
      } catch (error) {
        toast.error(languageManager.tError(error));
      } finally {
        loadingManager.setIsLoading(false);
      }
    },
    [loadingManager, userDataManager, languageManager]
  );

  return (
    <Form {...userForm}>
      <form
        onSubmit={userForm.handleSubmit(handleSaveUserOnSubmit)}
        className="w-full h-full overflow-y-scroll"
      >
        <div className="px-8 pt-12 pb-8 bg-secondary flex flex-col gap-6 min-h-full">
          <FormField
            control={userForm.control}
            name="publicId"
            render={({ field }) => (
              <FormItem>
                <SettingMenuItem title="公開 ID" description={field.value}>
                  <></>
                </SettingMenuItem>
              </FormItem>
            )}
          />

          <FormField
            control={userForm.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <SettingMenuItem title="帳戶名稱" description={field.value}>
                  <></>
                </SettingMenuItem>
              </FormItem>
            )}
          />

          <FormField
            control={userForm.control}
            name="displayName"
            render={({ field }) => (
              <FormItem>
                <SettingMenuItem
                  title="顯示名稱"
                  description={field.value || "未設定顯示名稱"}
                >
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="設定顯示名稱"
                      className="w-[200px] caret-foreground"
                    />
                  </FormControl>
                </SettingMenuItem>
                <FormMessage className="ml-[200px] mt-1" />
              </FormItem>
            )}
          />

          <FormField
            control={userForm.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <SettingMenuItem title="電子郵件" description={field.value}>
                  <></>
                </SettingMenuItem>
              </FormItem>
            )}
          />

          <FormField
            control={userForm.control}
            name="role"
            render={({ field }) => (
              <FormItem>
                <SettingMenuItem title="角色" description={field.value}>
                  <></>
                </SettingMenuItem>
              </FormItem>
            )}
          />

          <FormField
            control={userForm.control}
            name="plan"
            render={({ field }) => (
              <FormItem>
                <SettingMenuItem title="方案" description={field.value}>
                  <></>
                </SettingMenuItem>
              </FormItem>
            )}
          />

          <FormField
            control={userForm.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <SettingMenuItem
                  title="狀態"
                  description={`目前狀態：${field.value}`}
                >
                  <FormControl>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="請選擇狀態" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectLabel>狀態</SelectLabel>
                          <SelectSeparator />
                          {statusOptions}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </FormControl>
                </SettingMenuItem>
                <FormMessage className="ml-[200px] mt-1" />
              </FormItem>
            )}
          />

          <FormField
            control={userForm.control}
            name="createdAt"
            render={({ field }) => (
              <FormItem>
                <SettingMenuItem
                  title="加入日期"
                  description={
                    field.value instanceof Date
                      ? field.value.toLocaleDateString()
                      : field.value
                  }
                  isLast={true}
                >
                  <></>
                </SettingMenuItem>
              </FormItem>
            )}
          />

          <div className="flex justify-start gap-4 mt-8 pt-6 border-t border-border/50">
            <Button type="submit" className="max-w-2/5">
              Save Account
            </Button>
            <Button
              type="button"
              className="max-w-2/5 bg-destructive hover:bg-destructive/90"
              onClick={() => userForm.reset(user)}
            >
              Reset Changes
            </Button>
          </div>
        </div>
      </form>
    </Form>
  );
});

export default AccountTab;
