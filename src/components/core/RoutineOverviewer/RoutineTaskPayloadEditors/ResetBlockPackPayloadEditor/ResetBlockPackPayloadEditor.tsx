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

const ResetBlockPackPayloadEditor = ({
  isOpen,
  purpose,
  initialPayload,
  onClose,
  onConfirm,
}: PayloadEditorProps) => {
  const [blockPackId, setBlockPackId] = useState("");

  useEffect(() => {
    if (!isOpen) return;
    try {
      setBlockPackId(JSON.parse(initialPayload).blockPackId ?? "");
    } catch {
      setBlockPackId("");
    }
  }, [initialPayload, isOpen]);

  return (
    <FormPayloadEditor
      isOpen={isOpen}
      purpose={purpose}
      title="Reset Block Pack Payload"
      description="Reset a block pack to an empty block pack."
      payloadPreview={JSON.stringify({ blockPackId }, null, 2)}
      contentWidthClassName="!w-[min(900px,94vw)]"
      formWidthClassName="max-w-[460px]"
      onClose={onClose}
      onConfirm={onConfirm}
    >
      <div className="flex flex-col gap-2">
        <Label>Block pack ID</Label>
        <Input
          value={blockPackId}
          onChange={event => setBlockPackId(event.target.value)}
        />
      </div>
    </FormPayloadEditor>
  );
};

export default ResetBlockPackPayloadEditor;
