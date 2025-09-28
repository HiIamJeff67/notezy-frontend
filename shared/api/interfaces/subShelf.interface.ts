import { z } from "zod";
import { NotezyRequestSchema, NotezyResponseSchema } from "./context.interface";

/* ============================== GetMySubShelfById ============================== */

export const GetMySubShelfByIdRequestSchema = NotezyRequestSchema.extend({
  header: z.object({
    userAgent: z.string().min(1),
    authorization: z.string().optional(),
  }),
  param: z.object({
    subShelfId: z.uuidv4(),
  }),
});

export type GetMySubShelfByIdRequest = z.infer<
  typeof GetMySubShelfByIdRequestSchema
>;

export const GetMySubShelfByIdResponseSchema = NotezyResponseSchema.extend({
  data: z.object({
    id: z.uuidv4(),
    name: z.string(),
    rooShelfId: z.uuidv4(),
    prevSubShelfId: z.uuidv4().nullable(),
    path: z.array(z.uuidv4()),
    deletedAt: z.coerce.date(),
    updatedAt: z.coerce.date(),
    createdAt: z.coerce.date(),
  }),
});

export type GetMySubShelfByIdResponse = z.infer<
  typeof GetMySubShelfByIdResponseSchema
>;

/* ============================== GetMySubShelvesByPrevSubShelfId ============================== */

export const GetMySubShelvesByPrevSubShelfIdRequestSchema =
  NotezyRequestSchema.extend({
    header: z.object({
      userAgent: z.string().min(1),
      authorization: z.string().optional(),
    }),
    param: z.object({
      prevSubShelfId: z.uuidv4(),
    }),
  });

export type GetMySubShelvesByPrevSubShelfIdRequest = z.infer<
  typeof GetMySubShelvesByPrevSubShelfIdRequestSchema
>;

export const GetMySubShelvesByPrevSubShelfIdResponseSchema =
  NotezyResponseSchema.extend({
    data: z.array(
      z.object({
        id: z.uuidv4(),
        name: z.string(),
        rooShelfId: z.uuidv4(),
        prevSubShelfId: z.uuidv4().nullable(),
        path: z.array(z.uuidv4()),
        deletedAt: z.coerce.date(),
        updatedAt: z.coerce.date(),
        createdAt: z.coerce.date(),
      })
    ),
  });

export type GetMySubShelvesByPrevSubShelfIdResponse = z.infer<
  typeof GetMySubShelvesByPrevSubShelfIdResponseSchema
>;

/* ============================== GetAllMySubShelvesByRootShelfId ============================== */

export const GetAllMySubShelvesByRootShelfIdRequestSchema =
  NotezyRequestSchema.extend({
    header: z.object({
      userAgent: z.string().min(1),
      authorization: z.string().optional(),
    }),
    param: z.object({
      rootShelfId: z.uuidv4(),
    }),
  });

export type GetAllMySubShelvesByRootShelfIdRequest = z.infer<
  typeof GetAllMySubShelvesByRootShelfIdRequestSchema
>;

export const GetAllMySubShelvesByRootShelfIdResponseSchema =
  NotezyResponseSchema.extend({
    data: z.array(
      z.object({
        id: z.uuidv4(),
        name: z.string(),
        rooShelfId: z.uuidv4(),
        prevSubShelfId: z.uuidv4().nullable(),
        path: z.array(z.uuidv4()),
        deletedAt: z.coerce.date(),
        updatedAt: z.coerce.date(),
        createdAt: z.coerce.date(),
      })
    ),
  });

export type GetAllMySubShelvesByRootShelfIdResponse = z.infer<
  typeof GetAllMySubShelvesByRootShelfIdResponseSchema
>;

/* ============================== CreateSubShelfByRootShelfId ============================== */

