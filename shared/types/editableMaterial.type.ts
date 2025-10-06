import { PartialBlock } from "@blocknote/core";
import { UUID } from "crypto";
import { MaterialType } from "./enums";

/*
 * This is only used as the interface between NotezyAPI and BlockNoteEditor
 */
export interface EditableMaterial {
  id: UUID;
  name: string;
  type: MaterialType;
  initialContent: PartialBlock[] | undefined;
  updatedAt: Date;
  createdAt: Date;
}
