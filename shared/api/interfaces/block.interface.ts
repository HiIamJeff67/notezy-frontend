import { PartialBlock } from "@blocknote/core";
import {
  NotezyRequestSchema,
  NotezyResponseSchema,
} from "@shared/api/interfaces/context.interface";
import { z } from "zod";

/* ============================== GetMyBlockById ============================== */

export const GetMyBlockByIdRequestSchema = NotezyRequestSchema.extend({
  header: z.object({
    userAgent: z.string().min(1),
    authorization: z.string().optional(),
  }),
  param: z.object({
    blockId: z.uuidv4(),
  }),
});

export type GetMyBlockByIdRequest = z.infer<typeof GetMyBlockByIdRequestSchema>;

export const GetMyBlockByIdResponseSchema = NotezyResponseSchema.extend({
  data: z.object({
    id: z.uuidv4(),
    parentBlockId: z.uuidv4().nullable(),
    blockGroupId: z.uuidv4(),
    type: z.string(), // enums.BlockType
    props: z.json(),
    content: z.array(z.json()),
    deletedAt: z.coerce.date().nullable(),
    updatedAt: z.coerce.date(),
    createdAt: z.coerce.date(),
  }),
});

export type GetMyBlockByIdResponse = z.infer<
  typeof GetMyBlockByIdResponseSchema
>;

/* ============================== GetMyBlocksByIds ============================== */

export const GetMyBlocksByIdsRequestSchema = NotezyRequestSchema.extend({
  header: z.object({
    userAgent: z.string().min(1),
    authorization: z.string().optional(),
  }),
  param: z.object({
    blockIds: z.array(z.uuidv4()),
  }),
});

export type GetMyBlocksByIdsRequest = z.infer<
  typeof GetMyBlocksByIdsRequestSchema
>;

export const GetMyBlocksByIdsResponseSchema = NotezyResponseSchema.extend({
  data: z.array(
    z.object({
      id: z.uuidv4(),
      parentBlockId: z.uuidv4().nullable(),
      blockGroupId: z.uuidv4(),
      type: z.string(),
      props: z.json(),
      content: z.array(z.json()),
      deletedAt: z.coerce.date().nullable(),
      updatedAt: z.coerce.date(),
      createdAt: z.coerce.date(),
    })
  ),
});

export type GetMyBlocksByIdsResponse = z.infer<
  typeof GetMyBlocksByIdsResponseSchema
>;

/* ============================== GetMyBlocksByBlockGroupId ============================== */

export const GetMyBlocksByBlockGroupIdRequestSchema =
  NotezyRequestSchema.extend({
    header: z.object({
      userAgent: z.string().min(1),
      authorization: z.string().optional(),
    }),
    param: z.object({
      blockGroupId: z.uuidv4(),
    }),
  });

export type GetMyBlocksByBlockGroupIdRequest = z.infer<
  typeof GetMyBlocksByBlockGroupIdRequestSchema
>;

export const GetMyBlocksByBlockGroupIdResponseSchema =
  NotezyResponseSchema.extend({
    data: z.object({
      rawArborizedEditableBlock: z.custom<PartialBlock>(),
    }),
  });

export type GetMyBlocksByBlockGroupIdResponse = z.infer<
  typeof GetMyBlocksByBlockGroupIdResponseSchema
>;

/* ============================== GetMyBlocksByBlockGroupIds ============================== */

export const GetMyBlocksByBlockGroupIdsRequestSchema =
  NotezyRequestSchema.extend({
    header: z.object({
      userAgent: z.string().min(1),
      authorization: z.string().optional(),
    }),
    param: z.object({
      blockGroupIds: z.array(z.uuidv4()),
    }),
  });

export type GetMyBlocksByBlockGroupIdsRequest = z.infer<
  typeof GetMyBlocksByBlockGroupIdsRequestSchema
>;

export const GetMyBlocksByBlockGroupIdsResponseSchema =
  NotezyResponseSchema.extend({
    data: z.array(
      z.object({
        rawArborizedEditableBlock: z.custom<PartialBlock>(),
      })
    ),
  });

export type GetMyBlocksByBlockGroupIdsResponse = z.infer<
  typeof GetMyBlocksByBlockGroupIdsResponseSchema
>;

/* ============================== GetMyBlocksByBlockPackId ============================== */

export const GetMyBlocksByBlockPackIdRequestSchema = NotezyRequestSchema.extend(
  {
    header: z.object({
      userAgent: z.string().min(1),
      authorization: z.string().optional(),
    }),
    param: z.object({
      blockPackId: z.uuidv4(),
    }),
  }
);

export type GetMyBlocksByBlockPackIdRequest = z.infer<
  typeof GetMyBlocksByBlockPackIdRequestSchema
>;

