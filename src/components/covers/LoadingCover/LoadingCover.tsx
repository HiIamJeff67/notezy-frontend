import { useEffect } from "react";
import { useAppRouterState, useLoading } from "@/hooks";
import LoadingIndicator from "./LoadingIndicator";

const LoadingCover = () => {
  const { isStrictLoading } = useLoading();
  const { isNavigating } = useAppRouterState();
  const isAnyLoading = isStrictLoading || isNavigating;

  useEffect(() => {
    if (isAnyLoading) {
      document.body.style.overflow = "hidden";
      document.body.style.pointerEvents = "none";
    } else {
      document.body.style.overflow = "unset";
      document.body.style.pointerEvents = "auto";
    }

    return () => {
      document.body.style.overflow = "unset";
      document.body.style.pointerEvents = "auto";
    };
  }, [isAnyLoading]);

  if (!isAnyLoading) return <></>;

  return (
    <div
      className="fixed inset-0 z-9999 flex items-center justify-center bg-gray bg-opacity-60 backdrop-blur-sm cursor-wait"
      style={{ pointerEvents: "auto" }}
    >
      <LoadingIndicator />
    </div>
  );
};

export default LoadingCover;
