import toast from "@shared/lib/toast";
import {
  CheckCircle2,
  CloudCog,
  FileJson,
  GitMerge,
  type LucideIcon,
  Send,
} from "lucide-react";
import { useEffect, useRef } from "react";
import { Marker, MarkerContent } from "@/components/ui/marker";
import type { BlockEditorState } from "@/providers/BlockEditorProvider";

const toastId = "block-pack-state-sonner";
const activeStates = ["merge", "toRequest", "sendAPI", "waitResponse"] as const;

type ActiveState = (typeof activeStates)[number];

const states: Record<
  ActiveState,
  {
    label: string;
    description: string;
    icon: LucideIcon;
  }
> = {
  merge: {
    label: "Merging",
    description: "Compressing recent editor changes before syncing.",
    icon: GitMerge,
  },
  toRequest: {
    label: "Preparing Request",
    description: "Building the block payload for the server.",
    icon: FileJson,
  },
  sendAPI: {
    label: "Sending API",
    description: "Sending block updates to the backend.",
    icon: Send,
  },
  waitResponse: {
    label: "Waiting Response",
    description: "Waiting for the backend to confirm the update.",
    icon: CloudCog,
  },
};

interface BlockPackStateSonnerProps {
  state: BlockEditorState;
}

const renderSonnerContent = (
  label: string,
  description: string,
  Icon: LucideIcon,
  progress: number
) => (
  <div className="relative min-h-20 w-[356px] overflow-hidden rounded-lg border border-border bg-background px-4 pt-4 pb-5 text-foreground shadow-lg">
    <div className="flex items-center gap-3">
      <Icon className="size-5 shrink-0 text-muted-foreground" />
      <span className="font-medium text-sm leading-none">{label}</span>
    </div>
    <Marker className="mt-4 text-xs">
      <MarkerContent>{description}</MarkerContent>
    </Marker>
    <div className="absolute inset-x-0 bottom-0 h-px bg-white/10">
      <div
        className="h-full bg-white/60 transition-[width] duration-300"
        style={{ width: `${progress}%` }}
      />
    </div>
  </div>
);

const BlockPackStateSonner = ({ state }: BlockPackStateSonnerProps) => {
  const hasShownRef = useRef(false);
  const closeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (closeTimeoutRef.current !== null) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }

    const activeStateIndex = activeStates.indexOf(state as ActiveState);
    if (activeStateIndex >= 0) {
      const activeState = activeStates[activeStateIndex];
      const meta = states[activeState];
      const progress = ((activeStateIndex + 1) / activeStates.length) * 100;

      hasShownRef.current = true;
      toast.custom(
        () =>
          renderSonnerContent(
            meta.label,
            meta.description,
            meta.icon,
            progress
          ),
        {
          id: toastId,
          duration: Infinity,
        }
      );
      return;
    }

    if (!hasShownRef.current) return;

    toast.custom(
      () =>
        renderSonnerContent(
          "Synced",
          "Block changes have been saved.",
          CheckCircle2,
          100
        ),
      { id: toastId, duration: Infinity }
    );

    closeTimeoutRef.current = setTimeout(() => {
      toast.dismiss(toastId);
      hasShownRef.current = false;
      closeTimeoutRef.current = null;
    }, 1400);
  }, [state]);

  useEffect(
    () => () => {
      if (closeTimeoutRef.current !== null) {
        clearTimeout(closeTimeoutRef.current);
      }
      toast.dismiss(toastId);
    },
    []
  );

  return null;
};

export default BlockPackStateSonner;
