import { cn } from "@shared/util/utils";
import { Button } from "@/components/ui/button";

interface WeekdayPickerProps {
  value: {
    start: number;
    end: number;
  };
  onValueChange: (value: { start: number; end: number }) => void;
  className?: string;
}

const WeekdayPicker = ({
  value,
  onValueChange,
  className,
}: WeekdayPickerProps) => {
  return (
    <div className={cn("flex flex-wrap gap-1.5", className)}>
      {[
        { value: 1, label: "Mon" },
        { value: 2, label: "Tue" },
        { value: 3, label: "Wed" },
        { value: 4, label: "Thu" },
        { value: 5, label: "Fri" },
        { value: 6, label: "Sat" },
        { value: 7, label: "Sun" },
      ].map(weekday => {
        const isSelected =
          weekday.value >= value.start && weekday.value <= value.end;

        return (
          <Button
            key={weekday.value}
            type="button"
            variant={isSelected ? "default" : "outline"}
            size="sm"
            className="h-8 min-w-12 rounded-sm px-2 text-xs"
            onClick={() => {
              if (weekday.value < value.start) {
                onValueChange({
                  start: weekday.value,
                  end: value.end,
                });
                return;
              }
              if (weekday.value > value.end) {
                onValueChange({
                  start: value.start,
                  end: weekday.value,
                });
                return;
              }
              onValueChange({
                start: weekday.value,
                end: weekday.value,
              });
            }}
          >
            {weekday.label}
          </Button>
        );
      })}
    </div>
  );
};

export default WeekdayPicker;