export const CreateSubShelfByRootShelfIdRequestSchema =
  NotezyRequestSchema.extend({
    header: z.object({
      userAgent: z.string().min(1),
      authorization: z.string().optional(),
    }),
    body: z.object({
      rootShelfId: z.uuidv4(),
      prevSubShelfId: z.uuidv4().nullable(),
      name: z.string().min(1).max(128),
    }),
    affected: z.object({
      rootShelfId: z.uuidv4(),
      prevSubShelfId: z.uuidv4().nullable(),
    }),
  });

export type CreateSubShelfByRootShelfIdRequest = z.infer<
  typeof CreateSubShelfByRootShelfIdRequestSchema
>;

export const CreateSubShelfByRootShelfIdResponseSchema =
  NotezyResponseSchema.extend({
    data: z.object({
      id: z.uuidv4(),
      createdAt: z.coerce.date(),
    }),
  });

export type CreateSubShelfByRootShelfIdResponse = z.infer<
  typeof CreateSubShelfByRootShelfIdResponseSchema
>;

/* ============================== UpdateMySubShelfById ============================== */

export const UpdateMySubShelfByIdRequestSchema = NotezyRequestSchema.extend({
  header: z.object({
    userAgent: z.string().min(1),
    authorization: z.string().optional(),
  }),
  body: z.object({
    subShelfId: z.uuidv4(),
    values: z
      .object({
        name: z.string().min(1).max(128),
      })
      .partial(),
    setNull: z.record(z.string(), z.boolean()).optional(),
  }),
  affected: z.object({
    rootShelfId: z.uuidv4(),
    prevSubShelfId: z.uuidv4().nullable(),
  }),
});

export type UpdateMySubShelfByIdRequest = z.infer<
  typeof UpdateMySubShelfByIdRequestSchema
>;

export const UpdateMySubShelfByIdResponseSchema = NotezyResponseSchema.extend({
  data: z.object({
    updatedAt: z.coerce.date(),
  }),
});

export type UpdateMySubShelfByIdResponse = z.infer<
  typeof UpdateMySubShelfByIdResponseSchema
>;

/* ============================== MoveMySubShelf ============================== */

export const MoveMySubShelfRequestSchema = NotezyRequestSchema.extend({
  header: z.object({
    userAgent: z.string().min(1),
    authorization: z.string().optional(),
  }),
  body: z.object({
    sourceRootShelfId: z.uuidv4(),
    sourceSubShelfId: z.uuidv4(),
    destinationRootShelfId: z.uuidv4(),
    destinationSubShelfId: z.uuidv4(),
  }),
  affected: z.object({
    rootShelfId: z.uuidv4(),
    childSubShelfIds: z.array(z.uuidv4()),
  }),
});

export type MoveMySubShelfRequest = z.infer<typeof MoveMySubShelfRequestSchema>;

export const MoveMySubShelfResponseSchema = NotezyResponseSchema.extend({
  data: z.object({
    updatedAt: z.coerce.date(),
  }),
});

export type MoveMySubShelfResponse = z.infer<
  typeof MoveMySubShelfResponseSchema
>;

/* ============================== MoveMySubShelves ============================== */

export const MoveMySubShelvesRequestSchema = NotezyRequestSchema.extend({
  header: z.object({
    userAgent: z.string().min(1),
    authorization: z.string().optional(),
  }),
  body: z.object({
    sourceRootShelfId: z.uuidv4(),
    sourceSubShelfIds: z.array(z.uuidv4()).min(1).max(128),
    destinationRootShelfId: z.uuidv4(),
    destinationSubShelfId: z.uuidv4(),
  }),
  affected: z.object({
    rootShelfIds: z.array(z.uuidv4()),
    childSubShelfIds: z.array(z.uuidv4()),
  }),
});

export type MoveMySubShelvesRequest = z.infer<
  typeof MoveMySubShelvesRequestSchema
>;

export const MoveMySubShelvesResponseSchema = NotezyResponseSchema.extend({
  data: z.object({
    updatedAt: z.coerce.date(),
  }),
});

