export type TimerSetting = {
  counterFontSize: number;
  buttonSize: number;
  isSilence: boolean;
};

export const getDefaultTimerSetting = (): TimerSetting => {
  return {
    counterFontSize: 24,
    buttonSize: 16,
    isSilence: false,
  };
};
