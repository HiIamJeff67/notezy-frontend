import { RoutineTaskPurpose } from "@shared/api/interfaces/enums";
import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import FormPayloadEditor from "../FormPayloadEditor";
import NamePatternEditor, {
  type RoutineTaskNamePattern,
} from "../NamePatternEditor";
import { RootShelfPicker } from "../PayloadSearchPickers";

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
  const [namePattern, setNamePattern] = useState<RoutineTaskNamePattern>({});

  useEffect(() => {
    if (!isOpen) return;
    try {
      const payload = JSON.parse(initialPayload);
      setRootShelfId(payload.rootShelfId ?? "");
      setName(payload.name ?? "");
      setNamePattern(payload.namePattern ?? {});
    } catch {
      setRootShelfId("");
      setName("");
      setNamePattern({});
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
          ...(Object.keys(namePattern).length > 0 && { namePattern }),
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
      <NamePatternEditor
        label="Name Pattern"
        pattern={namePattern}
        onPatternChange={setNamePattern}
      />
    </FormPayloadEditor>
  );
};

export default UpdateRootShelfPayloadEditor;