export type MoveMySubShelvesResponse = z.infer<
  typeof MoveMySubShelvesResponseSchema
>;

/* ============================== RestoreMySubShelfById ============================== */

export const RestoreMySubShelfByIdRequestSchema = NotezyRequestSchema.extend({
  header: z.object({
    userAgent: z.string().min(1),
    authorization: z.string().optional(),
  }),
  body: z.object({
    subShelfId: z.uuidv4(),
  }),
  affected: z.object({
    rootShelfId: z.uuidv4(),
    prevSubShelfId: z.uuidv4().nullable(),
  }),
});

export type RestoreMySubShelfByIdRequest = z.infer<
  typeof RestoreMySubShelfByIdRequestSchema
>;

export const RestoreMySubShelfByIdResponseSchema = NotezyResponseSchema.extend({
  data: z.object({
    updatedAt: z.coerce.date(),
  }),
});

export type RestoreMySubShelfByIdResponse = z.infer<
  typeof RestoreMySubShelfByIdResponseSchema
>;

/* ============================== RestoreMySubShelvesByIds ============================== */

export const RestoreMySubShelvesByIdsRequestSchema = NotezyRequestSchema.extend(
  {
    header: z.object({
      userAgent: z.string().min(1),
      authorization: z.string().optional(),
    }),
    body: z.object({
      subShelfIds: z.array(z.uuidv4()).min(1).max(128),
    }),
    affected: z.object({
      rootShelfIds: z.array(z.uuidv4()),
      prevSubShelfIds: z.array(z.uuidv4()),
    }),
  }
);

export type RestoreMySubShelvesByIdsRequest = z.infer<
  typeof RestoreMySubShelvesByIdsRequestSchema
>;

export const RestoreMySubShelvesByIdsResponseSchema =
  NotezyResponseSchema.extend({
    data: z.object({
      updatedAt: z.coerce.date(),
    }),
  });

export type RestoreMySubShelvesByIdsResponse = z.infer<
  typeof RestoreMySubShelvesByIdsResponseSchema
>;

/* ============================== DeleteMySubShelfById ============================== */

export const DeleteMySubShelfByIdRequestSchema = NotezyRequestSchema.extend({
  header: z.object({
    userAgent: z.string().min(1),
    authorization: z.string().optional(),
  }),
  body: z.object({
    subShelfId: z.uuidv4(),
  }),
  affected: z.object({
    rootShelfId: z.uuidv4(),
    prevSubShelfId: z.uuidv4().nullable(),
  }),
});

export type DeleteMySubShelfByIdRequest = z.infer<
  typeof DeleteMySubShelfByIdRequestSchema
>;

export const DeleteMySubShelfByIdResponseSchema = NotezyResponseSchema.extend({
  data: z.object({
    deletedAt: z.coerce.date(),
  }),
});

export type DeleteMySubShelfByIdResponse = z.infer<
  typeof DeleteMySubShelfByIdResponseSchema
>;

/* ============================== DeleteMySubShelvesByIds ============================== */

export const DeleteMySubShelvesByIdsRequestSchema = NotezyRequestSchema.extend({
  header: z.object({
    userAgent: z.string().min(1),
    authorization: z.string().optional(),
  }),
  body: z.object({
    subShelfIds: z.array(z.uuidv4()).min(1).max(128),
  }),
  affected: z.object({
    rootShelfIds: z.array(z.uuidv4()),
    prevSubShelfIds: z.array(z.uuidv4()),
  }),
});

export type DeleteMySubShelvesByIdsRequest = z.infer<
  typeof DeleteMySubShelvesByIdsRequestSchema
>;

export const DeleteMySubShelvesByIdsResponseSchema =
  NotezyResponseSchema.extend({
    data: z.object({
      deletedAt: z.coerce.date(),
    }),
  });

export type DeleteMySubShelvesByIdsResponse = z.infer<
  typeof DeleteMySubShelvesByIdsResponseSchema
>;
