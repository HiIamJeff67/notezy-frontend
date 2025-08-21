import { UUID } from "../types/uuid_v4.type";

export interface ShelfNode {
  id: UUID;
  name: string;
  children: Record<UUID, ShelfNode | null>;
  materialIds: Record<UUID, boolean>;
}
