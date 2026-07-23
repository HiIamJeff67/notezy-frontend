import { localDB } from "@shared/api/local/db";
import { User } from "@shared/api/local/schemas";
import { useState } from "react";
import StrictLoadingCover from "@/components/covers/LoadingCover/StrictLoadingCover";
import { Button } from "@/components/ui/button";

const AdminPage = () => {
  const [isLoadingPreviewOpen, setIsLoadingPreviewOpen] = useState(false);

  const logAllExistingUsers = async (): Promise<void> => {
    const existingUsers = await localDB.select().from(User);
    console.debug("existingUsers: ", existingUsers);
  };

  return (
    <>
      <div className="p-4 flex flex-col gap-4">
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" onClick={localDB.download}>
            Download Local DB File
          </Button>
          <Button variant="secondary" onClick={logAllExistingUsers}>
            Log all existing users
          </Button>
        </div>

        <div className="max-w-md rounded-xl border border-border bg-card p-4">
          <p className="text-base font-semibold">Loading Indicator Test</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Open fullscreen loading cover and close it manually.
          </p>
          <div className="mt-3 flex gap-2">
            <Button onClick={() => setIsLoadingPreviewOpen(true)}>
              Show Loading
            </Button>
            <Button
              variant="outline"
              onClick={() => setIsLoadingPreviewOpen(false)}
            >
              Hide Loading
            </Button>
          </div>
        </div>
      </div>

      <StrictLoadingCover condition={isLoadingPreviewOpen} />
      {isLoadingPreviewOpen ? (
        <div className="fixed top-4 right-4 z-[10000]">
          <Button
            variant="destructive"
            onClick={() => setIsLoadingPreviewOpen(false)}
          >
            Close Loading
          </Button>
        </div>
      ) : null}
    </>
  );
};

export default AdminPage;
