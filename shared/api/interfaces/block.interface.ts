import {
  NotezyRequestSchema,
  NotezyResponseSchema,
} from "@shared/api/interfaces/context.interface";
import { AllBlockTypes } from "@shared/api/interfaces/enums";
import type { Block } from "@blocknote/core";
import { z } from "zod";

export type ArborizedEditableBlock = {
  id: string;
  type: string;
  props: unknown;
  content: unknown[] | Record<string, unknown> | null;
  children: ArborizedEditableBlock[];
};

export const ArborizedEditableBlockSchema =
  z.custom<ArborizedEditableBlock>();

export const toArborizedEditableBlock = (
  block: Block
): ArborizedEditableBlock => ({
  id: block.id,
  type: block.type,
  props: block.props ?? {},
  content: (block.content ?? []) as ArborizedEditableBlock["content"],
  children: (block.children ?? []).map(child =>
    toArborizedEditableBlock(child as Block)
  ),
});

export const PrivateBlockSchema = z.object({
  id: z.uuidv4(),
  blockPackId: z.uuidv4(),
  parentBlockId: z.uuidv4().nullable(),
  prevBlockId: z.uuidv4().nullable(),
  nextBlockId: z.uuidv4().nullable(),
  type: z.string(),
  props: z.any(),
  content: z.any(),
  deletedAt: z.coerce.date().nullable(),
  updatedAt: z.coerce.date(),
  createdAt: z.coerce.date(),
});

export type PrivateBlock = z.infer<typeof PrivateBlockSchema>;

/* ============================== GetMyBlockById ============================== */

export const GetMyBlockByIdRequestSchema = NotezyRequestSchema.extend({
  header: z
    .object({
      userAgent: z.string().min(1).optional(),
      authorization: z.string().optional(),
    })
    .optional(),
  param: z.object({
    blockId: z.uuidv4(),
  }),
});

export type GetMyBlockByIdRequest = z.infer<typeof GetMyBlockByIdRequestSchema>;

export const GetMyBlockByIdResponseSchema = NotezyResponseSchema.extend({
  data: PrivateBlockSchema,
  embedded: z.object({
    publicId: z.string(),
  }),
});

export type GetMyBlockByIdResponse = z.infer<
  typeof GetMyBlockByIdResponseSchema
>;

/* ============================== GetMyBlocksByIds ============================== */

export const GetMyBlocksByIdsRequestSchema = NotezyRequestSchema.extend({
  header: z
    .object({
      userAgent: z.string().min(1).optional(),
      authorization: z.string().optional(),
    })
    .optional(),
  param: z.object({
    blockIds: z.array(z.uuidv4()),
  }),
});

export type GetMyBlocksByIdsRequest = z.infer<
  typeof GetMyBlocksByIdsRequestSchema
>;

export const GetMyBlocksByIdsResponseSchema = NotezyResponseSchema.extend({
  data: z.array(PrivateBlockSchema),
  embedded: z.object({
    publicId: z.string(),
  }),
});

export type GetMyBlocksByIdsResponse = z.infer<
  typeof GetMyBlocksByIdsResponseSchema
>;

/* ============================== GetMyBlocksByBlockPackId ============================== */

export const GetMyBlocksByBlockPackIdRequestSchema = NotezyRequestSchema.extend(
  {
    header: z
      .object({
        userAgent: z.string().min(1).optional(),
        authorization: z.string().optional(),
      })
      .optional(),
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
    data: z.array(PrivateBlockSchema),
    embedded: z.object({
      publicId: z.string(),
    }),
  });

export type GetMyBlocksByBlockPackIdResponse = z.infer<
  typeof GetMyBlocksByBlockPackIdResponseSchema
>;

/* ============================== GetAllMyBlocks ============================== */

export const GetAllMyBlocksRequestSchema = NotezyRequestSchema.extend({
  header: z
    .object({
      userAgent: z.string().min(1).optional(),
      authorization: z.string().optional(),
    })
    .optional(),
});

export type GetAllMyBlocksRequest = z.infer<typeof GetAllMyBlocksRequestSchema>;

export const GetAllMyBlocksResponseSchema = NotezyResponseSchema.extend({
  data: z.array(PrivateBlockSchema),
  embedded: z.object({
    publicId: z.string(),
  }),
});

export type GetAllMyBlocksResponse = z.infer<
  typeof GetAllMyBlocksResponseSchema
>;

/* ============================== AppendBlock ============================== */

