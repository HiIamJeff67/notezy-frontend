import React from "react";
import Notezy from "@/assets/logo/Notezy.png";

interface NotezyIconProps {
  size?: number;
  className?: string;
}

export const NotezyIcon: React.FC<NotezyIconProps> = ({
  size = 200,
  className,
}) => {
  return (
    <img
      src={Notezy}
      alt="Notezy"
      width={size}
      height={size}
      className={className}
      style={{ borderRadius: "16px" }}
    />
  );
};

export default NotezyIcon;
