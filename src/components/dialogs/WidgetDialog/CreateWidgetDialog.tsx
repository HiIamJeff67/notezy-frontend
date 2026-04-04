import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { BasicPreviewWidgets } from "@/components/widgets/basic/basic";
import { PreviewWidget } from "@/components/widgets/widget";

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
      <DialogContent
        className="
          w-[95vw] 
          max-w-md 
          md:max-w-2xl 
          lg:max-w-3xl 
          bg-card shadow-xl rounded-xl p-6 flex flex-col items-center gap-4
        "
      >
        <DialogHeader>
          <DialogTitle>Add New Widgets</DialogTitle>
        </DialogHeader>
        <div className="w-full font-bold mb-2">Basic</div>
        <div className="w-full flex-1 flex flex-col gap-3 overflow-y-auto max-h-[60vh] md:max-h-[70vh]">
          {Object.values(BasicPreviewWidgets).map((previewWidget, index) => (
            <div
              key={index}
              className="w-full flex items-center justify-between rounded-lg border border-border bg-muted hover:bg-accent transition p-4 cursor-pointer"
              onClick={() => onCreate(previewWidget)}
            >
              <div className="flex-1 text-left pr-4">
                <div className="font-bold text-lg">{previewWidget.name}</div>
                <div className="font-normal text-sm text-muted-foreground mt-1">
                  {previewWidget.description}
                </div>
              </div>
              <div
                className="w-[120px] aspect-square shrink-0 flex justify-center items-center border rounded-lg overflow-hidden relative pointer-events-none select-none bg-background shadow-inner"
                tabIndex={-1}
                aria-hidden="true"
              >
                <div
                  className="flex justify-center items-center shrink-0 origin-center"
                  style={{
                    width: "250px",
                    height: "250px",
                    transform: "scale(0.48)",
                  }}
                >
                  <previewWidget.component className="w-full h-full" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CreateWidgetDialog;