export const GetMyBlocksByBlockPackIdResponseSchema =
  NotezyResponseSchema.extend({
    data: z.array(
      z.object({
        id: z.uuidv4(),
        parentBlockId: z.uuidv4().nullable(),
        blockGroupId: z.uuidv4(),
        type: z.string(),
        props: z.json(),
        content: z.array(z.json()),
        deletedAt: z.coerce.date().nullable(),
        updatedAt: z.coerce.date(),
        createdAt: z.coerce.date(),
      })
    ),
  });

export type GetMyBlocksByBlockPackIdResponse = z.infer<
  typeof GetMyBlocksByBlockPackIdResponseSchema
>;

/* ============================== GetAllMyBlocks ============================== */

export const GetAllMyBlocksRequestSchema = NotezyRequestSchema.extend({
  header: z.object({
    userAgent: z.string().min(1),
    authorization: z.string().optional(),
  }),
});

export type GetAllMyBlocksRequest = z.infer<typeof GetAllMyBlocksRequestSchema>;

export const GetAllMyBlocksResponseSchema = NotezyResponseSchema.extend({
  data: z.array(
    z.object({
      id: z.uuidv4(),
      parentBlockId: z.uuidv4().nullable(),
      blockGroupId: z.uuidv4(),
      type: z.string(),
      props: z.json(),
      content: z.array(z.json()),
      deletedAt: z.coerce.date().nullable(),
      updatedAt: z.coerce.date(),
      createdAt: z.coerce.date(),
    })
  ),
});

export type GetAllMyBlocksResponse = z.infer<
  typeof GetAllMyBlocksResponseSchema
>;

/* ============================== InsertBlock ============================== */

export const InsertBlockRequestSchema = NotezyRequestSchema.extend({
  header: z.object({
    userAgent: z.string().min(1),
    authorization: z.string().optional(),
  }),
  body: z.object({
    parentBlockId: z.uuidv4().nullable(),
    blockGroupId: z.uuidv4(),
    arborizedEditableBlock: z.custom<PartialBlock>(),
  }),
  affected: z.object({
    blockPackId: z.uuidv4(),
  }),
});

export type InsertBlockRequest = z.infer<typeof InsertBlockRequestSchema>;

export const InsertBlockResponseSchema = NotezyResponseSchema.extend({
  data: z.object({
    createdAt: z.coerce.date(),
  }),
});

export type InsertBlockResponse = z.infer<typeof InsertBlockResponseSchema>;

/* ============================== InsertBlocks ============================== */

export const InsertBlocksRequestSchema = NotezyRequestSchema.extend({
  header: z.object({
    userAgent: z.string().min(1),
    authorization: z.string().optional(),
  }),
  body: z.object({
    insertedBlocks: z.array(
      z.object({
        parentBlockId: z.uuidv4().nullable(),
        blockGroupId: z.uuidv4(),
        arborizedEditableBlock: z.custom<PartialBlock>(),
      })
    ),
  }),
  affected: z.object({
    blockPackId: z.uuidv4(),
  }),
});

export type InsertBlocksRequest = z.infer<typeof InsertBlocksRequestSchema>;

export const InsertBlocksResponseSchema = NotezyResponseSchema.extend({
  data: z.object({
    isAllSuccess: z.boolean(),
    failedIndexes: z.array(z.number()),
    successIndexes: z.array(z.number()),
    successBlockGroupAndBlockIds: z.array(
      z.object({
        blockGroupId: z.uuidv4(),
        blockIds: z.array(z.uuidv4()),
      })
    ),
    createdAt: z.coerce.date(),
  }),
});

export type InsertBlocksResponse = z.infer<typeof InsertBlocksResponseSchema>;

/* ============================== UpdateMyBlockById ============================== */

export const UpdateMyBlockByIdRequestSchema = NotezyRequestSchema.extend({
  header: z.object({
    userAgent: z.string().min(1),
    authorization: z.string().optional(),
  }),
  body: z.object({
    blockId: z.uuidv4(),
    values: z.object({
      props: z.json(),
      content: z.array(z.json()),
    }),
    setNull: z.record(z.string(), z.boolean()).optional(),
  }),
  affected: z.object({
    blockGroupId: z.uuidv4(),
    blockPackId: z.uuidv4(),
  }),
});

export type UpdateMyBlockByIdRequest = z.infer<
  typeof UpdateMyBlockByIdRequestSchema
>;

export const UpdateMyBlockByIdResponseSchema = NotezyResponseSchema.extend({
  data: z.object({
    updatedAt: z.coerce.date(),
  }),
});

export type UpdateMyBlockByIdResponse = z.infer<
  typeof UpdateMyBlockByIdResponseSchema
>;

/* ============================== UpdateMyBlocksByIds ============================== */

export const UpdateMyBlocksByIdsRequestSchema = NotezyRequestSchema.extend({
  header: z.object({
    userAgent: z.string().min(1),
    authorization: z.string().optional(),
  }),
  body: z.object({
    updatedBlocks: z.array(
      z.object({
        blockId: z.uuidv4(),
        props: z.json(),
        content: z.array(z.json()),
      })
    ),
  }),
  affected: z.object({
    blockPackIds: z.array(z.uuidv4()),
  }),
});

