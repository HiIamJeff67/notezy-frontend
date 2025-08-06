import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { AllCountries, AllUserGenders } from "@/shared/enums";
import { zodResolver } from "@hookform/resolvers/zod";
import { SelectValue } from "@radix-ui/react-select";
import { format } from "date-fns";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import {
  AccountSettingUser,
  AccountSettingUserInfo,
  AccountSettingUserInfoSchema,
  AccountSettingUserSchema,
} from "./AccountSettingsPanel";

interface ProfileTabProps {
  accountSettingUser: AccountSettingUser;
  accountSettingUserInfo: AccountSettingUserInfo;
  setAccountSettingUser: (accountSettingUser: AccountSettingUser) => void;
  setAccountSettingUserInfo: (
    accountSettingUserInfo: AccountSettingUserInfo
  ) => void;
}

const ProfileTab = ({
  accountSettingUser,
  accountSettingUserInfo,
  setAccountSettingUser,
  setAccountSettingUserInfo,
}: ProfileTabProps) => {
  const userForm = useForm({
    resolver: zodResolver(AccountSettingUserSchema),
    defaultValues: accountSettingUser,
  });

  const userInfoForm = useForm({
    resolver: zodResolver(AccountSettingUserInfoSchema),
    defaultValues: accountSettingUserInfo,
  });

  useEffect(() => {
    console.log(accountSettingUserInfo);
  }, []);

  return (
    <div className="space-y-8">
      <Form {...userInfoForm}>
        <form
          onSubmit={userInfoForm.handleSubmit(data => {
            toast.success("UserInfo 已送出");
            // 這裡可以呼叫 API
            console.log("UserInfo submit", data);
          })}
          className="rounded-lg overflow-hidden mb-8 border bg-white"
        >
          <div
            className="relative w-full group"
            style={{
              minHeight: 180,
              background: userInfoForm.getValues("coverBackgroundURL")
                ? `url(${userInfoForm.getValues(
                    "coverBackgroundURL"
                  )}) center/cover no-repeat`
                : "foreground",
            }}
          >
            <div
              className="absolute inset-0 bg-black/30 opacity-0 hover:opacity-100 flex items-center justify-center cursor-pointer transition"
              onClick={() => {}}
            >
              <span className="text-white text-xl font-semibold">
                點擊即可變更背景圖片
              </span>
            </div>
            <div
              className="absolute right-8 bottom-[-64px] z-10 group/avatar"
              onClick={() => {}}
            >
              <div className="w-32 h-32 rounded-full border-4 border-border shadow-lg bg-background flex items-center justify-center overflow-hidden relative cursor-pointer">
                <img
                  src={userInfoForm.getValues("avatarURL") || ""}
                  alt="Avatar"
                  className="w-full h-full object-cover bg-gray-100"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/avatar:opacity-100 flex items-center justify-center transition">
                  <span className="text-white text-center font-semibold text-sm">
                    點擊即可變更頭像
                  </span>
                </div>
              </div>
            </div>
            <div style={{ height: 120 }} />
          </div>
          {/* UserInfo 其他欄位 */}
          <div className="px-8 pt-12 pb-8 bg-secondary flex flex-col gap-4">
            <FormField
              control={userInfoForm.control}
              name="header"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>個人標題</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      value={field.value ?? ""}
                      className="caret-foreground"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={userInfoForm.control}
              name="introduction"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>自我介紹</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      value={field.value ?? ""}
                      className="text-base text-gray-700 mb-6 caret-foreground"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex flex-wrap gap-6 text-sm">
              <FormField
                control={userInfoForm.control}
                name="gender"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>性別</FormLabel>
                    <FormControl>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="請選擇性別" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            <SelectLabel>性別</SelectLabel>
                            {AllUserGenders.map(gender => (
                              <SelectItem key={gender} value={gender}>
                                {gender}
                              </SelectItem>
                            ))}
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={userInfoForm.control}
                name="country"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>國家</FormLabel>
                    <FormControl>
                      <Select
                        value={field.value ?? undefined}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="請選擇國家" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            <SelectLabel>國家</SelectLabel>
                            {AllCountries.map(country => (
                              <SelectItem key={country} value={country}>
                                {country}
                              </SelectItem>
                            ))}
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={userInfoForm.control}
                name="birthDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>生日</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant={"outline"}
                          className={`w-[200px] justify-start text-left font-normal",
                            ${!field.value && "text-muted-foreground"}`}
                        >
                          {field.value
                            ? format(
                                typeof field.value === "string"
                                  ? new Date(field.value)
                                  : field.value,
                                "yyyy-MM-dd"
                              )
                            : "請選擇日期"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={userInfoForm.control}
                name="updatedAt"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>上次修改</FormLabel>
                    <FormControl>
                      <Input
                        value={
                          field.value instanceof Date
                            ? field.value.toLocaleString()
                            : field.value
                        }
                        readOnly
                        tabIndex={-1}
                        className="bg-gray-100 cursor-not-allowed"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="flex justify-start gap-2">
              <Button type="submit" className="max-w-2/5">
                Save UserInfo
              </Button>
              <Button
                type="reset"
                className="max-w-2/5 bg-destructive hover:bg-destructive/90"
              >
                Reset Changes
              </Button>
            </div>
          </div>
        </form>
      </Form>
      {/* User 區塊 */}
      <Form {...userForm}>
        <form
          onSubmit={userForm.handleSubmit(data => {
            toast.success("User 已送出");
            // 這裡可以呼叫 API
            console.log("User submit", data);
          })}
          className="rounded-lg border-1 border-border bg-secondary p-8 space-y-4"
        >
          <div className="grid grid-cols-2 gap-4 text-sm">
            <FormField
              control={userForm.control}
              name="publicId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>公開ID</FormLabel>
                  <FormControl>
                    <Input {...field} readOnly />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={userForm.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>帳戶名稱</FormLabel>
                  <FormControl>
                    <Input {...field} readOnly />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={userForm.control}
              name="displayName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>名稱</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={userForm.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>電子郵件</FormLabel>
                  <FormControl>
                    <Input {...field} readOnly />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={userForm.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>角色</FormLabel>
                  <FormControl>
                    <Input {...field} readOnly />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={userForm.control}
              name="plan"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>方案</FormLabel>
                  <FormControl>
                    <Input {...field} readOnly />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={userForm.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>狀態</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={userForm.control}
              name="createdAt"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>加入日期</FormLabel>
                  <FormControl>
                    <Input
                      value={
                        field.value instanceof Date
                          ? field.value.toLocaleDateString()
                          : field.value
                      }
                      readOnly
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>
          <button
            type="submit"
            className="mt-6 px-4 py-2 bg-primary text-white rounded"
          >
            Save User
          </button>
        </form>
      </Form>
    </div>
  );
};

export default ProfileTab;
