import { zodResolver } from "@hookform/resolvers/zod";
import { useUpdateMe } from "@shared/api/hooks/user.hook";
import { AllUserStatus } from "@shared/api/interfaces/enums";
import { FakeUser } from "@shared/constants";
import toast from "@shared/lib/toast";
import { User, UserSchema } from "@shared/types/user.type";
import { memo, useCallback, useEffect, useMemo } from "react";
import { UseFormReturn, useForm } from "react-hook-form";
import SettingMenuItem from "@/components/menus/SettingMenu/SettingMenuItem";
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
import { useUser } from "@/hooks/useUser";

const AccountTab = memo(() => {
  const loadingManager = useLoading();
  const languageManager = useLanguage();
  const userManager = useUser();
  const updateMeMutator = useUpdateMe();

  const user: User = useMemo(() => {
    if (!userManager.userData) return FakeUser;
    return {
      publicId: userManager.userData.publicId,
      name: userManager.userData.name,
      displayName: userManager.userData.displayName,
      email: userManager.userData.email,
      role: userManager.userData.role,
      plan: userManager.userData.plan,
      status: userManager.userData.status,
      updatedAt: userManager.userData.updatedAt,
      createdAt: userManager.userData.createdAt,
    };
  }, [userManager.userData]);

  const userForm: UseFormReturn<User> = useForm({
    resolver: zodResolver(UserSchema),
    defaultValues: user,
  }) as UseFormReturn<User>;

  useEffect(() => {
    userForm.reset(user);
  }, [user, userForm]);

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
    async (user: User) =>
      await loadingManager.startAsyncTransactionLoading(async () => {
        try {
          const userAgent = navigator.userAgent;
          await updateMeMutator.mutateAsync({
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

          userManager.updateUserData({
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
        }
      }),
    [loadingManager, userManager, languageManager, updateMeMutator]
  );

  return (
    <Form {...userForm}>
      <form
        className="w-full h-full overflow-hidden flex flex-col"
        method="POST"
        onSubmit={userForm.handleSubmit(handleSaveUserOnSubmit)}
      >
        <div
          className="
          flex flex-col px-8 pt-12 pb-8 bg-muted gap-6 min-h-full
          overflow-y-scroll ![scrollbar-color:var(--muted-foreground)_var(--secondary)]"
        >
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
                      value={field.value ?? ""}
                      placeholder="設定顯示名稱"
                      className="w-[200px]"
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
                  hideSeparator
                >
                  <></>
                </SettingMenuItem>
              </FormItem>
            )}
          />

          <div className="flex justify-start gap-4 pt-6 border-t border-border/50">
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
