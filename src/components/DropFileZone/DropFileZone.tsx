import { useDropzone } from "react-dropzone";

interface DropFileZoneProps {
  accept?: Record<string, string[]>;
  multiple?: boolean;
  disabled?: boolean;
  width?: string;
  height?: string;
  className?: string;
  onDrop: (files: File[]) => Promise<void> | void;
  children?: React.ReactNode;
}

const DropFileZone = ({
  accept = { "application/json": [".json"] },
  multiple = false,
  disabled = false,
  width = "200px",
  height = "100px",
  className = "",
  onDrop,
  children = (
    <p className="text-sm text-muted-foreground">
      Drop Files or Click Here to Select Uploaded Files (.json)
    </p>
  ),
}: DropFileZoneProps) => {
  const { getRootProps, getInputProps, isDragActive, isDragReject } =
    useDropzone({
      accept,
      multiple,
      disabled,
      onDropAccepted: onDrop,
    });

  return (
    <div
      {...getRootProps()}
      style={{ width, height }}
      className={`flex flex-col items-center justify-center w-${width} h-${height}
        rounded-lg border-2 border-dashed p-6 text-center transition cursor-pointer ${
          disabled
            ? "cursor-not-allowed opacity-60"
            : isDragReject
            ? "border-destructive bg-destructive/10"
            : isDragActive
            ? "border-primary bg-muted"
            : "border-muted-foreground/30 hover:border-primary/60"
        } ${className}`}
    >
      <input {...getInputProps()} />
      {children}
    </div>
  );
};

export default DropFileZone;