export const InsertBlockRequestSchema = NotezyRequestSchema.extend({
  header: z
    .object({
      userAgent: z.string().min(1).optional(),
      authorization: z.string().optional(),
    })
    .optional(),
  body: z.object({
    blockPackId: z.uuidv4(),
    parentBlockId: z.uuidv4().nullable().optional(),
    prevBlockId: z.uuidv4().nullable().optional(),
    arborizedEditableBlock: ArborizedEditableBlockSchema,
  }),
  affected: z.object({
    blockPackIds: z.array(z.uuidv4()),
  }),
});

export type InsertBlockRequest = z.infer<typeof InsertBlockRequestSchema>;

export const InsertBlockResponseSchema = NotezyResponseSchema.extend({
  data: z.object({
    blockPackId: z.uuidv4().optional(),
    blockIds: z.array(z.uuidv4()).optional(),
    createdAt: z.coerce.date(),
  }),
  embedded: z.object({
    publicId: z.string(),
  }),
});

export type InsertBlockResponse = z.infer<typeof InsertBlockResponseSchema>;

/* ============================== InsertBlocks ============================== */

export const InsertBlocksRequestSchema = NotezyRequestSchema.extend({
  header: z
    .object({
      userAgent: z.string().min(1).optional(),
      authorization: z.string().optional(),
    })
    .optional(),
  body: z.object({
    insertedBlocks: z.array(
      z.object({
        blockPackId: z.uuidv4(),
        parentBlockId: z.uuidv4().nullable().optional(),
        prevBlockId: z.uuidv4().nullable().optional(),
        arborizedEditableBlock: ArborizedEditableBlockSchema,
      })
    ),
  }),
  affected: z.object({
    blockPackIds: z.array(z.uuidv4()),
  }),
});

export type InsertBlocksRequest = z.infer<typeof InsertBlocksRequestSchema>;

export const InsertBlocksResponseSchema = NotezyResponseSchema.extend({
  data: z.object({
    isAllSuccess: z.boolean(),
    failedIndexes: z.preprocess(value => value ?? [], z.array(z.number())),
    successIndexes: z.preprocess(value => value ?? [], z.array(z.number())),
    successBlockPackAndBlockIds: z.preprocess(
      value => value ?? [],
      z.array(
        z.object({
          blockPackId: z.uuidv4(),
          blockIds: z.array(z.uuidv4()),
        })
      )
    ),
    createdAt: z.coerce.date(),
  }),
  embedded: z.object({
    publicId: z.string(),
  }),
});

export type InsertBlocksResponse = z.infer<typeof InsertBlocksResponseSchema>;

/* ============================== UpdateMyBlockById ============================== */

export const UpdateMyBlockByIdRequestSchema = NotezyRequestSchema.extend({
  header: z
    .object({
      userAgent: z.string().min(1).optional(),
      authorization: z.string().optional(),
    })
    .optional(),
  body: z.object({
    blockId: z.uuidv4(),
    values: z
      .object({
        blockPackId: z.uuidv4(),
        parentBlockId: z.uuidv4().nullable(),
        prevBlockId: z.uuidv4().nullable(),
        type: z.enum(AllBlockTypes).nullable(),
        props: z.any(),
        content: z.any(),
      })
      .partial(),
    setNull: z
      .object({
        ParentBlockId: z.literal(true).optional(),
        PrevBlockId: z.literal(true).optional(),
      })
      .optional(),
  }),
  affected: z.object({
    blockPackIds: z.array(z.uuidv4()),
  }),
});

export type UpdateMyBlockByIdRequest = z.infer<
  typeof UpdateMyBlockByIdRequestSchema
>;

export const UpdateMyBlockByIdResponseSchema = NotezyResponseSchema.extend({
  data: z.object({
    updatedAt: z.coerce.date(),
  }),
  embedded: z.object({
    publicId: z.string(),
  }),
});

export type UpdateMyBlockByIdResponse = z.infer<
  typeof UpdateMyBlockByIdResponseSchema
>;

/* ============================== UpdateMyBlocksByIds ============================== */

