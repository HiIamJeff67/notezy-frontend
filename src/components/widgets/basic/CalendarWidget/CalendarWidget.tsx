import { Calendar } from "@/components/ui/calendar";
import { CSSProperties, useState } from "react";

export interface CalendarWidgetProps {
  className?: string;
  style?: CSSProperties;
}

const CalendarWidget = ({ className, style }: CalendarWidgetProps) => {
  const [date, setDate] = useState<Date>(new Date());

  return (
    <div
      className={`w-full h-full flex justify-center items-center overflow-hidden p-2 ${className}`}
      style={style}
    >
      <Calendar
        mode="single"
        selected={date}
        onSelect={setDate}
        className="w-full h-full bg-card m-0 p-0"
        classNames={{
          root: "w-full h-full flex flex-col",
          months: "flex-1 w-full flex flex-col",
          table: "w-full flex-1 flex flex-col table-fixed",
          head_row: "flex w-full justify-between pb-1",
          row: "flex w-full justify-between mt-1 flex-1",
          weekday:
            "flex-1 !size-auto text-muted-foreground rounded-md font-normal text-[0.8rem] text-center",
          day: "flex-1 !size-auto p-0 flex items-center justify-center text-center",
          nav: "flex justify-between items-center w-full relative mb-0",
        }}
        style={
          {
            "--cell-size": "2rem",
          } as React.CSSProperties
        }
        captionLayout="dropdown"
        fixedWeeks
        required
      />
    </div>
  );
};

export default CalendarWidget;
