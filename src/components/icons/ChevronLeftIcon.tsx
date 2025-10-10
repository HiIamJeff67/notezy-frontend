import { IconProps } from "@shared/types/iconProps.type";

const ChevronLeftIcon = ({
  size = 24,
  className = "",
  ...props
}: IconProps) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="lucide lucide-chevron-left-icon lucide-chevron-left"
      {...props}
    >
      <path d="m15 18-6-6 6-6" />
    </svg>
  );
};

export default ChevronLeftIcon;
