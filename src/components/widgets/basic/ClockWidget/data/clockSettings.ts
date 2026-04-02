import { ClockStyle } from "./clockStyles";
import { TimeZone } from "./timeZones";

export type ClockSetting = {
  selectedTimeZone: TimeZone;
  selectedClockStyle: ClockStyle;
  enableTimer: boolean;
  timerFontSize: number;
  timerInterval: number;
  enableLocale: boolean;
  localeFontSize: number;
};
