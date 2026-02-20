import { PartialBlock } from "@blocknote/core";
import {
  NotezyRequestSchema,
  NotezyResponseSchema,
} from "@shared/api/interfaces/context.interface";
import z from "zod";

/* ============================== GetMyBlockGroupById ============================== */

export const GetMyBlockGroupByIdRequestSchema = NotezyRequestSchema.extend({
  header: z.object({
    userAgent: z.string().min(1),
    authorization: z.string().optional(),
  }),
  param: z.object({
    blockGroupId: z.uuidv4(),
  }),
});

export type GetMyBlockGroupByIdRequest = z.infer<
  typeof GetMyBlockGroupByIdRequestSchema
>;

export const GetMyBlockGroupByIdResponseSchema = NotezyResponseSchema.extend({
  data: z.object({
    id: z.uuidv4(),
    blockPackId: z.uuidv4(),
    prevBlockGroupId: z.uuidv4().nullable(),
    syncBlockGroupId: z.uuidv4().nullable(),
    size: z.int64(),
    deletedAt: z.coerce.date().nullable(),
    updatedAt: z.coerce.date(),
    createdAt: z.coerce.date(),
  }),
});

export type GetMyBlockGroupByIdResponse = z.infer<
  typeof GetMyBlockGroupByIdResponseSchema
>;

/* ============================== GetMyBlockGroupAndItsBlocksById ============================== */

export const GetMyBlockGroupAndItsBlocksByIdRequestSchema =
  NotezyRequestSchema.extend({
    header: z.object({
      userAgent: z.string().min(1),
      authorization: z.string().optional(),
    }),
    param: z.object({
      blockGroupId: z.uuidv4(),
    }),
  });

export type GetMyBlockGroupAndItsBlocksByIdRequest = z.infer<
  typeof GetMyBlockGroupAndItsBlocksByIdRequestSchema
>;

export const GetMyBlockGroupAndItsBlocksByIdResponseSchema =
  NotezyResponseSchema.extend({
    data: z.object({
      id: z.uuidv4(),
      blockPackId: z.uuidv4(),
      prevBlockGroupId: z.uuidv4().nullable(),
      syncBlockGroupId: z.uuidv4().nullable(),
      size: z.int64(),
      deletedAt: z.coerce.date().nullable(),
      updatedAt: z.coerce.date(),
      createdAt: z.coerce.date(),
      rawArborizedEditableBlock: z.custom<PartialBlock>(),
    }),
  });

export type GetMyBlockGroupAndItsBlocksByIdResponse = z.infer<
  typeof GetMyBlockGroupAndItsBlocksByIdResponseSchema
>;

/* ============================== GetMyBlockGroupsAndTheirBlocksByIds ============================== */

export const GetMyBlockGroupsAndTheirBlocksByIdsRequestSchema =
  NotezyRequestSchema.extend({
    header: z.object({
      userAgent: z.string().min(1),
      authorization: z.string().optional(),
    }),
    param: z.object({
      blockGroupIds: z.array(z.uuidv4()),
    }),
  });

export type GetMyBlockGroupsAndTheirBlocksByIdsRequest = z.infer<
  typeof GetMyBlockGroupsAndTheirBlocksByIdsRequestSchema
>;

export const GetMyBlockGroupsAndTheirBlocksByIdsResponseSchema =
  NotezyResponseSchema.extend({
    data: z.array(
      z.object({
        id: z.uuidv4(),
        blockPackId: z.uuidv4(),
        prevBlockGroupId: z.uuidv4().nullable(),
        syncBlockGroupId: z.uuidv4().nullable(),
        size: z.int64(),
        deletedAt: z.coerce.date().nullable(),
        updatedAt: z.coerce.date(),
        createdAt: z.coerce.date(),
        rawArborizedEditableBlock: z.custom<PartialBlock>(),
      })
    ),
  });

export type GetMyBlockGroupsAndTheirBlocksByIdsResponse = z.infer<
  typeof GetMyBlockGroupsAndTheirBlocksByIdsResponseSchema
>;

/* ============================== GetMyBlockGroupsAndTheirBlocksByBlockPackId ============================== */

export const GetMyBlockGroupsAndTheirBlocksByBlockPackIdRequestSchema =
  NotezyRequestSchema.extend({
    header: z.object({
      userAgent: z.string().min(1),
      authorization: z.string().optional(),
    }),
    param: z.object({
      blockPackId: z.uuidv4(),
    }),
  });

export type GetMyBlockGroupsAndTheirBlocksByBlockPackIdRequest = z.infer<
  typeof GetMyBlockGroupsAndTheirBlocksByBlockPackIdRequestSchema
>;

