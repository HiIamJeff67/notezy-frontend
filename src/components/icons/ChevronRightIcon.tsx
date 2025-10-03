import { IconProps } from "@shared/types/iconProps.type";

const ChevronRightIcon = ({
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
      className={`lucide lucide-chevron-right-icon lucide-chevron-right ${className}`}
      {...props}
    >
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
};

export default ChevronRightIcon;
