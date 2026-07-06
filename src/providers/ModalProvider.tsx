import type { UUID } from "crypto";
import React, {
  createContext,
  lazy,
  Suspense,
  useEffect,
  useRef,
  useState,
} from "react";
import SelectBackgroundImageDialog from "@/components/dialogs/ImageDialog/SelectBackgroundImageDialog";
import CreateShelfItemDialog from "@/components/dialogs/ShelfItemDialog/CreateShelfItemDialog";
import DeleteShelfItemDialog from "@/components/dialogs/ShelfItemDialog/DeleteShelfItemDialog";
import CreateRoutineDialog from "@/components/dialogs/StationRoutineDialog/CreateRoutineDialog";
import CreateRoutineTagDialog from "@/components/dialogs/StationRoutineDialog/CreateRoutineTagDialog";
import CreateRoutineTaskDialog from "@/components/dialogs/StationRoutineDialog/CreateRoutineTaskDialog";
import CreateStationDialog from "@/components/dialogs/StationRoutineDialog/CreateStationDialog";
import DeleteRoutineDialog from "@/components/dialogs/StationRoutineDialog/DeleteRoutineDialog";
import DeleteRoutineTagDialog from "@/components/dialogs/StationRoutineDialog/DeleteRoutineTagDialog";
import DeleteRoutineTaskDialog from "@/components/dialogs/StationRoutineDialog/DeleteRoutineTaskDialog";
import DeleteStationDialog from "@/components/dialogs/StationRoutineDialog/DeleteStationDialog";
import RoutineTaskRecordDialogSkeleton from "@/components/dialogs/StationRoutineDialog/RoutineTaskRecordDialogSkeleton";
import AccountSettingsPanel from "@/components/panels/AccountSettingsPanel/AccountSettingsPanel";
import PreferencesPanel from "@/components/panels/PreferencesPanel/PreferencesPanel";

const RoutineTaskRecordDialog = lazy(
  () =>
    import("@/components/dialogs/StationRoutineDialog/RoutineTaskRecordDialog")
);

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export type ModalPropsMap = {
  // make sure don't place the default modal props here, ex. isOpen, onClose
  AccountSettingsPanel: undefined;
  PreferencesPanel: undefined;
  CreateShelfItemDialog: {
    dialogHeader: React.ReactNode;
    dialogDescription: React.ReactNode;
    disableInput?: boolean;
    inputPlaceholder?: string;
    onCreate: (value: string) => void | Promise<void>;
    onCancel: () => void;
  };
  DeleteShelfItemDialog: {
    dialogHeader: React.ReactNode;
    dialogDescription: React.ReactNode;
    confirmKeyword?: string;
    inputPlaceholder?: string;
    onDelete: () => void | Promise<void>;
    onCancel: () => void;
  };
  CreateStationDialog: {
    onCreated?: (stationId: UUID) => void | Promise<void>;
  };
  DeleteStationDialog: {
    stationId: UUID;
    stationName: string;
    onDeleted?: () => void | Promise<void>;
  };
  CreateRoutineDialog: {
    stationId: UUID;
    stationName?: string;
    onCreated?: (routineId: UUID) => void | Promise<void>;
  };
  DeleteRoutineDialog: {
    routineId: UUID;
    routineTitle: string;
    onDeleted?: () => void | Promise<void>;
  };
  CreateRoutineTagDialog: {
    onCreated?: (routineTagId: UUID) => void | Promise<void>;
  };
  DeleteRoutineTagDialog: {
    routineTagId: UUID;
    routineTagName: string;
    onDeleted?: () => void | Promise<void>;
  };
  CreateRoutineTaskDialog: {
    stationId: UUID;
    stationName?: string;
    onCreated?: (routineTaskId: UUID) => void | Promise<void>;
  };
  DeleteRoutineTaskDialog: {
    routineTaskId: UUID;
    routineTaskTitle: string;
    onDeleted?: () => void | Promise<void>;
  };
  RoutineTaskRecordDialog: {
    routineTitle: string;
    routineTaskIds: UUID[];
  };
  SelectBackgroundImageDialog: {
    cropperAspectRatio: number;
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
  const openTimerIdsRef = useRef<number[]>([]);

  useEffect(
    () => () => {
      for (const timerId of openTimerIdsRef.current) {
        window.clearTimeout(timerId);
      }
      openTimerIdsRef.current = [];
    },
    []
  );

  useEffect(() => {
    if (activeModals.length > 0 || typeof document === "undefined") return;

    const timerId = window.setTimeout(() => {
      document.body.style.pointerEvents = "";
    }, 0);

    return () => window.clearTimeout(timerId);
  }, [activeModals.length]);

  const open = <T extends ModalType>(type: T, props?: any) => {
    if (typeof window === "undefined") {
      setActiveModals(prev => [...prev, { type, props }]);
      return;
    }

    const timerId = window.setTimeout(() => {
      openTimerIdsRef.current = openTimerIdsRef.current.filter(
        id => id !== timerId
      );
      setActiveModals(prev => [...prev, { type, props }]);
    }, 0);

    openTimerIdsRef.current = [...openTimerIdsRef.current, timerId];
  };

  const close = () => setActiveModals(prev => prev.slice(0, -1));

  const closeAll = () => setActiveModals([]);

  const isOpen = (type: ModalType) => activeModals.some(m => m.type === type);

  const getModalProps = (type: ModalType) =>
    activeModals.find(modal => modal.type === type)?.props;

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
      <CreateStationDialog
        isOpen={isOpen("CreateStationDialog")}
        onClose={close}
        {...getModalProps("CreateStationDialog")}
      />
      <DeleteStationDialog
        isOpen={isOpen("DeleteStationDialog")}
        onClose={close}
        {...getModalProps("DeleteStationDialog")}
      />
      <CreateRoutineDialog
        isOpen={isOpen("CreateRoutineDialog")}
        onClose={close}
        {...getModalProps("CreateRoutineDialog")}
      />
      <DeleteRoutineDialog
        isOpen={isOpen("DeleteRoutineDialog")}
        onClose={close}
        {...getModalProps("DeleteRoutineDialog")}
      />
      <CreateRoutineTagDialog
        isOpen={isOpen("CreateRoutineTagDialog")}
        onClose={close}
        {...getModalProps("CreateRoutineTagDialog")}
      />
      <DeleteRoutineTagDialog
        isOpen={isOpen("DeleteRoutineTagDialog")}
        onClose={close}
        {...getModalProps("DeleteRoutineTagDialog")}
      />
      <CreateRoutineTaskDialog
        isOpen={isOpen("CreateRoutineTaskDialog")}
        onClose={close}
        {...getModalProps("CreateRoutineTaskDialog")}
      />
      <DeleteRoutineTaskDialog
        isOpen={isOpen("DeleteRoutineTaskDialog")}
        onClose={close}
        {...getModalProps("DeleteRoutineTaskDialog")}
      />
      {isOpen("RoutineTaskRecordDialog") && (
        <Suspense
          fallback={
            <RoutineTaskRecordDialogSkeleton isOpen={true} onClose={close} />
          }
        >
          <RoutineTaskRecordDialog
            isOpen={true}
            onClose={close}
            {...getModalProps("RoutineTaskRecordDialog")}
          />
        </Suspense>
      )}
      <SelectBackgroundImageDialog
        isOpen={isOpen("SelectBackgroundImageDialog")}
        onClose={close}
        {...getModalProps("SelectBackgroundImageDialog")}
      />
    </ModalContext.Provider>
  );
};
