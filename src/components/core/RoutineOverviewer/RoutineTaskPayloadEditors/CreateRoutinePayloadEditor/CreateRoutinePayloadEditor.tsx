import {
  AllRoutinePeriods,
  AllRoutineStatuses,
  RoutineTaskPurpose,
} from "@shared/api/interfaces/enums";
import { useEffect, useState } from "react";
import DatePicker from "@/components/commons/DatePicker/DatePicker";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import FormPayloadEditor from "../FormPayloadEditor";
import { StationPicker } from "../PayloadSearchPickers";

interface PayloadEditorProps {
  isOpen: boolean;
  purpose: RoutineTaskPurpose;
  initialPayload: string;
  onClose: () => void;
  onConfirm: (payload: string) => void;
}

const CreateRoutinePayloadEditor = ({
  isOpen,
  purpose,
  initialPayload,
  onClose,
  onConfirm,
}: PayloadEditorProps) => {
  const [stationId, setStationId] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("Scheduled");
  const [isPinned, setIsPinned] = useState(false);
  const [scheduledStartAt, setScheduledStartAt] = useState("");
  const [scheduledEndAt, setScheduledEndAt] = useState("");
  const [period, setPeriod] = useState("None");
  const [timezone, setTimezone] = useState(
    Intl.DateTimeFormat().resolvedOptions().timeZone
  );

  useEffect(() => {
    if (!isOpen) return;
    try {
      const payload = JSON.parse(initialPayload);
      setStationId(payload.stationId ?? "");
      setTitle(payload.title ?? "");
      setDescription(payload.description ?? "");
      setStatus(payload.status ?? "Scheduled");
      setIsPinned(Boolean(payload.isPinned));
      setScheduledStartAt(
        payload.scheduledStartAt
          ? new Date(payload.scheduledStartAt).toISOString().slice(0, 16)
          : ""
      );
      setScheduledEndAt(
        payload.scheduledEndAt
          ? new Date(payload.scheduledEndAt).toISOString().slice(0, 16)
          : ""
      );
      setPeriod(payload.period ?? "None");
      setTimezone(
        payload.timezone ?? Intl.DateTimeFormat().resolvedOptions().timeZone
      );
    } catch {
      setStationId("");
      setTitle("");
      setDescription("");
      setStatus("Scheduled");
      setIsPinned(false);
      setScheduledStartAt("");
      setScheduledEndAt("");
      setPeriod("None");
      setTimezone(Intl.DateTimeFormat().resolvedOptions().timeZone);
    }
  }, [initialPayload, isOpen]);

  return (
    <FormPayloadEditor
      isOpen={isOpen}
      purpose={purpose}
      title="Create Routine Payload"
      description="Create a routine with no links, tags, or routine tasks."
      payloadPreview={JSON.stringify(
        {
          stationId,
          ...(title.trim() && { title: title.trim() }),
          description,
          status,
          isPinned,
          scheduledStartAt: scheduledStartAt
            ? new Date(scheduledStartAt).toISOString()
            : null,
          scheduledEndAt: scheduledEndAt
            ? new Date(scheduledEndAt).toISOString()
            : null,
          period: period === "None" ? null : period,
          timezone,
        },
        null,
        2
      )}
      onClose={onClose}
      onConfirm={onConfirm}
    >
      <StationPicker value={stationId} onValueChange={setStationId} />
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-2">
          <Label>Title</Label>
          <Input
            value={title}
            onChange={event => setTitle(event.target.value)}
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label>Status</Label>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="z-[190]">
              {AllRoutineStatuses.map(routineStatus => (
                <SelectItem key={routineStatus} value={routineStatus}>
                  {routineStatus}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <Label>Description</Label>
        <Textarea
          value={description}
          onChange={event => setDescription(event.target.value)}
          className="min-h-24"
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-2">
          <Label>Scheduled start</Label>
          <DatePicker
            value={scheduledStartAt ? new Date(scheduledStartAt) : undefined}
            onValueChange={value => {
              value?.setSeconds(0, 0);
              setScheduledStartAt(value ? value.toISOString() : "");
            }}
            placeholder="Select start date and time"
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label>Scheduled end</Label>
          <DatePicker
            value={scheduledEndAt ? new Date(scheduledEndAt) : undefined}
            onValueChange={value => {
              value?.setSeconds(0, 0);
              setScheduledEndAt(value ? value.toISOString() : "");
            }}
            placeholder="Select end date and time"
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-2">
          <Label>Period</Label>
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="z-[190]">
              <SelectItem value="None">None</SelectItem>
              {AllRoutinePeriods.map(routinePeriod => (
                <SelectItem key={routinePeriod} value={routinePeriod}>
                  {routinePeriod}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-col gap-2">
          <Label>Timezone</Label>
          <Input
            value={timezone}
            onChange={event => setTimezone(event.target.value)}
          />
        </div>
      </div>
      <label className="flex items-center gap-2 text-sm">
        <Checkbox
          checked={isPinned}
          onCheckedChange={checked => setIsPinned(checked === true)}
        />
        Pin routine
      </label>
    </FormPayloadEditor>
  );
};

export default CreateRoutinePayloadEditor;
