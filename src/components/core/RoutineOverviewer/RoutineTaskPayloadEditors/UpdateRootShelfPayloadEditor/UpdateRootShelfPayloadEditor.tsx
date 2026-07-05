import { RoutineTaskPurpose } from "@shared/api/interfaces/enums";
import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import FormPayloadEditor from "../FormPayloadEditor";
import { RootShelfPicker } from "../PayloadSearchPickers";
import TemplatePatternEditor, {
  type RoutineTaskTemplatePattern,
} from "../TemplatePatternEditor";

interface PayloadEditorProps {
  isOpen: boolean;
  purpose: RoutineTaskPurpose;
  initialPayload: string;
  onClose: () => void;
  onConfirm: (payload: string) => void;
}

const UpdateRootShelfPayloadEditor = ({
  isOpen,
  purpose,
  initialPayload,
  onClose,
  onConfirm,
}: PayloadEditorProps) => {
  const [rootShelfId, setRootShelfId] = useState("");
  const [name, setName] = useState("");
  const [pattern, setPattern] = useState<RoutineTaskTemplatePattern>({});

  useEffect(() => {
    if (!isOpen) return;
    try {
      const payload = JSON.parse(initialPayload);
      setRootShelfId(payload.rootShelfId ?? "");
      setName(payload.name ?? "");
      setPattern(payload.pattern ?? {});
    } catch {
      setRootShelfId("");
      setName("");
      setPattern({});
    }
  }, [initialPayload, isOpen]);

  return (
    <FormPayloadEditor
      isOpen={isOpen}
      purpose={purpose}
      title="Update Root Shelf Payload"
      description="Update fields on an existing root shelf."
      payloadPreview={JSON.stringify(
        {
          rootShelfId,
          ...(name.trim() && { name }),
          ...(Object.keys(pattern).length > 0 && { pattern }),
        },
        null,
        2
      )}
      contentWidthClassName="!w-[min(940px,94vw)]"
      formWidthClassName="max-w-[460px]"
      onClose={onClose}
      onConfirm={onConfirm}
    >
      <RootShelfPicker value={rootShelfId} onValueChange={setRootShelfId} />
      <div className="flex flex-col gap-2">
        <Label>Name</Label>
        <Input
          value={name}
          onChange={event => setName(event.target.value)}
          placeholder="(Optional)"
        />
      </div>
      <TemplatePatternEditor
        label="Pattern Table"
        pattern={pattern}
        onPatternChange={setPattern}
      />
    </FormPayloadEditor>
  );
};

export default UpdateRootShelfPayloadEditor;