export const GetMyBlockGroupsAndTheirBlocksByBlockPackIdResponseSchema =
  NotezyResponseSchema.extend({
    data: z
      .array(
        z.object({
          id: z.uuidv4(),
          blockPackId: z.uuidv4(),
          prevBlockGroupId: z.uuidv4().nullable(),
          syncBlockGroupId: z.uuidv4().nullable(),
          size: z.int64(),
          deletedAt: z.coerce.date().nullable(),
          updatedAt: z.coerce.date(),
          createdAt: z.coerce.date(),
          rawArborizedEditableBlock: z.custom<PartialBlock>(),
        })
      )
      .min(0),
  });

export type GetMyBlockGroupsAndTheirBlocksByBlockPackIdResponse = z.infer<
  typeof GetMyBlockGroupsAndTheirBlocksByBlockPackIdResponseSchema
>;

/* ============================== GetMyBlockGroupsByPrevBlockGroupId ============================== */

export const GetMyBlockGroupsByPrevBlockGroupIdRequestSchema =
  NotezyRequestSchema.extend({
    header: z.object({
      userAgent: z.string().min(1),
      authorization: z.string().optional(),
    }),
    param: z.object({
      prevBlockGroupId: z.uuidv4(),
    }),
  });

export type GetMyBlockGroupsByPrevBlockGroupIdRequest = z.infer<
  typeof GetMyBlockGroupsByPrevBlockGroupIdRequestSchema
>;

export const GetMyBlockGroupsByPrevBlockGroupIdResponseSchema =
  NotezyResponseSchema.extend({
    data: z.array(
      z.object({
        id: z.uuidv4(),
        blockPackId: z.uuidv4(),
        prevBlockGroupId: z.uuidv4().nullable(),
        syncBlockGroupId: z.uuidv4().nullable(),
        size: z.int64(),
        deletedAt: z.coerce.date().nullable(),
        updatedAt: z.coerce.date(),
        createdAt: z.coerce.date(),
      })
    ),
  });

export type GetMyBlockGroupsByPrevBlockGroupIdResponse = z.infer<
  typeof GetMyBlockGroupsByPrevBlockGroupIdResponseSchema
>;

/* ============================== GetAllMyBlockGroupsByBlockPackId ============================== */

export const GetAllMyBlockGroupsByBlockPackIdRequestSchema =
  NotezyRequestSchema.extend({
    header: z.object({
      userAgent: z.string().min(1),
      authorization: z.string().optional(),
    }),
    param: z.object({
      blockPackId: z.uuidv4(),
    }),
  });

export type GetAllMyBlockGroupsByBlockPackIdRequest = z.infer<
  typeof GetAllMyBlockGroupsByBlockPackIdRequestSchema
>;

export const GetAllMyBlockGroupsByBlockPackIdResponseSchema =
  NotezyResponseSchema.extend({
    data: z.array(
      z.object({
        id: z.uuidv4(),
        blockPackId: z.uuidv4(),
        prevBlockGroupId: z.uuidv4().nullable(),
        syncBlockGroupId: z.uuidv4().nullable(),
        size: z.int64(),
        deletedAt: z.coerce.date().nullable(),
        updatedAt: z.coerce.date(),
        createdAt: z.coerce.date(),
      })
    ),
  });

export type GetAllMyBlockGroupsByBlockPackIdResponse = z.infer<
  typeof GetAllMyBlockGroupsByBlockPackIdResponseSchema
>;

/* ============================== InsertBlockGroupByBlockPackId ============================== */

export const InsertBlockGroupByBlockPackIdRequestSchema =
  NotezyRequestSchema.extend({
    header: z.object({
      userAgent: z.string().min(1),
      authorization: z.string().optional(),
    }),
    body: z.object({
      blockPackId: z.uuidv4(),
      prevBlockGroupId: z.uuidv4().nullable(),
    }),
  });

export type InsertBlockGroupByBlockPackIdRequest = z.infer<
  typeof InsertBlockGroupByBlockPackIdRequestSchema
>;

export const InsertBlockGroupByBlockPackIdResponseSchema =
  NotezyResponseSchema.extend({
    data: z.object({
      id: z.uuidv4(),
      createdAt: z.coerce.date(),
    }),
  });

export type InsertBlockGroupByBlockPackIdResponse = z.infer<
  typeof InsertBlockGroupByBlockPackIdResponseSchema
>;

/* ============================== InsertBlockGroupAndItsBlocksByBlockPackId ============================== */

