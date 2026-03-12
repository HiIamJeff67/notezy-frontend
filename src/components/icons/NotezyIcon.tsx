import Notezy from "@/assets/logo/Notezy.png";
import Image from "next/image";
import React from "react";

interface NotezyIconProps {
  size?: number;
  className?: string;
}

export const NotezyIcon: React.FC<NotezyIconProps> = ({
  size = 200,
  className,
}) => {
  return (
    <Image
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
