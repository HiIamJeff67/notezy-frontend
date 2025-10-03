import { IconProps } from "@shared/types/iconProps.type";

const ModifyDotIcon = ({ size = 24, className = "", ...props }: IconProps) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`lucide lucide-dot-icon lucide-dot ${className}`}
      {...props}
    >
      <circle cx="12.1" cy="12.1" r="1" />
    </svg>
  );
};

export default ModifyDotIcon;
