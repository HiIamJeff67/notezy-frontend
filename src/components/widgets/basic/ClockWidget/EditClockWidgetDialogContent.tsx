import { DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import React, { CSSProperties, Dispatch, SetStateAction } from "react";
import { Setting } from "./data/clockSettings";
import { ClockStyles } from "./data/clockStyles";
import { TimeZones } from "./data/timeZones";

const EditClockWidgetDialogOption = ({
  className,
  style,
  title,
  description,
  currentValue,
  alignment,
  children,
}: {
  className?: string;
  style?: CSSProperties;
  title: string;
  description?: string;
  currentValue?: string;
  alignment?: "vertical" | "horizontal";
  children: React.ReactNode;
}) => {
  return (
    <div
      className={`flex gap-2
        ${
          alignment !== undefined && alignment === "vertical"
            ? `flex-col items-start`
            : `justify-between items-center`
        } ${className}`}
      style={style}
    >
      <div className="w-full flex flex-col gap-1">
        <div className="w-full flex justify-between items-baseline">
          <label className="text-sm font-medium">{title}</label>
          {currentValue && (
            <p className="text-card-foreground font-semibold text-sm mr-2">
              {currentValue}
            </p>
          )}
        </div>
        {description && (
          <p className="text-muted-foreground font-normal text-xs">
            {description}
          </p>
        )}
      </div>
      <div
        className={
          alignment !== undefined && alignment === "vertical" ? "w-full" : ""
        }
      >
        {children}
      </div>
    </div>
  );
};

interface EditClockWidgetDialogContentProps {
  setting: Setting;
  setSetting: Dispatch<SetStateAction<Setting>>;
}

const EditClockWidgetDialogContent = ({
  setting,
  setSetting,
}: EditClockWidgetDialogContentProps) => {
  return (
    <>
      <DialogHeader>
        <DialogTitle>編輯時鐘</DialogTitle>
      </DialogHeader>
      <div className="flex flex-col gap-4 py-4">
        <EditClockWidgetDialogOption
          title="時區"
          description="提供多種時區，切換後將會直接改變時鐘顯示的時間"
        >
          <Select
            value={setting.selectedTimeZone.locale}
            onValueChange={newLocale =>
              setSetting(prev => ({
                ...prev,
                selectedTimeZone:
                  TimeZones.find(tz => tz.locale === newLocale) ??
                  prev.selectedTimeZone,
              }))
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="選擇時區" />
            </SelectTrigger>
            <SelectContent>
              {TimeZones.map(tz => (
                <SelectItem key={tz.index} value={tz.locale}>
                  {tz.displayName} (UTC
                  {tz.offset >= 0 ? "+" : ""}
                  {tz.offset})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </EditClockWidgetDialogOption>
        <SelectSeparator />
        <EditClockWidgetDialogOption
          title="時鐘款式"
          description="時鐘樣式會影響時鐘的時針、分針、秒針、以及中心圓點和外部輪廓等等"
        >
          <Select
            value={setting.selectedClockStyle.index.toString()}
            onValueChange={indexString =>
              setSetting(prev => ({
                ...prev,
                selectedClockStyle: ClockStyles[parseInt(indexString)],
              }))
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="選擇款式" />
            </SelectTrigger>
            <SelectContent>
              {ClockStyles.map(clockStyle => (
                <SelectItem
                  key={clockStyle.index}
                  value={clockStyle.index.toString()}
                >
                  {clockStyle.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </EditClockWidgetDialogOption>
        <SelectSeparator />
        <EditClockWidgetDialogOption
          title="顯示下方時間"
          description="開啟以透過小時、分鐘以及秒來顯示當前時間"
        >
          <Switch
            checked={setting.enableTimer}
            onCheckedChange={checked =>
              setSetting(prev => ({
                ...prev,
                enableTimer: checked,
              }))
            }
          />
        </EditClockWidgetDialogOption>
        <SelectSeparator />
        <EditClockWidgetDialogOption
          title="顯示地區"
          description="開啟以顯示時區和其所在地區的名稱"
        >
          <Switch
            checked={setting.enableLocale}
            onCheckedChange={checked =>
              setSetting(prev => ({
                ...prev,
                enableLocale: checked,
              }))
            }
          />
        </EditClockWidgetDialogOption>
        <SelectSeparator />
        <EditClockWidgetDialogOption
          title="下方時間文字大小"
          alignment="vertical"
          currentValue={setting.timerFontSize.toString()}
        >
          <Slider
            max={16}
            min={6}
            step={0.1}
            defaultValue={[setting.timerFontSize]}
            onValueChange={value =>
              setSetting(prev => ({ ...prev, timerFontSize: value[0] }))
            }
          />
        </EditClockWidgetDialogOption>
        <SelectSeparator />
        <EditClockWidgetDialogOption
          title="地區文字大小"
          alignment="vertical"
          currentValue={setting.localeFontSize.toString()}
        >
          <Slider
            max={16}
            min={6}
            step={0.1}
            defaultValue={[setting.localeFontSize]}
            onValueChange={value =>
              setSetting(prev => ({ ...prev, localeFontSize: value[0] }))
            }
          />
        </EditClockWidgetDialogOption>
      </div>
    </>
  );
};

export default EditClockWidgetDialogContent;
