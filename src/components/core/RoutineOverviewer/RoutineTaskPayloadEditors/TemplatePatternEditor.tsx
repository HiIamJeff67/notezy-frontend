import { PlusIcon, Trash2Icon } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export type RoutineTaskTemplatePattern = Record<
  string,
  {
    source:
      | "scheduledAt"
      | "recordId"
      | "shortRecordId"
      | "routineTaskId"
      | "blockText"
      | "blockCheckboxCount";
    format?: string;
    timezone?: string;
    blockId?: string;
    blockPackId?: string;
    checked?: boolean;
  }
>;

interface TemplatePatternEditorProps {
  label: string;
  pattern: RoutineTaskTemplatePattern;
  onPatternChange: (pattern: RoutineTaskTemplatePattern) => void;
}

const TemplatePatternEditor = ({
  label,
  pattern,
  onPatternChange,
}: TemplatePatternEditorProps) => {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-start justify-between gap-3">
        <div>
          <Label>{label}</Label>
          <p className="mt-1 text-xs text-muted-foreground">
            Values available as {"{{token}}"}.
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
            setIsExpanded(true);
          }}
        >
          <PlusIcon className="size-4" />
        </Button>
      </div>

      <div
        className={
          isExpanded
            ? "h-72 min-h-72 shrink-0 overflow-y-auto overflow-x-hidden rounded-t-sm border bg-muted/35"
            : "h-24 min-h-24 shrink-0 overflow-hidden rounded-t-sm border bg-muted/35"
        }
      >
        <Table className="table-fixed">
          <TableHeader>
            <TableRow className="transition-none hover:bg-transparent">
              <TableHead className="h-8 w-[18%] p-1.5">Token</TableHead>
              <TableHead className="h-8 w-[29%] p-1.5">Source</TableHead>
              <TableHead className="h-8 w-[24%] p-1.5">Target</TableHead>
              <TableHead className="h-8 w-[21%] p-1.5">Option</TableHead>
              <TableHead className="h-8 w-[8%] p-1.5"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Object.keys(pattern).length === 0 ? (
              <TableRow className="transition-none hover:bg-transparent">
                <TableCell
                  colSpan={5}
                  className="h-56 px-2 py-6 text-center text-xs text-muted-foreground"
                >
                  No pattern values
                </TableCell>
              </TableRow>
            ) : (
              Object.entries(pattern).map(([token, binding]) => (
                <TableRow
                  key={token}
                  className="transition-none hover:bg-transparent"
                >
                  <TableCell className="min-w-0 p-1.5">
                    <Input
                      defaultValue={token}
                      className="h-8 min-w-0 bg-transparent px-2 text-xs"
                      onBlur={event => {
                        const nextToken = event.currentTarget.value.trim();
                        if (!nextToken || nextToken === token) return;
                        const nextPattern = { ...pattern };
                        delete nextPattern[token];
                        nextPattern[nextToken] = binding;
                        onPatternChange(nextPattern);
                      }}
                    />
                  </TableCell>
                  <TableCell className="min-w-0 p-1.5">
                    <select
                      value={binding.source}
                      onChange={event => {
                        const source = event.currentTarget.value as
                          | "scheduledAt"
                          | "recordId"
                          | "shortRecordId"
                          | "routineTaskId"
                          | "blockText"
                          | "blockCheckboxCount";
                        onPatternChange({
                          ...pattern,
                          [token]:
                            source === "scheduledAt"
                              ? {
                                  source,
                                  format: binding.format,
                                  timezone: binding.timezone,
                                }
                              : source === "blockText"
                                ? { source, blockId: binding.blockId }
                                : source === "blockCheckboxCount"
                                  ? {
                                      source,
                                      blockPackId: binding.blockPackId,
                                      checked: binding.checked,
                                    }
                                  : { source },
                        });
                      }}
                      className="h-8 w-full min-w-0 rounded-sm border border-input bg-transparent px-1.5 text-xs outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
                    >
                      <option value="scheduledAt">scheduledAt</option>
                      <option value="recordId">recordId</option>
                      <option value="shortRecordId">shortRecordId</option>
                      <option value="routineTaskId">routineTaskId</option>
                      <option value="blockText">blockText</option>
                      <option value="blockCheckboxCount">
                        blockCheckboxCount
                      </option>
                    </select>
                  </TableCell>
                  <TableCell className="min-w-0 p-1.5">
                    <Input
                      value={
                        binding.source === "blockText"
                          ? (binding.blockId ?? "")
                          : binding.source === "blockCheckboxCount"
                            ? (binding.blockPackId ?? "")
                            : (binding.format ?? "")
                      }
                      disabled={
                        binding.source !== "scheduledAt" &&
                        binding.source !== "blockText" &&
                        binding.source !== "blockCheckboxCount"
                      }
                      placeholder={
                        binding.source === "blockText"
                          ? "Block ID"
                          : binding.source === "blockCheckboxCount"
                            ? "BlockPack ID"
                            : "2006-01-02"
                      }
                      className="h-8 min-w-0 bg-transparent px-2 text-xs"
                      onChange={event =>
                        onPatternChange({
                          ...pattern,
                          [token]: {
                            ...binding,
                            ...(binding.source === "blockText"
                              ? {
                                  blockId:
                                    event.currentTarget.value || undefined,
                                }
                              : binding.source === "blockCheckboxCount"
                                ? {
                                    blockPackId:
                                      event.currentTarget.value || undefined,
                                  }
                                : {
                                    format:
                                      event.currentTarget.value || undefined,
                                  }),
                          },
                        })
                      }
                    />
                  </TableCell>
                  <TableCell className="min-w-0 p-1.5">
                    {binding.source === "blockCheckboxCount" ? (
                      <select
                        value={
                          binding.checked === undefined
                            ? ""
                            : binding.checked
                              ? "true"
                              : "false"
                        }
                        onChange={event =>
                          onPatternChange({
                            ...pattern,
                            [token]: {
                              ...binding,
                              checked:
                                event.currentTarget.value === ""
                                  ? undefined
                                  : event.currentTarget.value === "true",
                            },
                          })
                        }
                        className="h-8 w-full min-w-0 rounded-sm border border-input bg-transparent px-1.5 text-xs outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
                      >
                        <option value="">Any</option>
                        <option value="true">Checked</option>
                        <option value="false">Unchecked</option>
                      </select>
                    ) : (
                      <Input
                        value={binding.timezone ?? ""}
                        disabled={binding.source !== "scheduledAt"}
                        placeholder="Asia/Taipei"
                        className="h-8 min-w-0 bg-transparent px-2 text-xs"
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
                    )}
                  </TableCell>
                  <TableCell className="p-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="size-7"
                      onClick={() => {
                        const nextPattern = { ...pattern };
                        delete nextPattern[token];
                        onPatternChange(nextPattern);
                      }}
                    >
                      <Trash2Icon className="size-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Button
        type="button"
        variant="outline"
        size="sm"
        className="-mt-px h-8 min-h-8 w-full shrink-0 rounded-t-none rounded-b-sm py-0"
        onClick={() => setIsExpanded(current => !current)}
      >
        {isExpanded ? "Close" : "Expand"}
      </Button>
    </div>
  );
};

export default TemplatePatternEditor;
