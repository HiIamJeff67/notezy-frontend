import { RoutineTaskPurpose } from "@shared/api/interfaces/enums";
import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import FormPayloadEditor from "../FormPayloadEditor";
import { ShelfLocationPicker } from "../PayloadSearchPickers";

interface PayloadEditorProps {
  isOpen: boolean;
  purpose: RoutineTaskPurpose;
  initialPayload: string;
  onClose: () => void;
  onConfirm: (payload: string) => void;
}

const CreateSubShelfPayloadEditor = ({
  isOpen,
  purpose,
  initialPayload,
  onClose,
  onConfirm,
}: PayloadEditorProps) => {
  const [rootShelfId, setRootShelfId] = useState("");
  const [prevSubShelfId, setPrevSubShelfId] = useState("");
  const [name, setName] = useState("");

  useEffect(() => {
    if (!isOpen) return;
    try {
      const payload = JSON.parse(initialPayload);
      setRootShelfId(payload.rootShelfId ?? "");
      setPrevSubShelfId(payload.prevSubShelfId ?? "");
      setName(payload.name ?? "");
    } catch {
      setRootShelfId("");
      setPrevSubShelfId("");
      setName("");
    }
  }, [initialPayload, isOpen]);

  return (
    <FormPayloadEditor
      isOpen={isOpen}
      purpose={purpose}
      title="Create Sub Shelf Payload"
      description="Create an empty sub shelf under a root shelf."
      payloadPreview={JSON.stringify(
        {
          rootShelfId,
          prevSubShelfId: prevSubShelfId.trim() ? prevSubShelfId : null,
          ...(name.trim() && { name }),
        },
        null,
        2
      )}
      contentWidthClassName="!w-[min(1040px,95vw)]"
      formWidthClassName="max-w-[520px]"
      onClose={onClose}
      onConfirm={onConfirm}
    >
      <ShelfLocationPicker
        mode="root-or-sub"
        label="Parent location"
        placeholder="Select RootShelf or Previous SubShelf"
        rootShelfId={rootShelfId}
        subShelfId={prevSubShelfId}
        onSelectRoot={nextRootShelfId => {
          setRootShelfId(nextRootShelfId);
          setPrevSubShelfId("");
        }}
        onSelectSub={(nextPrevSubShelfId, nextRootShelfId) => {
          setRootShelfId(nextRootShelfId);
          setPrevSubShelfId(nextPrevSubShelfId);
        }}
      />
      <div className="flex flex-col gap-2">
        <Label>Name</Label>
        <Input
          value={name}
          onChange={event => setName(event.target.value)}
          placeholder="ex. Notes"
        />
      </div>
    </FormPayloadEditor>
  );
};

export default CreateSubShelfPayloadEditor;
