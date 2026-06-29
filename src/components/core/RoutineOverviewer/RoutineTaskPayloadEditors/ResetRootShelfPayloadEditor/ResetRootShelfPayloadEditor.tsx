import { RoutineTaskPurpose } from "@shared/api/interfaces/enums";
import { useEffect, useState } from "react";
import FormPayloadEditor from "../FormPayloadEditor";
import { RootShelfPicker } from "../PayloadSearchPickers";

interface PayloadEditorProps {
  isOpen: boolean;
  purpose: RoutineTaskPurpose;
  initialPayload: string;
  onClose: () => void;
  onConfirm: (payload: string) => void;
}

const ResetRootShelfPayloadEditor = ({
  isOpen,
  purpose,
  initialPayload,
  onClose,
  onConfirm,
}: PayloadEditorProps) => {
  const [rootShelfId, setRootShelfId] = useState("");

  useEffect(() => {
    if (!isOpen) return;
    try {
      setRootShelfId(JSON.parse(initialPayload).rootShelfId ?? "");
    } catch {
      setRootShelfId("");
    }
  }, [initialPayload, isOpen]);

  return (
    <FormPayloadEditor
      isOpen={isOpen}
      purpose={purpose}
      title="Reset Root Shelf Payload"
      description="Soft-delete direct sub shelves under a root shelf."
      payloadPreview={JSON.stringify({ rootShelfId }, null, 2)}
      contentWidthClassName="!w-[min(900px,94vw)]"
      formWidthClassName="max-w-[460px]"
      onClose={onClose}
      onConfirm={onConfirm}
    >
      <RootShelfPicker value={rootShelfId} onValueChange={setRootShelfId} />
    </FormPayloadEditor>
  );
};

export default ResetRootShelfPayloadEditor;
