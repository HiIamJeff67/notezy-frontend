import { MaterialContentType } from "@shared/api/interfaces/enums";
import { MaterialMeta } from "@shared/types/materialMeta.type";
import { useEffect, useState } from "react";
import MaterialViewerFrame from "../MaterialViewerFrame";

interface MaterialTextViewerContentProps {
  meta: MaterialMeta;
  materialContentType: MaterialContentType;
}

const MaterialTextViewerContent = ({
  meta,
  materialContentType,
}: MaterialTextViewerContentProps) => {
  const [text, setText] = useState<string>("");
  const [isLoadingText, setIsLoadingText] = useState<boolean>(false);
  const [isTextAvailable, setIsTextAvailable] = useState<boolean>(true);

  useEffect(() => {
    if (!meta.downloadURL) return;

    let isCancelled = false;

    setIsLoadingText(true);
    setIsTextAvailable(true);
    setText("");

    void (async () => {
      try {
        const response = await fetch(meta.downloadURL as string);
        if (!response.ok) {
          setIsTextAvailable(false);
          return;
        }

        const rawText = await response.text();
        if (isCancelled) return;

        if (materialContentType === MaterialContentType.JSON) {
          try {
            setText(JSON.stringify(JSON.parse(rawText), null, 2));
          } catch {
            setText(rawText);
          }
        } else {
          setText(rawText);
        }
      } catch {
        if (!isCancelled) {
          setIsTextAvailable(false);
        }
      } finally {
        if (!isCancelled) {
          setIsLoadingText(false);
        }
      }
    })();

    return () => {
      isCancelled = true;
    };
  }, [materialContentType, meta.downloadURL]);

  return (
    <MaterialViewerFrame
      meta={meta}
      materialContentType={materialContentType}
      contentClassName="p-8 overflow-auto"
    >
      {isLoadingText && (
        <div className="text-muted-foreground text-sm">Loading file...</div>
      )}
      {!isLoadingText && !isTextAvailable && (
        <div className="text-muted-foreground text-sm">
          Failed to load text preview.
        </div>
      )}
      {!isLoadingText && isTextAvailable && (
        <pre className="whitespace-pre-wrap break-all text-sm">{text}</pre>
      )}
    </MaterialViewerFrame>
  );
};

export default MaterialTextViewerContent;
