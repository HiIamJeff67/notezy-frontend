import LoadingIndicator from "./LoadingIndicator";

interface StrictLoadingCoverProps {
  condition?: boolean;
}

const StrictLoadingCover = ({ condition }: StrictLoadingCoverProps) => {
  if (condition !== undefined && condition !== null && !condition) return <></>;

  return (
    <div
      className="fixed inset-0 z-9999 flex items-center justify-center bg-gray bg-opacity-60 backdrop-blur-sm cursor-wait"
      style={{ pointerEvents: "auto" }}
    >
      <LoadingIndicator />
    </div>
  );
};

export default StrictLoadingCover;
