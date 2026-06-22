import { MaxTriggerValue } from "@shared/constants/triggerLimitations.constant";
import { LocalStorageManipulator } from "@shared/lib/localStorageManipulator";
import toast from "@shared/lib/toast";
import { LocalStorageKey } from "@shared/types/localStorage.type";
import { cn } from "@shared/util/utils";
import {
  CheckIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  PaletteIcon,
  XIcon,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useLanguage, useUser } from "@/hooks";
import Closeable from "../Closeable/Closeable";
import ColorPicker from "../ColorPicker/ColorPicker";

interface ColorSelectorProps {
  value: string;
  onValueChange: (value: string) => void;
  disabled?: boolean;
  className?: string;
}

const isColor = (value: string): boolean => /^#[0-9a-fA-F]{6}$/.test(value);

const ColorSelector = ({
  value,
  onValueChange,
  disabled = false,
  className = "bg-popover",
}: ColorSelectorProps) => {
  const userManager = useUser();
  const languageManager = useLanguage();

  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isCustomColorOpen, setIsCustomColorOpen] = useState<boolean>(false);
  const [customColor, setCustomColor] = useState<string>(
    isColor(value) ? value : "#64748b"
  );
  const [_, setUpdateTrigger] = useState<number>(0);

  const colorsRef = useRef<string[]>([
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
  ]);

  const forceUpdate = useCallback(() => {
    setUpdateTrigger(prev => (prev + 1) % MaxTriggerValue);
  }, []);

  useEffect(() => {
    const initializeColors = async () => {
      if (userManager.userData === null) return;
      const colorsEncoded = LocalStorageManipulator.getItemByKey(
        LocalStorageKey.colors,
        userManager.userData.publicId
      );
      if (colorsEncoded !== null) {
        try {
          colorsRef.current = (JSON.parse(colorsEncoded) as string[]).filter(
            color => isColor(color)
          );
          forceUpdate();
        } catch (error) {
          toast.error(languageManager.tError(error));
        }
      }
    };

    initializeColors();
  }, [userManager.userData, languageManager, forceUpdate]);

  const syncColors = useCallback(
    (syncColors?: string[]) => {
      const targetColors =
        syncColors !== undefined ? syncColors : colorsRef.current;
      LocalStorageManipulator.setItem(
        LocalStorageKey.colors,
        JSON.stringify(targetColors),
        userManager.userData?.publicId
      );
    },
    [userManager.userData?.publicId]
  );

  const appendColors = useCallback(
    (newColors: string[]) => {
      colorsRef.current.push(
        ...newColors.filter(
          color =>
            isColor(color) &&
            !colorsRef.current.some(
              currentColor => currentColor.toLowerCase() === color.toLowerCase()
            )
        )
      );
      syncColors();
      forceUpdate();
    },
    [syncColors, forceUpdate]
  );

  const deleteColors = useCallback(
    (deletedIndexes: number[]) => {
      colorsRef.current = colorsRef.current.filter(
        (_, index) => !deletedIndexes.includes(index)
      );
      syncColors();
      forceUpdate();
    },
    [syncColors, forceUpdate]
  );

  return (
    <Popover
      modal
      open={isOpen}
      onOpenChange={open => {
        setIsOpen(open);
        if (open) {
          setCustomColor(isColor(value) ? value : "#64748b");
        } else {
          setIsCustomColorOpen(false);
        }
      }}
    >
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
        className={cn(
          "z-[160] flex w-72 flex-col gap-3 rounded-sm p-3",
          className
        )}
      >
        <div className="flex flex-wrap gap-1">
          {colorsRef.current.map((color, index) => (
            <div key={`${color}-${index}`} className="relative size-8 shrink-0">
              <Closeable
                hasParent
                size={7}
                className="top-0.5 left-0.5 z-10 bg-transparent"
                disabled={disabled}
                onClose={() => deleteColors([index])}
              >
                <Button
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
              </Closeable>
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-2 border-t border-border pt-3">
          <Button
            type="button"
            variant="outline"
            disabled={disabled}
            className="h-auto w-full justify-start gap-3 rounded-sm bg-background p-2 hover:bg-accent"
            onClick={() => setIsCustomColorOpen(open => !open)}
          >
            <span
              className="size-8 shrink-0 rounded-sm border border-foreground/20 shadow-sm"
              style={{ backgroundColor: customColor }}
            />
            <span className="flex min-w-0 flex-1 flex-col items-start">
              <span className="text-xs font-medium text-foreground">
                Custom color
              </span>
              <span className="font-mono text-xs font-normal text-muted-foreground">
                {customColor.toUpperCase()}
              </span>
            </span>
            {isCustomColorOpen ? (
              <ChevronDownIcon className="text-muted-foreground" />
            ) : (
              <ChevronRightIcon className="text-muted-foreground" />
            )}
          </Button>

          {isCustomColorOpen && (
            <div className="flex flex-col gap-3 rounded-sm border border-border bg-muted/30 p-3">
              <ColorPicker
                value={customColor}
                disabled={disabled}
                onValueChange={setCustomColor}
              />

              <div className="flex justify-end gap-2 border-t border-border pt-3">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-8 rounded-sm"
                  onClick={() => {
                    setCustomColor(isColor(value) ? value : "#64748b");
                    setIsCustomColorOpen(false);
                  }}
                >
                  <XIcon />
                  Cancel
                </Button>
                <Button
                  type="button"
                  size="sm"
                  disabled={!isColor(customColor)}
                  className="h-8 rounded-sm"
                  onClick={() => {
                    appendColors([customColor]);
                    onValueChange(customColor);
                    setIsOpen(false);
                  }}
                >
                  <CheckIcon />
                  Add
                </Button>
              </div>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default ColorSelector;
