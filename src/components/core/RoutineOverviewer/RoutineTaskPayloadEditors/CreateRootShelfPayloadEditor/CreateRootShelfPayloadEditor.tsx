import { RoutineTaskPurpose } from "@shared/api/interfaces/enums";
import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import FormPayloadEditor from "../FormPayloadEditor";
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

const CreateRootShelfPayloadEditor = ({
  isOpen,
  purpose,
  initialPayload,
  onClose,
  onConfirm,
}: PayloadEditorProps) => {
  const [name, setName] = useState("");
  const [pattern, setPattern] = useState<RoutineTaskTemplatePattern>({});

  useEffect(() => {
    if (!isOpen) return;
    try {
      const payload = JSON.parse(initialPayload);
      setName(payload.name ?? "");
      setPattern(payload.pattern ?? {});
    } catch {
      setName("");
      setPattern({});
    }
  }, [initialPayload, isOpen]);

  return (
    <FormPayloadEditor
      isOpen={isOpen}
      purpose={purpose}
      title="Create Root Shelf Payload"
      description="Create an empty root shelf."
      payloadPreview={JSON.stringify(
        {
          ...(name.trim() && { name }),
          ...(Object.keys(pattern).length > 0 && { pattern }),
        },
        null,
        2
      )}
      contentWidthClassName="!w-[min(900px,94vw)]"
      formWidthClassName="max-w-[420px]"
      onClose={onClose}
      onConfirm={onConfirm}
    >
      <div className="flex flex-col gap-2">
        <Label>Name</Label>
        <Input
          value={name}
          onChange={event => setName(event.target.value)}
          placeholder="ex. School"
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

export default CreateRootShelfPayloadEditor;
