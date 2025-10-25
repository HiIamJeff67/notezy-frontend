import { Sidebar, useSidebar } from "@/components/ui/sidebar";
import { ResizeSidebarOptions, useResizeSidebar } from "@/hooks";

interface ResizableSidebarProps {
  variant?: "sidebar" | "floating" | "inset";
  collapsible?: "icon" | "offcanvas" | "none";
  options?: ResizeSidebarOptions;
  className?: string;
  children: React.ReactNode;
}

const ResizableSidebar = ({
  variant,
  collapsible,
  options,
  className,
  children,
}: ResizableSidebarProps) => {
  const sidebarManager = useSidebar();
  const { style, onMouseDown, onDoubleClick } = useResizeSidebar(options);

  return (
    <Sidebar
      variant={variant}
      collapsible={collapsible}
      className={className ?? ""}
      style={style}
    >
      <div className="relative flex h-full flex-col">
        {children}
        {sidebarManager.open && !sidebarManager.isMobile && (
          <div
            role="separator"
            aria-orientation="vertical"
            className="absolute top-0 bottom-0 right-0 w-1 cursor-col-resize bg-muted opacity-0 hover:opacity-50 transition-opacity"
            onMouseDown={onMouseDown}
            onDoubleClick={onDoubleClick}
          />
        )}
      </div>
    </Sidebar>
  );
};

export default ResizableSidebar;
