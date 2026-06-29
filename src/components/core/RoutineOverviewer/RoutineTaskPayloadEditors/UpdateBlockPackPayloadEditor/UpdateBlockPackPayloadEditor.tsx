import { RoutineTaskPurpose } from "@shared/api/interfaces/enums";
import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import FormPayloadEditor from "../FormPayloadEditor";

interface PayloadEditorProps {
  isOpen: boolean;
  purpose: RoutineTaskPurpose;
  initialPayload: string;
  onClose: () => void;
  onConfirm: (payload: string) => void;
}

const UpdateBlockPackPayloadEditor = ({
  isOpen,
  purpose,
  initialPayload,
  onClose,
  onConfirm,
}: PayloadEditorProps) => {
  const [blockPackId, setBlockPackId] = useState("");
  const [updatedBlocks, setUpdatedBlocks] = useState("[]");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isOpen) return;
    try {
      const payload = JSON.parse(initialPayload);
      setBlockPackId(payload.blockPackId ?? "");
      setUpdatedBlocks(JSON.stringify(payload.updatedBlocks ?? [], null, 2));
    } catch {
      setBlockPackId("");
      setUpdatedBlocks("[]");
    }
    setError("");
  }, [initialPayload, isOpen]);

  let payloadPreview = "{}";
  try {
    payloadPreview = JSON.stringify(
      { blockPackId, updatedBlocks: JSON.parse(updatedBlocks) },
      null,
      2
    );
  } catch {
    payloadPreview = JSON.stringify(
      { blockPackId, updatedBlocks: [] },
      null,
      2
    );
  }

  return (
    <FormPayloadEditor
      isOpen={isOpen}
      purpose={purpose}
      title="Update Block Pack Payload"
      description="Batch update blocks inside a block pack."
      payloadPreview={payloadPreview}
      error={error}
      onClose={onClose}
      onConfirm={payload => {
        try {
          JSON.parse(updatedBlocks);
          onConfirm(payload);
        } catch {
          setError("Updated blocks must be valid JSON.");
        }
      }}
    >
      <div className="flex flex-col gap-2">
        <Label>Block pack ID</Label>
        <Input
          value={blockPackId}
          onChange={event => setBlockPackId(event.target.value)}
        />
      </div>
      <div className="flex flex-col gap-2">
        <Label>Updated blocks</Label>
        <Textarea
          value={updatedBlocks}
          onChange={event => {
            setUpdatedBlocks(event.target.value);
            setError("");
          }}
          className="min-h-72 font-mono text-xs"
        />
        <p className="text-muted-foreground text-xs">
          Each entry needs a blockId and an arborizedEditableBlock. Use the
          block-specific editor for one block.
        </p>
      </div>
    </FormPayloadEditor>
  );
};

export default UpdateBlockPackPayloadEditor;