export const UpdateMyBlocksByIdsRequestSchema = NotezyRequestSchema.extend({
  header: z
    .object({
      userAgent: z.string().min(1).optional(),
      authorization: z.string().optional(),
    })
    .optional(),
  body: z.object({
    updatedBlocks: z.array(
      z.object({
        blockId: z.uuidv4(),
        values: z
          .object({
            blockPackId: z.uuidv4(),
            parentBlockId: z.uuidv4().nullable(),
            prevBlockId: z.uuidv4().nullable(),
            type: z.enum(AllBlockTypes).nullable(),
            props: z.any(),
            content: z.any(),
          })
          .partial(),
        setNull: z
          .object({
            ParentBlockId: z.literal(true).optional(),
            PrevBlockId: z.literal(true).optional(),
          })
          .optional(),
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
    failedIndexes: z.preprocess(value => value ?? [], z.array(z.number())),
    successIndexes: z.preprocess(value => value ?? [], z.array(z.number())),
    successBlockPackAndBlockIds: z.preprocess(
      value => value ?? [],
      z.array(
        z.object({
          blockPackId: z.uuidv4(),
          blockIds: z.array(z.uuidv4()),
        })
      )
    ),
    updatedAt: z.coerce.date(),
  }),
  embedded: z.object({
    publicId: z.string(),
  }),
});

export type UpdateMyBlocksByIdsResponse = z.infer<
  typeof UpdateMyBlocksByIdsResponseSchema
>;

/* ============================== RestoreMyBlockById ============================== */

export const RestoreMyBlockByIdRequestSchema = NotezyRequestSchema.extend({
  header: z
    .object({
      userAgent: z.string().min(1).optional(),
      authorization: z.string().optional(),
    })
    .optional(),
  body: z.object({
    blockId: z.uuidv4(),
  }),
  affected: z.object({
    blockPackIds: z.array(z.uuidv4()),
  }),
});

export type RestoreMyBlockByIdRequest = z.infer<
  typeof RestoreMyBlockByIdRequestSchema
>;

export const RestoreMyBlockByIdResponseSchema = NotezyResponseSchema.extend({
  data: PrivateBlockSchema,
  embedded: z.object({
    publicId: z.string(),
  }),
});

export type RestoreMyBlockByIdResponse = z.infer<
  typeof RestoreMyBlockByIdResponseSchema
>;

/* ============================== RestoreMyBlocksByIds ============================== */

export const RestoreMyBlocksByIdsRequestSchema = NotezyRequestSchema.extend({
  header: z
    .object({
      userAgent: z.string().min(1).optional(),
      authorization: z.string().optional(),
    })
    .optional(),
  body: z.object({
    blockIds: z.array(z.uuidv4()),
  }),
  affected: z.object({
    blockPackIds: z.array(z.uuidv4()),
  }),
});

export type RestoreMyBlocksByIdsRequest = z.infer<
  typeof RestoreMyBlocksByIdsRequestSchema
>;

export const RestoreMyBlocksByIdsResponseSchema = NotezyResponseSchema.extend({
  data: z.array(PrivateBlockSchema),
  embedded: z.object({
    publicId: z.string(),
  }),
});

export type RestoreMyBlocksByIdsResponse = z.infer<
  typeof RestoreMyBlocksByIdsResponseSchema
>;

/* ============================== DeleteMyBlockById ============================== */

export const DeleteMyBlockByIdRequestSchema = NotezyRequestSchema.extend({
  header: z
    .object({
      userAgent: z.string().min(1).optional(),
      authorization: z.string().optional(),
    })
    .optional(),
  body: z.object({
    blockId: z.uuidv4(),
  }),
  affected: z.object({
    blockPackIds: z.array(z.uuidv4()),
  }),
});

export type DeleteMyBlockByIdRequest = z.infer<
  typeof DeleteMyBlockByIdRequestSchema
>;

export const DeleteMyBlockByIdResponseSchema = NotezyResponseSchema.extend({
  data: z.object({
    deletedAt: z.coerce.date(),
  }),
  embedded: z.object({
    publicId: z.string(),
  }),
});

export type DeleteMyBlockByIdResponse = z.infer<
  typeof DeleteMyBlockByIdResponseSchema
>;

/* ============================== DeleteMyBlocksByIds ============================== */

export const DeleteMyBlocksByIdsRequestSchema = NotezyRequestSchema.extend({
  header: z
    .object({
      userAgent: z.string().min(1).optional(),
      authorization: z.string().optional(),
    })
    .optional(),
  body: z.object({
    blockIds: z.array(z.uuidv4()),
  }),
  affected: z.object({
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
  embedded: z.object({
    publicId: z.string(),
  }),
});

export type DeleteMyBlocksByIdsResponse = z.infer<
  typeof DeleteMyBlocksByIdsResponseSchema
>;
