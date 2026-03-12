import WrapPlaceholder from "../Placeholders/WrapPlaceholder";

interface SettingMenuProps {
  children: React.ReactNode;
  dialogs?: React.ReactNode[];
  menuClassName?: string;
  menuItemsClassName?: string;
}

const SettingMenu = ({
  children,
  dialogs,
  menuClassName,
  menuItemsClassName,
}: SettingMenuProps) => {
  return (
    <div
      className={`w-full h-full overflow-y-auto ![scrollbar-color:var(--muted-foreground)_var(--secondary)] ${menuClassName}`}
    >
      <div
        className={`px-8 pt-12 pb-8 bg-secondary flex flex-col gap-6 min-h-full ${menuItemsClassName}`}
      >
        {children}
      </div>
      {dialogs &&
        dialogs.map((dialog, index) => (
          <WrapPlaceholder key={index}>{dialog}</WrapPlaceholder>
        ))}
    </div>
  );
};

export default SettingMenu;