export type UpdateMyBlocksByIdsRequest = z.infer<
  typeof UpdateMyBlocksByIdsRequestSchema
>;

export const UpdateMyBlocksByIdsResponseSchema = NotezyResponseSchema.extend({
  data: z.object({
    isAllSuccess: z.boolean(),
    failedIndexes: z.array(z.number()),
    successIndexes: z.array(z.number()),
    successBlockGroupAndBlockIds: z.array(
      z.object({
        blockGroupId: z.uuidv4(),
        blockIds: z.array(z.uuidv4()),
      })
    ),
    updatedAt: z.coerce.date(),
  }),
});

export type UpdateMyBlocksByIdsResponse = z.infer<
  typeof UpdateMyBlocksByIdsResponseSchema
>;

/* ============================== RestoreMyBlockById ============================== */

export const RestoreMyBlockByIdRequestSchema = NotezyRequestSchema.extend({
  header: z.object({
    userAgent: z.string().min(1),
    authorization: z.string().optional(),
  }),
  body: z.object({
    blockId: z.uuidv4(),
  }),
  affected: z.object({
    blockGroupId: z.uuidv4(),
    blockPackId: z.uuidv4(),
  }),
});

export type RestoreMyBlockByIdRequest = z.infer<
  typeof RestoreMyBlockByIdRequestSchema
>;

export const RestoreMyBlockByIdResponseSchema = NotezyResponseSchema.extend({
  data: z.object({
    id: z.uuidv4(),
    parentBlockId: z.uuidv4().nullable(),
    blockGroupId: z.uuidv4(),
    type: z.string(),
    props: z.json(),
    content: z.array(z.json()),
    deletedAt: z.coerce.date().nullable(),
    updatedAt: z.coerce.date(),
    createdAt: z.coerce.date(),
  }),
});

export type RestoreMyBlockByIdResponse = z.infer<
  typeof RestoreMyBlockByIdResponseSchema
>;

/* ============================== RestoreMyBlocksByIds ============================== */

export const RestoreMyBlocksByIdsRequestSchema = NotezyRequestSchema.extend({
  header: z.object({
    userAgent: z.string().min(1),
    authorization: z.string().optional(),
  }),
  body: z.object({
    blockIds: z.array(z.uuidv4()),
  }),
  affected: z.object({
    blockGroupIds: z.array(z.uuidv4()),
    blockPackIds: z.array(z.uuidv4()),
  }),
});

export type RestoreMyBlocksByIdsRequest = z.infer<
  typeof RestoreMyBlocksByIdsRequestSchema
>;

export const RestoreMyBlocksByIdsResponseSchema = NotezyResponseSchema.extend({
  data: z.array(
    z.object({
      id: z.uuidv4(),
      parentBlockId: z.uuidv4().nullable(),
      blockGroupId: z.uuidv4(),
      type: z.string(),
      props: z.json(),
      content: z.array(z.json()),
      deletedAt: z.coerce.date().nullable(),
      updatedAt: z.coerce.date(),
      createdAt: z.coerce.date(),
    })
  ),
});

export type RestoreMyBlocksByIdsResponse = z.infer<
  typeof RestoreMyBlocksByIdsResponseSchema
>;

/* ============================== DeleteMyBlockById ============================== */

export const DeleteMyBlockByIdRequestSchema = NotezyRequestSchema.extend({
  header: z.object({
    userAgent: z.string().min(1),
    authorization: z.string().optional(),
  }),
  body: z.object({
    blockId: z.uuidv4(),
  }),
  affected: z.object({
    blockGroupId: z.uuidv4(),
    blockPackId: z.uuidv4(),
  }),
});

export type DeleteMyBlockByIdRequest = z.infer<
  typeof DeleteMyBlockByIdRequestSchema
>;

export const DeleteMyBlockByIdResponseSchema = NotezyResponseSchema.extend({
  data: z.object({
    deletedAt: z.coerce.date(),
  }),
});

export type DeleteMyBlockByIdResponse = z.infer<
  typeof DeleteMyBlockByIdResponseSchema
>;

/* ============================== DeleteMyBlocksByIds ============================== */

export const DeleteMyBlocksByIdsRequestSchema = NotezyRequestSchema.extend({
  header: z.object({
    userAgent: z.string().min(1),
    authorization: z.string().optional(),
  }),
  body: z.object({
    blockIds: z.array(z.uuidv4()),
  }),
  affected: z.object({
    blockGroupIds: z.array(z.uuidv4()),
    blockPackIds: z.array(z.uuidv4()),
  }),
});

export type DeleteMyBlocksByIdsRequest = z.infer<
  typeof DeleteMyBlocksByIdsRequestSchema
>;

export const DeleteMyBlocksByIdsResponseSchema = NotezyResponseSchema.extend({
  data: z.object({
    deletedAt: z.coerce.date(),
  }),
});

export type DeleteMyBlocksByIdsResponse = z.infer<
  typeof DeleteMyBlocksByIdsResponseSchema
>;
