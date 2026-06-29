import { RoutineTaskPurpose } from "@shared/api/interfaces/enums";
import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import FormPayloadEditor from "../FormPayloadEditor";

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

  useEffect(() => {
    if (!isOpen) return;
    try {
      setName(JSON.parse(initialPayload).name ?? "");
    } catch {
      setName("");
    }
  }, [initialPayload, isOpen]);

  return (
    <FormPayloadEditor
      isOpen={isOpen}
      purpose={purpose}
      title="Create Root Shelf Payload"
      description="Create an empty root shelf."
      payloadPreview={JSON.stringify({ ...(name.trim() && { name }) }, null, 2)}
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
    </FormPayloadEditor>
  );
};

export default CreateRootShelfPayloadEditor;
