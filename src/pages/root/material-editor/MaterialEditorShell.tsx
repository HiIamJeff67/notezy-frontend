import { Suspense } from "react";
import StrictLoadingCover from "@/components/covers/LoadingCover/StrictLoadingCover";

/*
 * Keep this shell at the material-editor root level
 * instead of colocating it with a dynamic material route component.
 * so that the AppSidebar will not reload or refresh its status
 * when materialId from params changing, this means by doing so,
 * even if the user refresh or click to navigate to other material,
 * the sidebar status including expanded shelf structure won't change along
 */

export default function MaterialEditorShell({
  children,
}: {
  children: React.ReactNode;
}) {
  return <Suspense fallback={<StrictLoadingCover />}>{children}</Suspense>;
}
