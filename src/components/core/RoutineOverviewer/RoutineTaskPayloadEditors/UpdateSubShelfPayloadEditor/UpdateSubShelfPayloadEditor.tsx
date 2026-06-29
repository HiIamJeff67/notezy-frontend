import { RoutineTaskPurpose } from "@shared/api/interfaces/enums";
import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import FormPayloadEditor from "../FormPayloadEditor";
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

  useEffect(() => {
    if (!isOpen) return;
    try {
      const payload = JSON.parse(initialPayload);
      setSubShelfId(payload.subShelfId ?? "");
      setName(payload.name ?? "");
    } catch {
      setSubShelfId("");
      setName("");
    }
  }, [initialPayload, isOpen]);

  return (
    <FormPayloadEditor
      isOpen={isOpen}
      purpose={purpose}
      title="Update Sub Shelf Payload"
      description="Update fields on an existing sub shelf."
      payloadPreview={JSON.stringify(
        { subShelfId, ...(name.trim() && { name }) },
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
    </FormPayloadEditor>
  );
};

export default UpdateSubShelfPayloadEditor;
