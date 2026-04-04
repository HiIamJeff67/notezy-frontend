// frontend only

import { generateUUID } from "../types/uuidv4.type";

export enum DNDType {
  DraggableSubShelf = "DRAGGABLE_SUB_SHELF",
  DraggableMaterial = "DRAGGABLE_MATERIAL",
  DraggableWidget = "DRAGGABLE_WIDGET",
}

export const AllDNDTypes: DNDType[] = Object.values(DNDType);

export const generateDynamicDNDType = (purpose: string): string => {
  return `DRAGGABLE_${generateUUID().toString()}_${purpose.toUpperCase()}`;
};
