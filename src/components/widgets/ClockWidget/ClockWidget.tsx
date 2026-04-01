import {
  CSSProperties,
  Suspense,
  lazy,
  useEffect,
  useMemo,
  useState,
} from "react";
import EditClockWidgetDialogSkeleton from "./EditClockWidgetDialogSkeleton";
import { ClockStyles } from "./data/clockStyles";
import { Setting } from "./data/settings";
import { TimeZones } from "./data/timeZones";

const EditClockWidgetDialog = lazy(() => import("./EditClockWidgetDialog"));

export interface ClockWidgetProps {
  className?: string;
  style?: CSSProperties;
  isWidgetEditing: boolean;
  onIsWidgetEditingChange: (isEditing: boolean) => void;
}

const ClockWidget = ({
  className,
  style,
  isWidgetEditing,
  onIsWidgetEditingChange,
}: ClockWidgetProps) => {
  const [time, setTime] = useState(() => new Date());
  const [setting, setSetting] = useState<Setting>({
    selectedTimeZone: TimeZones[0],
    selectedClockStyle: ClockStyles[0],
    enableTimer: true,
    enableLocale: true,
    localeFontSize: 10,
    timerFontSize: 10,
  });

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const targetTime = useMemo(() => {
    const tzInfo = TimeZones.find(
      tz => tz.locale === setting.selectedTimeZone.locale
    );
    if (!tzInfo) return time;

    const utcTime = time.getTime() + time.getTimezoneOffset() * 60000;
    return new Date(utcTime + tzInfo.offset * 3600000);
  }, [time, setting]);

  return (
    <div
      className={`relative flex flex-col items-center justify-center p-2 h-full w-full ${className}`}
      style={style}
    >
      {isWidgetEditing && (
        <Suspense fallback={<EditClockWidgetDialogSkeleton open={true} />}>
          <EditClockWidgetDialog
            open={isWidgetEditing}
            onOpenChange={onIsWidgetEditingChange}
            setting={setting}
            setSetting={setSetting}
          />
        </Suspense>
      )}
      <div className="flex-1 w-full flex items-center justify-center min-h-0 min-w-0">
        <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-sm">
          <circle
            cx="50"
            cy="50"
            r="48"
            strokeWidth="2"
            className={setting.selectedClockStyle.properties.face}
          />
          {setting.selectedClockStyle.name === "classic" &&
            Array.from({ length: 12 }).map((_, i) => (
              <line
                key={i}
                x1="50"
                y1="6"
                x2="50"
                y2="10"
                className="stroke-foreground"
                strokeWidth="2"
                transform={`rotate(${i * 30} 50 50)`}
              />
            ))}
          <line
            x1="50"
            y1="50"
            x2="50"
            y2="25"
            className={setting.selectedClockStyle.properties.hour}
            strokeWidth="4"
            strokeLinecap="round"
            transform={`rotate(${(targetTime.getHours() % 12) * 30 + targetTime.getMinutes() * 0.5} 50 50)`}
          />
          <line
            x1="50"
            y1="50"
            x2="50"
            y2="15"
            className={setting.selectedClockStyle.properties.minute}
            strokeWidth="3"
            strokeLinecap="round"
            transform={`rotate(${targetTime.getMinutes() * 6 + targetTime.getSeconds() * 0.1} 50 50)`}
          />
          <line
            x1="50"
            y1="55"
            x2="50"
            y2="10"
            className={setting.selectedClockStyle.properties.second}
            strokeWidth="1.5"
            strokeLinecap="round"
            transform={`rotate(${targetTime.getSeconds() * 6} 50 50)`}
          />
          <circle
            cx="50"
            cy="50"
            r="3"
            className={setting.selectedClockStyle.properties.center}
          />
        </svg>
      </div>

      {(setting.enableTimer || setting.enableLocale) && (
        <div className="mt-1 text-[10px] sm:text-xs font-mono text-foreground/80 flex flex-col items-center shrink-0">
          {setting.enableTimer && (
            <span
              className="font-semibold tracking-wider"
              style={{ fontSize: setting.timerFontSize }}
            >
              {targetTime.toLocaleTimeString("en-US", { hour12: false })}
            </span>
          )}
          {setting.enableLocale && (
            <span className="opacity-80 flex flex-wrap justify-center items-center gap-1">
              <span
                className="text-foreground font-bold whitespace-nowrap"
                style={{ fontSize: setting.localeFontSize }}
              >
                {setting.selectedTimeZone.displayName}
              </span>
              <span
                className="text-muted-foreground whitespace-nowrap"
                style={{ fontSize: setting.localeFontSize }}
              >
                (UTC{setting.selectedTimeZone.offset >= 0 ? "+" : ""}
                {setting.selectedTimeZone.offset})
              </span>
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default ClockWidget;
