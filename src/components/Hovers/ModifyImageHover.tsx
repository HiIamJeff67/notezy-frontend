interface ModifyImageHoverProps {
  imageSrc?: string;
  imageAlt?: string;
  onClick: () => void | Promise<void>;
  className?: string;
  hoverText: string;
  hoverTextClassName?: string;
}

const ModifyImageHover = ({
  imageSrc,
  imageAlt = "",
  onClick,
  className = "bg-black/30",
  hoverText,
  hoverTextClassName = "text-white text-xl font-semibold",
}: ModifyImageHoverProps) => {
  return (
    <div
      className={`w-full h-full inset-0 opacity-0 hover:opacity-100 flex items-center justify-center cursor-pointer transition ${className}`}
      onClick={onClick}
    >
      {imageSrc && <img src={`select-none ${imageSrc}`} alt={imageAlt} />}
      <span className={hoverTextClassName}>{hoverText}</span>
    </div>
  );
};

export default ModifyImageHover;
