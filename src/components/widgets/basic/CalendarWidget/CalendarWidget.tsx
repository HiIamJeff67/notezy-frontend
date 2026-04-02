import { CSSProperties } from "react";

export interface CalendarWidgetProps {
  className?: string;
  style?: CSSProperties;
}

const CalendarWidget = ({ className, style }: CalendarWidgetProps) => {
  return (
    <div
      className={`
        flex items-center justify-center
        ${className}
      `}
      style={style}
    >
      CalendarWidget
    </div>
  );
};

export default CalendarWidget;
