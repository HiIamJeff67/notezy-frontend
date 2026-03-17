"use client";

import CreateShelfItemDialog from "@/components/dialogs/ShelfItemDialog/CreateShelfItemDialog";
import DeleteShelfItemDialog from "@/components/dialogs/ShelfItemDialog/DeleteShelfItemDialog";
import AccountSettingsPanel from "@/components/panels/AccountSettingsPanel/AccountSettingsPanel";
import PreferencesPanel from "@/components/panels/PreferencesPanel/PreferencesPanel";
import React, { createContext, useState } from "react";

export type ModalPropsMap = {
  AccountSettingsPanel: undefined;
  PreferencesPanel: undefined;
  CreateShelfItemDialog: {
    dialogHeader: React.ReactNode;
    disableInput?: boolean;
    inputPlaceholder?: string;
    onCreate: (value: string) => Promise<void>;
    onCancel: () => void;
  };
  DeleteShelfItemDialog: {
    dialogHeader: React.ReactNode;
    onDelete: () => Promise<void>;
    onCancel: () => void;
  };
};

export type ModalType = keyof ModalPropsMap;

interface ModalContextType {
  open: <T extends ModalType>(
    type: T,
    ...args: ModalPropsMap[T] extends undefined
      ? [undefined?]
      : [ModalPropsMap[T]]
  ) => void;
  close: () => void;
  closeAll: () => void;
  isOpen: (type: ModalType) => boolean;
}

export const ModalContext = createContext<ModalContextType | undefined>(
  undefined
);

export const ModalProvider = ({ children }: { children: React.ReactNode }) => {
  const [activeModals, setActiveModals] = useState<
    { type: ModalType; props?: any }[]
  >([]);

  const open = <T extends ModalType>(type: T, props?: any) => {
    setActiveModals(prev => [...prev, { type, props }]);
  };

  const close = () => {
    setActiveModals(prev => prev.slice(0, -1));
  };

  const closeAll = () => {
    setActiveModals([]);
  };

  const isOpen = (type: ModalType) => {
    return activeModals.some(m => m.type === type);
  };

  const getModalProps = (type: ModalType) => {
    return activeModals.find(m => m.type === type)?.props;
  };

  return (
    <ModalContext.Provider value={{ open, close, closeAll, isOpen }}>
      {children}
      <AccountSettingsPanel
        isOpen={isOpen("AccountSettingsPanel")}
        onClose={close}
        {...getModalProps("AccountSettingsPanel")}
      />
      <PreferencesPanel
        isOpen={isOpen("PreferencesPanel")}
        onClose={close}
        {...getModalProps("PreferencesPanel")}
      />
      <CreateShelfItemDialog
        isOpen={isOpen("CreateShelfItemDialog")}
        onClose={close}
        {...getModalProps("CreateShelfItemDialog")}
      />
      <DeleteShelfItemDialog
        isOpen={isOpen("DeleteShelfItemDialog")}
        onClose={close}
        {...getModalProps("DeleteShelfItemDialog")}
      />
    </ModalContext.Provider>
  );
};