export const InsertBlockGroupAndItsBlocksByBlockPackIdRequestSchema =
  NotezyRequestSchema.extend({
    header: z.object({
      userAgent: z.string().min(1),
      authorization: z.string().optional(),
    }),
    body: z.object({
      blockPackId: z.uuidv4(),
      prevBlockGroupId: z.uuidv4().nullable(),
      arborizedEditableBlock: z.custom<PartialBlock>(),
    }),
  });

export type InsertBlockGroupAndItsBlocksByBlockPackIdRequest = z.infer<
  typeof InsertBlockGroupAndItsBlocksByBlockPackIdRequestSchema
>;

export const InsertBlockGroupAndItsBlocksByBlockPackIdResponseSchema =
  NotezyResponseSchema.extend({
    data: z.object({
      id: z.uuidv4(),
      createdAt: z.coerce.date(),
    }),
  });

export type InsertBlockGroupAndItsBlocksByBlockPackIdResponse = z.infer<
  typeof InsertBlockGroupAndItsBlocksByBlockPackIdResponseSchema
>;

/* ============================== InsertBlockGroupsAndTheirBlocksByBlockPackId ============================== */

export const InsertBlockGroupsAndTheirBlocksByBlockPackIdRequestSchema =
  NotezyRequestSchema.extend({
    header: z.object({
      userAgent: z.string().min(1),
      authorization: z.string().optional(),
    }),
    body: z.object({
      blockPackId: z.uuidv4(),
      blockGroupContents: z.array(
        z.object({
          prevBlockGroupId: z.uuidv4().nullable(),
          arborizedEditableBlock: z.custom<PartialBlock>(),
        })
      ),
    }),
  });

export type InsertBlockGroupsAndTheirBlocksByBlockPackIdRequest = z.infer<
  typeof InsertBlockGroupsAndTheirBlocksByBlockPackIdRequestSchema
>;

export const InsertBlockGroupsAndTheirBlocksByBlockPackIdResponseSchema =
  NotezyResponseSchema.extend({
    data: z.object({
      isAllSuccess: z.boolean(),
      failedIndexes: z.array(z.int32()),
      successIndexes: z.array(z.int32()),
      successBlockGroupAndBlockIds: z.array(
        z.object({
          blockGroupId: z.uuidv4(),
          blockIds: z.array(z.uuidv4()),
        })
      ),
      createdAt: z.coerce.date(),
    }),
  });

export type InsertBlockGroupsAndTheirBlocksByBlockPackIdResponse = z.infer<
  typeof InsertBlockGroupsAndTheirBlocksByBlockPackIdResponseSchema
>;

/* ============================== InsertSequentialBlockGroupsAndTheirBlocksByBlockPackId ============================== */

export const InsertSequentialBlockGroupsAndTheirBlocksByBlockPackIdRequestSchema =
  NotezyRequestSchema.extend({
    header: z.object({
      userAgent: z.string().min(1),
      authorization: z.string().optional(),
    }),
    body: z.object({
      blockPackId: z.uuidv4(),
      prevBlockGroupId: z.uuidv4().nullable(),
      arborizedEditableBlocks: z.array(z.custom<PartialBlock>()),
    }),
  });

export type InsertSequentialBlockGroupsAndTheirBlocksByBlockPackIdRequest =
  z.infer<
    typeof InsertSequentialBlockGroupsAndTheirBlocksByBlockPackIdRequestSchema
  >;

export const InsertSequentialBlockGroupsAndTheirBlocksByBlockPackIdResponseSchema =
  NotezyResponseSchema.extend({
    data: z.object({
      isAllSuccess: z.boolean(),
      failedIndexes: z.array(z.int32()),
      successIndexes: z.array(z.int32()),
      successBlockGroupAndBlockIds: z.array(
        z.object({
          blockGroupId: z.uuidv4(),
          blockIds: z.array(z.uuidv4()),
        })
      ),
      createdAt: z.coerce.date(),
    }),
  });

export type InsertSequentialBlockGroupsAndTheirBlocksByBlockPackIdResponse =
  z.infer<
    typeof InsertSequentialBlockGroupsAndTheirBlocksByBlockPackIdResponseSchema
  >;

/* ============================== MoveMyBlockGroupsByIds ============================== */

export const MoveMyBlockGroupsByIdsRequestSchema = NotezyRequestSchema.extend({
  header: z.object({
    userAgent: z.string().min(1),
    authorization: z.string().optional(),
  }),
  body: z.object({
    blockPackId: z.uuidv4(),
    movableBlockGroupIds: z.array(z.uuidv4()),
    movablePrevBlockGroupIds: z.array(z.uuidv4().nullable()),
    destinationBlockGroupId: z.uuidv4().nullable(),
  }),
});

export type MoveMyBlockGroupsByIdsRequest = z.infer<
  typeof MoveMyBlockGroupsByIdsRequestSchema
