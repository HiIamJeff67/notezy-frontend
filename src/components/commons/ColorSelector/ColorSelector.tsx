import { cn } from "@shared/util/utils";
import { CheckIcon, PaletteIcon } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface ColorSelectorProps {
  value: string;
  onValueChange: (value: string) => void;
  disabled?: boolean;
  className?: string;
}

const ColorSelector = ({
  value,
  onValueChange,
  disabled = false,
  className = "bg-popover",
}: ColorSelectorProps) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const colors = [
    "#64748b",
    "#71717a",
    "#78716c",
    "#ef4444",
    "#f97316",
    "#eab308",
    "#84cc16",
    "#22c55e",
    "#14b8a6",
    "#06b6d4",
    "#3b82f6",
    "#6366f1",
    "#8b5cf6",
    "#a855f7",
    "#d946ef",
    "#ec4899",
  ];

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="icon"
          disabled={disabled}
          className="size-10 shrink-0 rounded-sm bg-transparent"
          aria-label="Select color"
        >
          {value ? (
            <span
              className="size-5 rounded-sm border border-foreground/20"
              style={{ backgroundColor: value }}
            />
          ) : (
            <PaletteIcon className="text-muted-foreground" />
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent
        align="start"
        sideOffset={6}
        className={cn("flex w-72 flex-col gap-3 rounded-sm p-3", className)}
      >
        <div className="flex flex-wrap gap-1">
          {colors.map(color => (
            <Button
              key={color}
              type="button"
              variant="ghost"
              size="icon"
              className="relative size-8 shrink-0 rounded-sm p-1"
              aria-label={`Select ${color}`}
              onClick={() => {
                onValueChange(color);
                setIsOpen(false);
              }}
            >
              <span
                className="size-full rounded-sm border border-foreground/15"
                style={{ backgroundColor: color }}
              />
              {value.toLowerCase() === color && (
                <CheckIcon className="absolute size-4 text-white drop-shadow-sm" />
              )}
            </Button>
          ))}
        </div>

        <div className="flex items-center gap-2 border-t pt-3">
          <input
            type="color"
            value={value}
            disabled={disabled}
            className="size-9 cursor-pointer rounded-sm border bg-transparent p-1"
            aria-label="Custom color"
            onChange={event => onValueChange(event.currentTarget.value)}
          />
          <span className="font-mono text-xs text-muted-foreground">
            {value.toUpperCase()}
          </span>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default ColorSelector;
