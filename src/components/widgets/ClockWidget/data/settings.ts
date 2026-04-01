import { ClockStyle } from "./clockStyles";
import { TimeZone } from "./timeZones";

export type Setting = {
  selectedTimeZone: TimeZone;
  selectedClockStyle: ClockStyle;
  enableTimer: boolean;
  enableLocale: boolean;
  timerFontSize: number;
  localeFontSize: number;
};
