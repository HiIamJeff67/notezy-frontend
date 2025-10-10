import SettingMenuItem from "@/components/SettingMenuItem/SettingMenuItem";
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
import { useUserData } from "@/hooks/useUserData";
import { zodResolver } from "@hookform/resolvers/zod";
import { DefaultAvatar1URL } from "@shared/api/functions/static.api";
import { UpdateMyInfo } from "@shared/api/functions/userInfo.api";
import { AllCountries, AllUserGenders } from "@shared/types/enums";
import { PrivateUserInfo, PrivateUserInfoSchema } from "@shared/types/models";
import { format } from "date-fns";
import { memo, useCallback, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";

interface ProfileTabProps {
  userInfo: PrivateUserInfo;
}

const ProfileTab = memo(({ userInfo }: ProfileTabProps) => {
  const loadingManager = useLoading();
  const languageManager = useLanguage();
  const userDataManager = useUserData();

  const [birthDateDialogOpen, setBirthDateDialogOpen] = useState(false);

  const userInfoForm = useForm({
    resolver: zodResolver(PrivateUserInfoSchema),
    defaultValues: userInfo,
  });

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
    async (userInfo: PrivateUserInfo): Promise<void> => {
      loadingManager.setIsStrictLoading(true);

      try {
        const userAgent = navigator.userAgent;
        await UpdateMyInfo({
          header: { userAgent },
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

        userDataManager.updateUserData({
          ...(userInfo.avatarURL !== undefined && {
            avatarURL: userInfo.avatarURL,
          }),
        });

        toast.success("Successfully updated profile");
      } catch (error) {
        toast.error(languageManager.tError(error));
      } finally {
        loadingManager.setIsStrictLoading(false);
      }
    },
    [loadingManager, userDataManager, languageManager]
  );

  return (
    <Form {...userInfoForm}>
      <form
        onSubmit={userInfoForm.handleSubmit(handleSaveUserInfoOnSubmit)}
        className="w-full h-full overflow-y-scroll"
      >
        {/* 背景圖片和頭像區域 - 保持不變 */}
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

        <div className="px-8 pt-12 pb-8 bg-secondary flex flex-col gap-6 min-h-full">
          {/* 個人標題 - 保持不變 */}
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

          {/* 自我介紹 - 保持不變 */}
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

          {/* 性別 - 使用 SettingMenuItem */}
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
                    <Select value={field.value} onValueChange={field.onChange}>
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
                        <DialogDescription>選擇你的出生日期</DialogDescription>
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

          {/* 上次修改 - 使用 SettingMenuItem，無按鈕 */}
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
                  isLast={true}
                >
                  <></>
                </SettingMenuItem>
              </FormItem>
            )}
          />

          <div className="flex justify-start gap-2 pt-4 border-t border-border/50">
            <Button type="submit" className="max-w-2/5">
              Save Profile
            </Button>
            <Button
              type="button"
              className="max-w-2/5 bg-destructive hover:bg-destructive/90"
              onClick={() => userInfoForm.reset(userInfo)}
            >
              Reset Changes
            </Button>
          </div>
        </div>
      </form>
    </Form>
  );
});

export default ProfileTab;
