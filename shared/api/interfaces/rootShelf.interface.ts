import z from "zod";
import { NotezyRequestSchema, NotezyResponseSchema } from "./context.interface";

/* ============================== GetMyRootShelfById ============================== */

export const GetMyRootShelfByIdRequestSchema = NotezyRequestSchema.extend({
  header: z.object({
    userAgent: z.string().min(1),
    authorization: z.string().optional(),
  }),
  param: z.object({
    rootShelfId: z.uuidv4(),
  }),
});

export type GetMyRootShelfByIdRequest = z.infer<
  typeof GetMyRootShelfByIdRequestSchema
>;

export const GetMyRootShelfByIdResponseSchema = NotezyResponseSchema.extend({
  data: z.object({
    id: z.uuidv4(),
    name: z.string(),
    totalShelfNodes: z.int32(),
    totalMaterials: z.int32(),
    lastAnalyzedAt: z.coerce.date(),
    deletedAt: z.coerce.date(),
    updatedAt: z.coerce.date(),
    createdAt: z.coerce.date(),
  }),
});

export type GetMyRootShelfByIdResponse = z.infer<
  typeof GetMyRootShelfByIdResponseSchema
>;

/* ============================== SearchRecentRootShelves ============================== */

export const SearchRecentRootShelvesRequestSchema = NotezyRequestSchema.extend({
  header: z.object({
    userAgent: z.string().min(1),
    authorization: z.string().optional(),
  }),
  param: z.object({
    query: z.string().max(256).optional(),
    limit: z.int32().min(1).optional(),
    offset: z.int32().min(0).optional(),
  }),
});

export type SearchRecentRootShelvesRequest = z.infer<
  typeof SearchRecentRootShelvesRequestSchema
>;

export const SearchRecentRootShelvesResponseSchema =
  NotezyResponseSchema.extend({
    data: z.array(
      z.object({
        id: z.uuidv4(),
        name: z.string(),
        totalShelfNodes: z.int32(),
        totalMaterials: z.int32(),
        lastAnalyzedAt: z.coerce.date(),
        deletedAt: z.coerce.date(),
        updatedAt: z.coerce.date(),
        createdAt: z.coerce.date(),
      })
    ),
  });

export type SearchRecentRootShelvesResponse = z.infer<
  typeof SearchRecentRootShelvesResponseSchema
>;

/* ============================== CreateRootShelf ============================== */

export const CreateRootShelfRequestSchema = NotezyRequestSchema.extend({
  header: z.object({
    userAgent: z.string().min(1),
    authorization: z.string().optional(),
  }),
  body: z.object({
    name: z.string().min(1).max(128),
  }),
});

export type CreateRootShelfRequest = z.infer<
  typeof CreateRootShelfRequestSchema
>;

export const CreateRootShelfResponseSchema = NotezyResponseSchema.extend({
  data: z.object({
    id: z.uuidv4(),
    lastAnalyzedAt: z.coerce.date(),
    createdAt: z.coerce.date(),
  }),
});

export type CreateRootShelfResponse = z.infer<
  typeof CreateRootShelfResponseSchema
>;

/* ============================== UpdateMyRootShelfById ============================== */

export const UpdateMyRootShelfByIdRequestSchema = NotezyRequestSchema.extend({
  header: z.object({
    userAgent: z.string().min(1),
    authorization: z.string().optional(),
  }),
  body: z.object({
    rootShelfId: z.uuidv4(),
    values: z
      .object({
        name: z.string().min(1).max(128),
      })
      .partial(),
    setNull: z.record(z.string(), z.boolean()).optional(),
  }),
});

export type UpdateMyRootShelfByIdRequest = z.infer<
  typeof UpdateMyRootShelfByIdRequestSchema
>;

export const UpdateMyRootShelfByIdResponseSchema = NotezyResponseSchema.extend({
  data: z.object({
    updatedAt: z.coerce.date(),
  }),
});

export type UpdateMyRootShelfByIdResponse = z.infer<
  typeof UpdateMyRootShelfByIdResponseSchema
>;

/* ============================== RestoreMyRootShelfById ============================== */

export const RestoreMyRootShelfByIdRequestSchema = NotezyRequestSchema.extend({
  header: z.object({
    userAgent: z.string().min(1),
    authorization: z.string().optional(),
  }),
  body: z.object({
    rootShelfId: z.uuidv4(),
  }),
});

export type RestoreMyRootShelfByIdRequest = z.infer<
  typeof RestoreMyRootShelfByIdRequestSchema
>;

export const RestoreMyRootShelfByIdResponseSchema = NotezyResponseSchema.extend(
  {
    data: z.object({
      updatedAt: z.coerce.date(),
    }),
  }
);

export type RestoreMyRootShelfByIdResponse = z.infer<
  typeof RestoreMyRootShelfByIdResponseSchema
>;

/* ============================== RestoreMyRootShelvesByIds ============================== */

export const RestoreMyRootShelvesByIdsRequestSchema =
  NotezyRequestSchema.extend({
    header: z.object({
      userAgent: z.string().min(1),
      authorization: z.string().optional(),
    }),
    body: z.object({
      rootShelfIds: z.array(z.uuidv4()).min(1).max(128),
    }),
  });

export type RestoreMyRootShelvesByIdsRequest = z.infer<
  typeof RestoreMyRootShelvesByIdsRequestSchema
>;

export const RestoreMyRootShelvesByIdsResponseSchema =
  NotezyResponseSchema.extend({
    data: z.object({
      updatedAt: z.coerce.date(),
    }),
  });

export type RestoreMyRootShelvesByIdsResponse = z.infer<
  typeof RestoreMyRootShelvesByIdsResponseSchema
>;

/* ============================== DeleteMyRootShelfById ============================== */

export const DeleteMyRootShelfByIdRequestSchema = NotezyRequestSchema.extend({
  header: z.object({
    userAgent: z.string().min(1),
    authorization: z.string().optional(),
  }),
  body: z.object({
    rootShelfId: z.uuidv4(),
  }),
  affected: z.object({
    subShelfIds: z.array(z.uuidv4()),
    materialIds: z.array(z.uuidv4()),
  }),
});

export type DeleteMyRootShelfByIdRequest = z.infer<
  typeof DeleteMyRootShelfByIdRequestSchema
>;

export const DeleteMyRootShelfByIdResponseSchema = NotezyResponseSchema.extend({
  data: z.object({
    deletedAt: z.coerce.date(),
  }),
});

export type DeleteMyRootShelfByIdResponse = z.infer<
  typeof DeleteMyRootShelfByIdResponseSchema
>;

/* ============================== DeleteMyRootShelvesByIds ============================== */

export const DeleteMyRootShelvesByIdsRequestSchema = NotezyRequestSchema.extend(
  {
    header: z.object({
      userAgent: z.string().min(1),
      authorization: z.string().optional(),
    }),
    body: z.object({
      rootShelfIds: z.array(z.uuidv4()).min(1).max(128),
    }),
    affected: z.object({
      subShelfIds: z.array(z.uuidv4()),
      materialIds: z.array(z.uuidv4()),
    }),
  }
);

export type DeleteMyRootShelvesByIdsRequest = z.infer<
  typeof DeleteMyRootShelvesByIdsRequestSchema
>;

export const DeleteMyRootShelvesByIdsResponseSchema =
  NotezyResponseSchema.extend({
    data: z.object({
      deletedAt: z.coerce.date(),
    }),
  });

export type DeleteMyRootShelvesByIdsResponse = z.infer<
  typeof DeleteMyRootShelvesByIdsResponseSchema
>;
