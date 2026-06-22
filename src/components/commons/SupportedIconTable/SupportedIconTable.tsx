import * as PopoverPrimitive from "@radix-ui/react-popover";
import { SupportedIcon } from "@shared/api/interfaces/enums";
import { cn } from "@shared/util/utils";
import { CheckIcon, SearchIcon, SmilePlusIcon, XIcon } from "lucide-react";
import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverTrigger } from "@/components/ui/popover";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface SupportedIconTableProps {
  value: SupportedIcon | null;
  onValueChange: (value: SupportedIcon | null) => void;
  disabled?: boolean;
  className?: string;
}

const SupportedIconTable = ({
  value,
  onValueChange,
  disabled = false,
  className = "bg-popover",
}: SupportedIconTableProps) => {
  const portalContainerRef = useRef<HTMLDivElement | null>(null);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");

  const filteredIcons = (
    Object.entries(SupportedIcon) as [string, SupportedIcon][]
  ).filter(([iconName]) =>
    iconName
      .toLowerCase()
      .includes(
        searchQuery.trim().toLowerCase().replaceAll(" ", "").replaceAll("-", "")
      )
  );

  return (
    <div ref={portalContainerRef}>
      <Popover
        modal
        open={isOpen}
        onOpenChange={open => {
          setIsOpen(open);
          if (!open) setSearchQuery("");
        }}
      >
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            size="icon"
            disabled={disabled}
            className="size-10 shrink-0 cursor-pointer rounded-sm bg-transparent text-lg"
            aria-label={value ? "Change icon" : "Select icon"}
          >
            {value ?? <SmilePlusIcon className="text-muted-foreground" />}
          </Button>
        </PopoverTrigger>

        <PopoverPrimitive.Portal container={portalContainerRef.current}>
          <PopoverPrimitive.Content
            align="start"
            sideOffset={6}
            className={cn(
              "z-[160] flex w-80 flex-col gap-3 rounded-sm border bg-popover p-3 text-popover-foreground shadow-md outline-none",
              "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
              className
            )}
          >
            <div className="flex items-center gap-2">
              <div className="relative min-w-0 flex-1">
                <SearchIcon className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={searchQuery}
                  onChange={event => setSearchQuery(event.currentTarget.value)}
                  placeholder="Search icons"
                  className="h-9 rounded-sm pl-8"
                  autoFocus
                />
              </div>

              {value !== null && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="size-9 shrink-0 rounded-sm"
                  disabled={value === null}
                  aria-label="Clear icon"
                  onClick={() => {
                    onValueChange(null);
                    setSearchQuery("");
                    setIsOpen(false);
                  }}
                >
                  <XIcon />
                </Button>
              )}
            </div>

            {filteredIcons.length > 0 ? (
              <div className="flex max-h-52 flex-wrap content-start gap-1 overflow-y-auto">
                {filteredIcons.map(([iconName, supportedIcon]) => {
                  const readableIconName = iconName.replace(
                    /([a-z0-9])([A-Z])/g,
                    "$1 $2"
                  );
                  return (
                    <Tooltip key={iconName}>
                      <TooltipTrigger asChild>
                        <Button
                          type="button"
                          variant={
                            value === supportedIcon ? "secondary" : "ghost"
                          }
                          size="icon"
                          className="relative size-8 shrink-0 cursor-pointer rounded-sm text-base"
                          title={readableIconName}
                          aria-label={readableIconName}
                          onClick={() => {
                            onValueChange(supportedIcon);
                            setSearchQuery("");
                            setIsOpen(false);
                          }}
                        >
                          {supportedIcon}
                          {value === supportedIcon && (
                            <CheckIcon className="absolute right-0 bottom-0 size-3 rounded-sm bg-primary p-0.5 text-primary-foreground" />
                          )}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent className="z-[170]" side="top">
                        {readableIconName}
                      </TooltipContent>
                    </Tooltip>
                  );
                })}
              </div>
            ) : (
              <div className="flex h-20 items-center justify-center text-xs text-muted-foreground">
                No matching icons
              </div>
            )}
          </PopoverPrimitive.Content>
        </PopoverPrimitive.Portal>
      </Popover>
    </div>
  );
};

export default SupportedIconTable;
