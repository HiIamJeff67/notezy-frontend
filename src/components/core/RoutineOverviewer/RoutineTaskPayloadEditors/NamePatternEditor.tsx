import * as PopoverPrimitive from "@radix-ui/react-popover";
import { PlusIcon, Trash2Icon } from "lucide-react";
import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export type RoutineTaskNamePattern = Record<
  string,
  {
    source: "scheduledAt" | "recordId" | "shortRecordId" | "routineTaskId";
    format?: string;
    timezone?: string;
  }
>;

interface NamePatternEditorProps {
  label: string;
  pattern: RoutineTaskNamePattern;
  onPatternChange: (pattern: RoutineTaskNamePattern) => void;
}

const NamePatternEditor = ({
  label,
  pattern,
  onPatternChange,
}: NamePatternEditorProps) => {
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [portalContainer, setPortalContainer] = useState<Element | null>(null);

  return (
    <PopoverPrimitive.Root
      open={isOpen}
      onOpenChange={open => {
        if (open) {
          setPortalContainer(
            triggerRef.current?.closest(
              '[data-slot="dialog-content"], [data-slot="sheet-content"]'
            ) ?? null
          );
        }
        setIsOpen(open);
      }}
    >
      <PopoverPrimitive.Trigger asChild>
        <Button
          ref={triggerRef}
          type="button"
          variant="outline"
          size="sm"
          className="h-8 w-fit rounded-sm bg-muted/60"
        >
          {label} ({Object.keys(pattern).length})
        </Button>
      </PopoverPrimitive.Trigger>
      <PopoverPrimitive.Portal container={portalContainer}>
        <PopoverPrimitive.Content
          align="start"
          sideOffset={6}
          className="z-[190] w-[min(620px,88vw)] rounded-sm border bg-muted p-4 text-popover-foreground shadow-md outline-none"
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <Label>{label}</Label>
              <p className="mt-1 text-xs text-muted-foreground">
                Add bindings for tokens like {"{{date}}"} in the name or title.
              </p>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="size-8"
              onClick={() => {
                let index = Object.keys(pattern).length + 1;
                while (pattern[`date${index}`]) index += 1;
                onPatternChange({
                  ...pattern,
                  [`date${index}`]: {
                    source: "scheduledAt",
                    format: "2006-01-02",
                    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
                  },
                });
              }}
            >
              <PlusIcon className="size-4" />
            </Button>
          </div>

          <div className="mt-4 flex max-h-80 flex-col gap-3 overflow-y-auto pr-1">
            {Object.keys(pattern).length === 0 ? (
              <div className="rounded-sm border border-dashed px-3 py-8 text-center text-sm text-muted-foreground">
                No pattern bindings.
              </div>
            ) : (
              Object.entries(pattern).map(([token, binding]) => (
                <div
                  key={token}
                  className="grid grid-cols-[minmax(90px,1fr)_150px_minmax(100px,1fr)_minmax(120px,1fr)_32px] items-end gap-2 rounded-sm border bg-background/35 p-2"
                >
                  <div className="flex flex-col gap-1">
                    <span className="text-xs text-muted-foreground">Token</span>
                    <Input
                      defaultValue={token}
                      className="h-8 bg-transparent"
                      onBlur={event => {
                        const nextToken = event.currentTarget.value.trim();
                        if (!nextToken || nextToken === token) return;
                        const nextPattern = { ...pattern };
                        delete nextPattern[token];
                        nextPattern[nextToken] = binding;
                        onPatternChange(nextPattern);
                      }}
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-xs text-muted-foreground">
                      Source
                    </span>
                    <select
                      value={binding.source}
                      onChange={event =>
                        onPatternChange({
                          ...pattern,
                          [token]: {
                            ...binding,
                            source: event.currentTarget.value as
                              | "scheduledAt"
                              | "recordId"
                              | "shortRecordId"
                              | "routineTaskId",
                          },
                        })
                      }
                      className="h-8 rounded-sm border border-input bg-transparent px-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
                    >
                      <option value="scheduledAt">scheduledAt</option>
                      <option value="recordId">recordId</option>
                      <option value="shortRecordId">shortRecordId</option>
                      <option value="routineTaskId">routineTaskId</option>
                    </select>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-xs text-muted-foreground">
                      Format
                    </span>
                    <Input
                      value={binding.format ?? ""}
                      disabled={binding.source !== "scheduledAt"}
                      placeholder="2006-01-02"
                      className="h-8 bg-transparent"
                      onChange={event =>
                        onPatternChange({
                          ...pattern,
                          [token]: {
                            ...binding,
                            format: event.currentTarget.value || undefined,
                          },
                        })
                      }
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-xs text-muted-foreground">
                      Timezone
                    </span>
                    <Input
                      value={binding.timezone ?? ""}
                      disabled={binding.source !== "scheduledAt"}
                      placeholder="Asia/Taipei"
                      className="h-8 bg-transparent"
                      onChange={event =>
                        onPatternChange({
                          ...pattern,
                          [token]: {
                            ...binding,
                            timezone: event.currentTarget.value || undefined,
                          },
                        })
                      }
                    />
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="size-8"
                    onClick={() => {
                      const nextPattern = { ...pattern };
                      delete nextPattern[token];
                      onPatternChange(nextPattern);
                    }}
                  >
                    <Trash2Icon className="size-4" />
                  </Button>
                </div>
              ))
            )}
          </div>
        </PopoverPrimitive.Content>
      </PopoverPrimitive.Portal>
    </PopoverPrimitive.Root>
  );
};

export default NamePatternEditor;
