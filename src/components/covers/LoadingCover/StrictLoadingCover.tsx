import LoadingIndicator from "./LoadingIndicator";

interface StrictLoadingCoverProps {
  condition?: boolean;
}

const StrictLoadingCover = ({ condition }: StrictLoadingCoverProps) => {
  if (condition !== undefined && condition !== null && !condition) return <></>;

  return (
    <div
      className="fixed inset-0 z-9999 flex cursor-wait items-center justify-center bg-overlay backdrop-blur-sm"
      style={{ pointerEvents: "auto" }}
    >
      <LoadingIndicator />
    </div>
  );
};

export default StrictLoadingCover;
