import { Calendar } from "@/components/ui/calendar";
import { CSSProperties, useState } from "react";

export interface CalendarWidgetProps {
  className?: string;
  style?: CSSProperties;
}

const CalendarWidget = ({ className, style }: CalendarWidgetProps) => {
  const [date, setDate] = useState<Date>(new Date());

  return (
    <div className={`flex justify-center overflow-hidden ${className}`}>
      <Calendar
        mode="single"
        selected={date}
        onSelect={setDate}
        className="
          w-full bg-card md:mt-6 sm:mt-0 
          max-md:p-0 max-md:mt-0 max-md:[&_.rdp-month]:gap-0 max-md:w-fit
          max-md:[&_.rdp-nav]:hidden max-md:[&_.rdp-month_caption]:hidden max-md:[&_.rdp-dropdowns]:hidden
          max-md:[--cell-size:24px]
        "
        captionLayout="dropdown"
        fixedWeeks
        required
      />
    </div>
  );
};

export default CalendarWidget;
