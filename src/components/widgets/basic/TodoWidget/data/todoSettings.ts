export type TodoSetting = {
  titleFontSize: number;
  itemFontSize: number;
};

export const getDefaultTodoSetting = (): TodoSetting => {
  return {
    titleFontSize: 16,
    itemFontSize: 12,
  };
};
