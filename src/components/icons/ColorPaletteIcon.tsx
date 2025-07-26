import { IconProps } from "@/shared/types/iconProps.type";

const ColorPaletteIcon = ({ size = 24, className = "" }: IconProps) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* 調色盤主體 */}
      <path
        d="M12 2C13.1 2 14.2 2.2 15.2 2.7C16.2 3.1 17.1 3.7 17.9 4.5C18.7 5.3 19.3 6.2 19.7 7.2C20.2 8.2 20.4 9.3 20.4 10.4C20.4 11.4 20.1 12.3 19.6 13.1C19.1 13.9 18.4 14.5 17.6 14.9L16.9 15.2H16.2C15.9 15.2 15.7 15.3 15.5 15.5C15.3 15.7 15.2 15.9 15.2 16.2V16.9C15.2 17.5 15 18 14.6 18.4C14.2 18.8 13.7 19 13.1 19H10.9C10.3 19 9.8 18.8 9.4 18.4C9 18 8.8 17.5 8.8 16.9V16.2C8.8 15.9 8.7 15.7 8.5 15.5C8.3 15.3 8.1 15.2 7.8 15.2H7.1L6.4 14.9C5.6 14.5 4.9 13.9 4.4 13.1C3.9 12.3 3.6 11.4 3.6 10.4C3.6 8.1 4.5 6 6.1 4.4C7.7 2.8 9.8 2 12 2Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />

      {/* 顏色點 1 - 紅色位置 */}
      <circle cx="9" cy="8" r="1.5" fill="currentColor" opacity="0.8" />

      {/* 顏色點 2 - 藍色位置 */}
      <circle cx="15" cy="8" r="1.5" fill="currentColor" opacity="0.6" />

      {/* 顏色點 3 - 綠色位置 */}
      <circle cx="12" cy="6" r="1.5" fill="currentColor" opacity="0.7" />

      {/* 顏色點 4 - 黃色位置 */}
      <circle cx="7" cy="11" r="1.5" fill="currentColor" opacity="0.5" />

      {/* 顏色點 5 - 紫色位置 */}
      <circle cx="17" cy="11" r="1.5" fill="currentColor" opacity="0.4" />

      {/* 畫筆孔 */}
      <path
        d="M12 19V22"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
};

export default ColorPaletteIcon;
