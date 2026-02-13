import { useLanguage, useLoading, useShelfItem } from "@/hooks";
import { SubShelfNode } from "@shared/types/shelfNodes.type";
import { useCallback } from "react";

interface BlockPackMenuProps {
  parent: SubShelfNode;
}

const BlockPackMenu = ({ parent }: BlockPackMenuProps) => {
  const loadingManager = useLoading();
  const languageManager = useLanguage();
  const shelfItemManager = useShelfItem();

  const handleRenameBlockPackOnSubmit =
    useCallback(async (): Promise<void> => {}, []);
};
