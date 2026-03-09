import SettingMenuItem from "@/components/SettingMenu/SettingMenuItem";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useLanguage, useLoading } from "@/hooks";
import { useUser } from "@/hooks/useUser";
import { getAuthorization } from "@/util/getAuthorization";
import { zodResolver } from "@hookform/resolvers/zod";
import { useUpdateMyInfo } from "@shared/api/hooks/userInfo.hook";
import { DefaultAvatar1URL } from "@shared/api/invokers/static.invoker";
import { FakeUserInfo } from "@shared/constants";
import { AllCountries, AllUserGenders } from "@shared/enums";
import { LocalStorageManipulator } from "@shared/lib/localStorageManipulator";
import { LocalStorageKeys } from "@shared/types/localStorage.type";
import { UserInfo, UserInfoSchema } from "@shared/types/user.type";
import { format } from "date-fns";
import { memo, useCallback, useEffect, useMemo, useState } from "react";
import { useForm, UseFormReturn } from "react-hook-form";
import toast from "react-hot-toast";

const ProfileTab = memo(() => {
  const loadingManager = useLoading();
  const languageManager = useLanguage();
  const userManager = useUser();

  const updateUserInfoMutator = useUpdateMyInfo();

  const [birthDateDialogOpen, setBirthDateDialogOpen] = useState(false);

  useEffect(() => {
    const fetchUserInfo = async () =>
      await userManager.fetchUserInfo(
        LocalStorageManipulator.getItemByKey(LocalStorageKeys.accessToken)
      );

    fetchUserInfo();
  }, []);

  const userInfoForm: UseFormReturn<UserInfo> = useForm({
    resolver: zodResolver(UserInfoSchema),
    defaultValues: userManager.userInfo ?? FakeUserInfo,
  }) as UseFormReturn<UserInfo>;

  useEffect(() => {
    userInfoForm.reset(userManager.userInfo ?? FakeUserInfo);
  }, [userManager, userInfoForm]);

  const coverBackgroundURL = userInfoForm.watch("coverBackgroundURL");
  const avatarURL = userInfoForm.watch("avatarURL");

  const backgroundStyle = useMemo(
    () => ({
      minHeight: 180,
      background: coverBackgroundURL
        ? `url(${coverBackgroundURL}) center/cover no-repeat`
        : "var(--foreground)",
    }),
    [coverBackgroundURL]
  );

  const avatarSrc = useMemo(() => avatarURL || DefaultAvatar1URL, [avatarURL]);

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

  const handleSaveUserInfoOnSubmit = useCallback(
    async (userInfo: UserInfo): Promise<void> =>
      await loadingManager.startAsyncTransactionLoading(async () => {
        try {
          const userAgent = navigator.userAgent;
          const accessToken = LocalStorageManipulator.getItemByKey(
            LocalStorageKeys.accessToken
          );
          await updateUserInfoMutator.mutateAsync({
            header: {
              userAgent: userAgent,
              authorization: getAuthorization(accessToken),
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

          userManager.updateUserData({
            ...(userInfo.avatarURL !== undefined && {
              avatarURL: userInfo.avatarURL,
            }),
          });
          userManager.updateUserInfo(userInfo);
          toast.success("Successfully updated profile");
        } catch (error) {
          toast.error(languageManager.tError(error));
        }
      }),
    [loadingManager, userManager, languageManager, updateUserInfoMutator]
  );

  return (
    <Form {...userInfoForm}>
      <form
        method="POST"
        onSubmit={userInfoForm.handleSubmit(handleSaveUserInfoOnSubmit)}
        className="w-full h-full overflow-hidden flex flex-col"
      >
        <div
          className="
          flex flex-col bg-secondary gap-6 w-full h-full
          overflow-y-scroll ![scrollbar-color:var(--muted-foreground)_var(--secondary)]"
        >
          <div className="relative w-full group" style={backgroundStyle}>
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
                  src={avatarSrc}
                  alt="Avatar"
                  className="w-full h-full object-cover bg-gray-100"
                  loading="lazy"
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

          <div className="px-8 pt-12 pb-8 bg-secondary flex flex-col gap-6 h-full">
            <FormField
              control={userInfoForm.control}
              name="header"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>個人標題</FormLabel>
                  <FormControl>
                    <Input {...field} value={field.value ?? ""} />
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
                      className="text-base mb-6"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={userInfoForm.control}
              name="gender"
              render={({ field }) => (
                <FormItem>
                  <SettingMenuItem
                    title="性別"
                    description={field.value || "未設定性別"}
                  >
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
                  </SettingMenuItem>
                  <FormMessage className="ml-[200px] mt-1" />
                </FormItem>
              )}
            />

            <FormField
              control={userInfoForm.control}
              name="country"
              render={({ field }) => (
                <FormItem>
                  <SettingMenuItem
                    title="國家"
                    description={field.value || "未設定國家"}
                  >
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
                  </SettingMenuItem>
                  <FormMessage className="ml-[200px] mt-1" />
                </FormItem>
              )}
            />

            <FormField
              control={userInfoForm.control}
              name="birthDate"
              render={({ field }) => (
                <FormItem>
                  <SettingMenuItem
                    title="生日"
                    description={
                      field.value
                        ? format(
                            typeof field.value === "string"
                              ? new Date(field.value)
                              : field.value,
                            "yyyy-MM-dd"
                          )
                        : "未設定生日"
                    }
                  >
                    <Dialog
                      open={birthDateDialogOpen}
                      onOpenChange={setBirthDateDialogOpen}
                    >
                      <DialogTrigger asChild>
                        <Button variant="outline">變更日期</Button>
                      </DialogTrigger>
                      <DialogContent className="w-auto">
                        <DialogHeader>
                          <DialogTitle>選擇生日</DialogTitle>
                          <DialogDescription>
                            選擇你的出生日期
                          </DialogDescription>
                        </DialogHeader>
                        <div className="flex justify-center">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={date => {
                              field.onChange(date);
                              setBirthDateDialogOpen(false);
                            }}
                            disabled={date =>
                              date > new Date() || date < new Date("1900-01-01")
                            }
                            initialFocus
                          />
                        </div>
                      </DialogContent>
                    </Dialog>
                  </SettingMenuItem>
                  <FormMessage className="ml-[200px] mt-1" />
                </FormItem>
              )}
            />

            <FormField
              control={userInfoForm.control}
              name="updatedAt"
              render={({ field }) => (
                <FormItem>
                  <SettingMenuItem
                    title="上次修改"
                    description={
                      field.value instanceof Date
                        ? field.value.toLocaleString()
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
                Save Profile
              </Button>
              <Button
                type="button"
                className="max-w-2/5 bg-destructive hover:bg-destructive/90"
                onClick={() =>
                  userInfoForm.reset(userManager.userInfo ?? FakeUserInfo)
                }
              >
                Reset Changes
              </Button>
            </div>
            <div className="w-full h-2 shrink-0" />
          </div>
        </div>
      </form>
    </Form>
  );
});

export default ProfileTab;
