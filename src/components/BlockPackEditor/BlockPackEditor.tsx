"use client";

import { useAppRouter, useLanguage, useLoading, useShelfItem } from "@/hooks";
import { blockPackMetaReducer } from "@/reducers/blockPackMeta.reducer";
import { BlockNoteEditor } from "@blocknote/core";
import { useGetMyBlockGroupsAndTheirBlocksByBlockPackId } from "@shared/api/hooks/blockGroup.hook";
import { BlockPackMeta } from "@shared/types/blockPackMeta.type";
import { useReducer, useState, useTransition } from "react";
import { useSidebar } from "../ui/sidebar";

interface BlockPackEditorProps {
  defaultBlockPackMeta: BlockPackMeta;
}

const BlockPackEditor = ({ defaultBlockPackMeta }: BlockPackEditorProps) => {
  const router = useAppRouter();
  const loadingManager = useLoading();
  const languageManager = useLanguage();
  const sidebarManager = useSidebar();
  const shelfItemManager = useShelfItem();

  const getMyBlockGroupsAndTheirBlocksQuerier =
    useGetMyBlockGroupsAndTheirBlocksByBlockPackId();

  const [editor, setEditor] = useState<BlockNoteEditor | undefined>(undefined);
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
  const [isSaving, startSavingTransition] = useTransition();
  const [isImporting, startImportingTransition] = useTransition();
  const [isExporting, startExportingTransition] = useTransition();
  const [meta, dispatchMeta] = useReducer(
    blockPackMetaReducer,
    defaultBlockPackMeta
  );

  return <div>BlockPackEditor</div>;
};

export default BlockPackEditor;
