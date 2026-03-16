// frontend only

export enum DNDType {
  DraggableSubShelf = "DRAGGABLE_SUB_SHELF",
  DraggableMaterial = "DRAGGABLE_MATERIAL",
  DraggableWidget = "DRAGGABLE_WIDGET",
}

export const AllDNDTypes: DNDType[] = Object.values(DNDType);
