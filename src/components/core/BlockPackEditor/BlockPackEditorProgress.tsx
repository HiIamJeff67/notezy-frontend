import type { BlockEditorState } from "@/providers/BlockEditorProvider";

const blockEditorStateOrder: BlockEditorState[] = [
  "initializing",
  "event",
  "debouncing",
  "merge",
  "toRequest",
  "sendAPI",
  "waitResponse",
  "idle",
];

interface BlockPackEditorProgressProps {
  state: BlockEditorState;
  label: string;
}

const BlockPackEditorProgress = ({
  state,
  label,
}: BlockPackEditorProgressProps) => {
  const progress =
    ((blockEditorStateOrder.indexOf(state) + 1) /
      blockEditorStateOrder.length) *
    100;

  return (
    <div
      aria-label={`Editor status: ${label}`}
      className="h-0.5 w-full overflow-hidden rounded-full bg-border/40"
      role="progressbar"
      aria-valuemax={100}
      aria-valuemin={0}
      aria-valuenow={progress}
    >
      <div
        className="h-full rounded-full bg-primary/50 transition-[width] duration-300"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
};

export default BlockPackEditorProgress;
