import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import {
  BasicPreviewWidgets,
  PreviewWidget,
} from "@/components/widgets/widget";

interface CreateWidgetDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreate: (previewWidget: PreviewWidget) => void | Promise<void>;
}

const CreateWidgetDialog = ({
  open,
  onOpenChange,
  onCreate,
}: CreateWidgetDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md bg-card shadow-xl rounded-xl p-6 flex flex-col items-center gap-4">
        <DialogTitle>Add New Widgets</DialogTitle>
        <div className="w-full font-bold mb-2">Basic</div>
        <div className="w-full flex flex-col gap-2 overflow-y-auto max-h-96">
          {Object.values(BasicPreviewWidgets).map((previewWidget, index) => (
            <button
              key={index}
              className="w-full flex justify-between items-start rounded-lg border border-border bg-muted hover:bg-accent transition p-3 cursor-pointer"
              onClick={() => onCreate(previewWidget)}
              type="button"
            >
              <div className="w-[180px] text-left">
                <div className="font-bold">{previewWidget.name}</div>
                <div className="font-light">{previewWidget.description}</div>
              </div>
              <div
                className="w-[100px] aspect-square flex justify-center items-center border rounded-lg overflow-hidden relative pointer-events-none select-none"
                tabIndex={-1}
                aria-hidden="true"
              >
                <previewWidget.component />
              </div>
            </button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CreateWidgetDialog;