>;

export const MoveMyBlockGroupsByIdsResponseSchema = NotezyResponseSchema.extend(
  {
    data: z.object({
      updatedAt: z.coerce.date(),
    }),
  }
);

export type MoveMyBlockGroupsByIdsResponse = z.infer<
  typeof MoveMyBlockGroupsByIdsResponseSchema
>;

/* ============================== RestoreMyBlockGroupById ============================== */

export const RestoreMyBlockGroupByIdRequestSchema = NotezyRequestSchema.extend({
  header: z.object({
    userAgent: z.string().min(1),
    authorization: z.string().optional(),
  }),
  body: z.object({
    blockGroupId: z.uuidv4(),
  }),
});

export type RestoreMyBlockGroupByIdRequest = z.infer<
  typeof RestoreMyBlockGroupByIdRequestSchema
>;

export const RestoreMyBlockGroupByIdResponseSchema =
  NotezyResponseSchema.extend({
    data: z.object({
      id: z.uuidv4(),
      blockPackId: z.uuidv4(),
      prevBlockGroupId: z.uuidv4().nullable(),
      syncBlockGroupId: z.uuidv4().nullable(),
      size: z.int64(),
      deletedAt: z.coerce.date().nullable(),
      updatedAt: z.coerce.date(),
      createdAt: z.coerce.date(),
    }),
  });

export type RestoreMyBlockGroupByIdResponse = z.infer<
  typeof RestoreMyBlockGroupByIdResponseSchema
>;

/* ============================== RestoreMyBlockGroupsByIds ============================== */

export const RestoreMyBlockGroupsByIdsRequestSchema =
  NotezyRequestSchema.extend({
    header: z.object({
      userAgent: z.string().min(1),
      authorization: z.string().optional(),
    }),
    body: z.object({
      blockGroupIds: z.array(z.uuidv4()),
    }),
  });

export type RestoreMyBlockGroupsByIdsRequest = z.infer<
  typeof RestoreMyBlockGroupsByIdsRequestSchema
>;

export const RestoreMyBlockGroupsByIdsResponseSchema =
  NotezyResponseSchema.extend({
    data: z.array(
      z.object({
        id: z.uuidv4(),
        blockPackId: z.uuidv4(),
        prevBlockGroupId: z.uuidv4().nullable(),
        syncBlockGroupId: z.uuidv4().nullable(),
        size: z.int64(),
        deletedAt: z.coerce.date().nullable(),
        updatedAt: z.coerce.date(),
        createdAt: z.coerce.date(),
      })
    ),
  });

export type RestoreMyBlockGroupsByIdsResponse = z.infer<
  typeof RestoreMyBlockGroupsByIdsResponseSchema
>;

/* ============================== DeleteMyBlockGroupById ============================== */

export const DeleteMyBlockGroupByIdRequestSchema = NotezyRequestSchema.extend({
  header: z.object({
    userAgent: z.string().min(1),
    authorization: z.string().optional(),
  }),
  body: z.object({
    blockGroupId: z.uuidv4(),
  }),
  affected: z.object({
    blockPackId: z.uuidv4(),
    prevBlockGroupId: z.uuidv4().nullable(),
  }),
});

export type DeleteMyBlockGroupByIdRequest = z.infer<
  typeof DeleteMyBlockGroupByIdRequestSchema
>;

export const DeleteMyBlockGroupByIdResponseSchema = NotezyResponseSchema.extend(
  {
    data: z.object({
      deletedAt: z.coerce.date(),
    }),
  }
);

export type DeleteMyBlockGroupByIdResponse = z.infer<
  typeof DeleteMyBlockGroupByIdResponseSchema
>;

/* ============================== DeleteMyBlockGroupsByIds ============================== */

export const DeleteMyBlockGroupsByIdsRequestSchema = NotezyRequestSchema.extend(
  {
    header: z.object({
      userAgent: z.string().min(1),
      authorization: z.string().optional(),
    }),
    body: z.object({
      blockGroupIds: z.array(z.uuidv4()),
    }),
    affected: z.object({
      blockPackIds: z.array(z.uuidv4()),
      prevBlockGroupIds: z.array(z.uuidv4()),
    }),
  }
);

export type DeleteMyBlockGroupsByIdsRequest = z.infer<
  typeof DeleteMyBlockGroupsByIdsRequestSchema
>;

export const DeleteMyBlockGroupsByIdsResponseSchema =
  NotezyResponseSchema.extend({
    data: z.object({
      deletedAt: z.coerce.date(),
    }),
  });

export type DeleteMyBlockGroupsByIdsResponse = z.infer<
  typeof DeleteMyBlockGroupsByIdsResponseSchema
>;
