import { UUID } from "@/shared/types/uuid_v4.type";

export interface ShelfNode {
  id: UUID;
  name: string;
  parent: ShelfNode | null;
  children: Map<UUID, ShelfNode>;
  materialIds: Map<UUID, boolean>;
}
