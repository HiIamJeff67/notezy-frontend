import { UUID } from "../types/uuid_v4.type";

/**
 * Since the Backend is using upper case letter as the field name,
 * so we are forced to use it as well
 */

export interface ShelfNode {
  Id: UUID;
  Name: string;
  Children: Record<UUID, ShelfNode | null>;
  MaterialIds: Record<UUID, boolean>;
}
