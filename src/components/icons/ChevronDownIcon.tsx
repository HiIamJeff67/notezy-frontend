import { IconProps } from "@shared/types/iconProps.type";

const ChevronDownIcon = ({
  size = 24,
  className = "",
  ...props
}: IconProps) => {
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
      className={`lucide lucide-chevron-down-icon lucide-chevron-down ${className}`}
      {...props}
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
};

export default ChevronDownIcon;
