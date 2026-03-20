import PenLineIcon from "@/components/icons/PenLineIcon";
import { CSSProperties } from "react";

interface EditableProps {
  children?: React.ReactNode;
  className?: string;
  style?: CSSProperties;
  editButtonProps?: {
    className?: string;
    disabled?: boolean;
    size?: number;
  };
  onEdit: () => void | Promise<void>;
}

const Editable = ({
  children,
  className,
  style,
  editButtonProps,
  onEdit,
}: EditableProps) => {
  return (
    <div
      className={`
        relative w-full h-full overflow-hidden
        flex justify-center items-center
        bg-muted border-border rounded-lg
        ${className}
      `}
      style={style}
    >
      {(editButtonProps === undefined ||
        editButtonProps.disabled === undefined ||
        !editButtonProps.disabled) && (
        <button
          className={`
            absolute top-1 left-1 w-3 h-3
            flex justify-center items-center
            rounded-full bg-white transition
            ${editButtonProps && editButtonProps.className}
         `}
          onClick={onEdit}
          type="button"
        >
          <PenLineIcon size={(editButtonProps && editButtonProps.size) ?? 8} />
        </button>
      )}
      {children}
    </div>
  );
};
export default Editable;
