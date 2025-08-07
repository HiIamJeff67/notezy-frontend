import { DefaultAvatar1URL } from "@/api/static.api";
import { UpdateMe } from "@/api/user.api";
import { UpdateMyInfo } from "@/api/userInfo.api";
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
  SelectSeparator,
  SelectTrigger,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useLanguage, useLoading } from "@/hooks";
import { useUserData } from "@/hooks/useUserData";
import { AllCountries, AllUserGenders, AllUserStatus } from "@/shared/enums";
import {
  PrivateUser,
  PrivateUserInfo,
  PrivateUserInfoSchema,
  PrivateUserSchema,
} from "@/shared/types/user.type";
import { zodResolver } from "@hookform/resolvers/zod";
import { SelectValue } from "@radix-ui/react-select";
import { format } from "date-fns";
import { memo, startTransition, useCallback, useMemo } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";

interface ProfileTabProps {
  user: PrivateUser;
  userInfo: PrivateUserInfo;
}
const ProfileTab = memo(({ user, userInfo }: ProfileTabProps) => {
  const loadingManager = useLoading();
  const languageManager = useLanguage();
  const userDataManager = useUserData();

  const userFormDefaults = useMemo(() => user, [user]);
  const userInfoFormDefaults = useMemo(() => userInfo, [userInfo]);

  const userForm = useForm({
    resolver: zodResolver(PrivateUserSchema),
    defaultValues: userFormDefaults,
  });

  const userInfoForm = useForm({
    resolver: zodResolver(PrivateUserInfoSchema),
    defaultValues: userInfoFormDefaults,
  });

  const handleSaveUserInfoOnSubmit = useCallback(
    async function (userInfo: PrivateUserInfo): Promise<void> {
      loadingManager.setIsLoading(true);

      try {
        const userAgent = navigator.userAgent;
        await UpdateMyInfo({
          header: {
            userAgent: userAgent,
          },
          body: {
            values: {
              avatarURL: userInfo.avatarURL,
              coverBackgroundURL: userInfo.coverBackgroundURL,
              header: userInfo.header,
              introduction: userInfo.introduction,
              gender: userInfo.gender,
              country: userInfo.country,
              birthDate: userInfo.birthDate,
            },
            setNull: {
              avatarURL: userInfo.avatarURL === null,
              coverBackgroundURL: userInfo.coverBackgroundURL === null,
              header: userInfo.header === null,
              introduction: userInfo.introduction === null,
              gender: userInfo.gender === null,
              country: userInfo.country === null,
              birthDate: userInfo.birthDate === null,
            },
          },
        });

        startTransition(() => {
          userDataManager.updateUserData({
            ...(userInfo.avatarURL !== undefined && {
              avatarURL: userInfo.avatarURL,
            }),
          });
        });

        toast.success("Successfully update the userInfo");
      } catch (error) {
        toast.error(languageManager.tError(error));
      } finally {
        loadingManager.setIsLoading(false);
      }
    },
    [loadingManager, userDataManager, languageManager]
  );

  const handleSaveUserOnSubmit = useCallback(
    async function (user: PrivateUser) {
      loadingManager.setIsLoading(true);

      try {
        const userAgent = navigator.userAgent;
        await UpdateMe({
          header: {
            userAgent: userAgent,
          },
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

        startTransition(() => {
          userDataManager.updateUserData({
            ...(user.displayName !== undefined && {
              displayName: user.displayName,
            }),
            ...(user.status !== undefined && {
              status: user.status,
            }),
          });
        });

        toast.success("Successfully update the user");
      } catch (error) {
        toast.error(languageManager.tError(error));
      } finally {
        loadingManager.setIsLoading(false);
      }
    },
    [loadingManager, userDataManager, languageManager]
  );

  const genderOptions = useMemo(
    () =>
      AllUserGenders.map(gender => (
        <SelectItem key={gender} value={gender}>
          {gender}
        </SelectItem>
      )),
    []
  );
  const countryOptions = useMemo(
    () => [
      <SelectItem
        key="NO_COUNTRY"
        value="NO_COUNTRY"
        className="text-muted-foreground"
      >
        未設定國家
      </SelectItem>,
      ...AllCountries.map(country => (
        <SelectItem key={country} value={country}>
          {country}
        </SelectItem>
      )),
    ],
    []
  );
  const statusOptions = useMemo(
    () =>
      AllUserStatus.map(status => (
        <SelectItem key={status} value={status}>
          {status}
        </SelectItem>
      )),
    []
  );

  return (
    <div className="space-y-8">
      <Form {...userInfoForm}>
        <form
          onSubmit={userInfoForm.handleSubmit(userInfo =>
            handleSaveUserInfoOnSubmit(userInfo)
          )}
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
                  src={userInfoForm.getValues("avatarURL") || DefaultAvatar1URL}
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
                      className="text-base mb-6 caret-foreground"
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
                            <SelectSeparator />
                            {genderOptions}
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
                        value={field.value || ""}
                        onValueChange={value => {
                          if (value === "NO_COUNTRY") {
                            field.onChange(null);
                          } else {
                            field.onChange(value);
                          }
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="未設定國家" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            <SelectLabel>國家</SelectLabel>
                            <SelectSeparator />
                            {countryOptions}
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
            <div className="flex justify-start gap-2 mt-4">
              <Button type="submit" className="max-w-2/5">
                Save UserInfo
              </Button>
              <Button
                type="button"
                className="max-w-2/5 bg-destructive hover:bg-destructive/90"
                onClick={() => {
                  userInfoForm.reset(userInfo);
                }}
              >
                Reset Changes
              </Button>
            </div>
          </div>
        </form>
      </Form>
      <Form {...userForm}>
        <form
          onSubmit={userForm.handleSubmit(user => handleSaveUserOnSubmit(user))}
          className="rounded-lg border-1 border-border bg-secondary p-8 space-y-4"
        >
          <div className="grid grid-cols-2 gap-4 text-sm">
            <FormField
              control={userForm.control}
              name="publicId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>公開 ID</FormLabel>
                  <FormControl>
                    <Input {...field} readOnly className="cursor-default" />
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
                    <Input {...field} readOnly className="cursor-default" />
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
                    <Input {...field} className="caret-foreground" />
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
                    <Input {...field} readOnly className="cursor-default" />
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
                    <Input {...field} readOnly className="cursor-not-allowed" />
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
                    <Input {...field} readOnly className="cursor-default" />
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
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger className="w-full">
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
                      className="cursor-not-allowed"
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>
          <div className="flex justify-start gap-2 mt-8">
            <Button type="submit" className="max-w-2/5">
              Save User
            </Button>
            <Button
              type="button"
              className="max-w-2/5 bg-destructive hover:bg-destructive/90"
              onClick={() => {
                userForm.reset(user);
              }}
            >
              Reset Changes
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
});

export default ProfileTab;
