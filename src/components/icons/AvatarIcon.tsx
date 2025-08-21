import { IconProps } from "@shared/types/iconProps.type";

interface AvatarIconProps extends IconProps {
  avatarURL: string;
  alt?: string;
  fallbackText?: string;
}

export const AvatarIcon = ({
  size = 24,
  className = "",
  avatarURL,
  alt = "",
  fallbackText = "U",
  ...props
}: AvatarIconProps) => {
  return (
    <div
      className={`inline-flex items-center justify-center overflow-hidden rounded-full bg-gray-300 ${className}`}
      style={{
        width: size,
        height: size,
        minWidth: size,
        minHeight: size,
      }}
    >
      {avatarURL ? (
        <img
          src={avatarURL}
          alt={alt}
          className="w-full h-full object-cover"
          onError={e => {
            const target = e.target as HTMLImageElement;
            target.style.display = "none";
            const parent = target.parentElement;
            if (parent && size) {
              parent.innerHTML = `<span class="text-white font-medium" style="font-size: ${
                size * 0.4
              }px">${fallbackText}</span>`;
            }
          }}
        />
      ) : (
        <span
          className="text-white font-medium"
          style={{ fontSize: size * 0.4 }}
        >
          {fallbackText}
        </span>
      )}
    </div>
  );
};

export default AvatarIcon;
