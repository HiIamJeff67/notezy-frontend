import {
  AllRoutineTaskPurposes,
  RoutineTaskPurpose,
} from "@shared/api/interfaces/enums";
import { z } from "zod";

export const RoutineTaskPayloadSizeSchema = z.any().refine(value => {
  try {
    return (
      new TextEncoder().encode(JSON.stringify(value ?? {})).length <= 16_777_216
    );
  } catch {
    return false;
  }
}, "Payload must be smaller than 16 MiB.");

export const RoutineTaskPayloadSchema = z
  .object({
    purpose: z.enum(AllRoutineTaskPurposes),
    payload: RoutineTaskPayloadSizeSchema,
  })
  .superRefine(({ purpose, payload: rawPayload }, ctx) => {
    const uuidSchema = z.uuidv4();
    const payload =
      rawPayload !== null && typeof rawPayload === "object"
        ? (rawPayload as Record<string, any>)
        : {};
    const addPayloadIssue = (path: (string | number)[], message: string) =>
      ctx.addIssue({ code: "custom", path: ["payload", ...path], message });

    if (payload.pattern !== undefined) {
      if (typeof payload.pattern !== "object" || payload.pattern === null) {
        addPayloadIssue(["pattern"], "Pattern must be an object.");
      } else {
        for (const [key, binding] of Object.entries(payload.pattern)) {
          if (typeof binding !== "object" || binding === null) {
            addPayloadIssue(["pattern", key], "Pattern binding is invalid.");
            continue;
          }
          const source = (binding as Record<string, unknown>).source;
          if (
            source !== "scheduledAt" &&
            source !== "recordId" &&
            source !== "shortRecordId" &&
            source !== "routineTaskId" &&
            source !== "blockText" &&
            source !== "blockCheckboxCount"
          ) {
            addPayloadIssue(["pattern", key, "source"], "Source is invalid.");
          }
          if (
            source === "blockText" &&
            !uuidSchema.safeParse((binding as Record<string, unknown>).blockId)
              .success
          ) {
            addPayloadIssue(
              ["pattern", key, "blockId"],
              "Block ID is invalid."
            );
          }
          if (
            source === "blockCheckboxCount" &&
            !uuidSchema.safeParse(
              (binding as Record<string, unknown>).blockPackId
            ).success
          ) {
            addPayloadIssue(
              ["pattern", key, "blockPackId"],
              "BlockPack ID is invalid."
            );
          }
        }
      }
    }

    if (
      purpose === RoutineTaskPurpose.CreateRootShelf &&
      (typeof payload.name !== "string" || payload.name.trim().length === 0)
    ) {
      addPayloadIssue(["name"], "Payload needs a root shelf name.");
    }
    if (
      (purpose === RoutineTaskPurpose.UpdateRootShelf ||
        purpose === RoutineTaskPurpose.ResetRootShelf) &&
      !uuidSchema.safeParse(payload.rootShelfId).success
    ) {
      addPayloadIssue(["rootShelfId"], "Payload needs a valid root shelf.");
    }
    if (
      purpose === RoutineTaskPurpose.CreateSubShelf &&
      (!uuidSchema.safeParse(payload.rootShelfId).success ||
        typeof payload.name !== "string" ||
        payload.name.trim().length === 0)
    ) {
      addPayloadIssue([], "Payload needs a root shelf and sub shelf name.");
    }
    if (
      (purpose === RoutineTaskPurpose.UpdateSubShelf ||
        purpose === RoutineTaskPurpose.ResetSubShelf) &&
      !uuidSchema.safeParse(payload.subShelfId).success
    ) {
      addPayloadIssue(["subShelfId"], "Payload needs a valid sub shelf.");
    }
    if (
      purpose === RoutineTaskPurpose.CreateBlockPack &&
      (!uuidSchema.safeParse(payload.targetSubShelfId).success ||
        typeof payload.template?.name !== "string" ||
        payload.template.name.trim().length === 0 ||
        !Array.isArray(payload.template?.blocks) ||
        payload.template.blocks.length === 0)
    ) {
      addPayloadIssue(
        [],
        "Payload needs a target SubShelf and at least one template block."
      );
    }
    if (
      purpose === RoutineTaskPurpose.UpdateBlockPack &&
      (!uuidSchema.safeParse(payload.blockPackId).success ||
        !Array.isArray(payload.updatedBlocks) ||
        payload.updatedBlocks.length === 0)
    ) {
      addPayloadIssue(
        [],
        "Payload needs a block pack and at least one updated block."
      );
    }
    if (
      purpose === RoutineTaskPurpose.ResetBlockPack &&
      !uuidSchema.safeParse(payload.blockPackId).success
    ) {
      addPayloadIssue(["blockPackId"], "Payload needs a valid block pack.");
    }
    if (
      purpose === RoutineTaskPurpose.AppendBlock &&
      (!uuidSchema.safeParse(payload.blockPackId).success ||
        typeof payload.arborizedEditableBlock !== "object" ||
        payload.arborizedEditableBlock === null)
    ) {
      addPayloadIssue([], "Payload needs a block pack and block content.");
    }
    if (
      purpose === RoutineTaskPurpose.UpdateBlock &&
      (!uuidSchema.safeParse(payload.blockId).success ||
        typeof payload.arborizedEditableBlock !== "object" ||
        payload.arborizedEditableBlock === null)
    ) {
      addPayloadIssue([], "Payload needs a block and updated block content.");
    }
    if (
      purpose === RoutineTaskPurpose.ResetBlock &&
      !uuidSchema.safeParse(payload.blockId).success
    ) {
      addPayloadIssue(["blockId"], "Payload needs a valid block.");
    }
    if (
      purpose === RoutineTaskPurpose.CreateRoutine &&
      (!uuidSchema.safeParse(payload.stationId).success ||
        typeof payload.title !== "string" ||
        payload.title.trim().length === 0)
    ) {
      addPayloadIssue([], "Payload needs a station and routine title.");
    }
    if (
      purpose === RoutineTaskPurpose.UpdateRoutine &&
      !uuidSchema.safeParse(payload.routineId).success
    ) {
      addPayloadIssue(["routineId"], "Payload needs a valid routine.");
    }
  });
