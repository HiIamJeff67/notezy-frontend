import toast from "@shared/lib/toast";
import { tKey } from "@shared/translations";
import { GraduationCapIcon } from "lucide-react";
import { useCallback, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLanguage, useLoading, useShelfItem } from "@/hooks";

const BlockPackEditorIndexPage = () => {
  const loadingManager = useLoading();
  const languageManager = useLanguage();
  const shelfItemManager = useShelfItem();

  const [newShelfName, setNewShelfName] = useState<string>("");

  const handleCreateRootShelfOnSubmit = useCallback(async (): Promise<void> => {
    await loadingManager.startAsyncTransactionLoading(async () => {
      try {
        if (newShelfName.replaceAll(" ", "") === "") {
          throw new Error("new shelf name must not be empty");
        }

        await shelfItemManager.createRootShelf(newShelfName);
      } catch (error) {
        toast.error(languageManager.tError(error));
      } finally {
        setNewShelfName("");
      }
    });
  }, [newShelfName, loadingManager, languageManager, shelfItemManager]);

  return (
    <div className="w-full h-full flex flex-col justify-center items-center gap-4">
      <div className="w-full text-center font-bold text-4xl mb-2 px-2">
        Ready to start a new block pack space?
      </div>
      <Input
        placeholder="type your new and unique shelf name here"
        value={newShelfName}
        onChange={e => setNewShelfName(e.target.value)}
        className="w-2/3"
      />
      <div className="flex justify-center items-center gap-16">
        <Button
          variant="default"
          type="submit"
          onClick={handleCreateRootShelfOnSubmit}
        >
          {languageManager.t(tKey.common.confirm)}
        </Button>
        <Button variant="secondary">
          <GraduationCapIcon />
          <span>See Tutorial</span>
        </Button>
      </div>
    </div>
  );
};

export default BlockPackEditorIndexPage;
