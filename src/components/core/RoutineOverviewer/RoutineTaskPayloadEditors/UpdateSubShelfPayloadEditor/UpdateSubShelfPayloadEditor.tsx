import { RoutineTaskPurpose } from "@shared/api/interfaces/enums";
import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import FormPayloadEditor from "../FormPayloadEditor";
import NamePatternEditor, {
  type RoutineTaskNamePattern,
} from "../NamePatternEditor";
import { SubShelfPicker } from "../PayloadSearchPickers";

interface PayloadEditorProps {
  isOpen: boolean;
  purpose: RoutineTaskPurpose;
  initialPayload: string;
  onClose: () => void;
  onConfirm: (payload: string) => void;
}

const UpdateSubShelfPayloadEditor = ({
  isOpen,
  purpose,
  initialPayload,
  onClose,
  onConfirm,
}: PayloadEditorProps) => {
  const [subShelfId, setSubShelfId] = useState("");
  const [name, setName] = useState("");
  const [namePattern, setNamePattern] = useState<RoutineTaskNamePattern>({});

  useEffect(() => {
    if (!isOpen) return;
    try {
      const payload = JSON.parse(initialPayload);
      setSubShelfId(payload.subShelfId ?? "");
      setName(payload.name ?? "");
      setNamePattern(payload.namePattern ?? {});
    } catch {
      setSubShelfId("");
      setName("");
      setNamePattern({});
    }
  }, [initialPayload, isOpen]);

  return (
    <FormPayloadEditor
      isOpen={isOpen}
      purpose={purpose}
      title="Update Sub Shelf Payload"
      description="Update fields on an existing sub shelf."
      payloadPreview={JSON.stringify(
        {
          subShelfId,
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
      <SubShelfPicker value={subShelfId} onValueChange={setSubShelfId} />
      <div className="flex flex-col gap-2">
        <Label>Name</Label>
        <Input
          value={name}
          onChange={event => setName(event.target.value)}
          placeholder="ex. Archive"
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

export default UpdateSubShelfPayloadEditor;
