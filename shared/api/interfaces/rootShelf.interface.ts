import {
  NotezyRequestSchema,
  NotezyResponseSchema,
} from "@shared/api/interfaces/context.interface";
import { AllAccessControlPermissions } from "@shared/api/interfaces/enums/accessControlPermission.enum";
import z from "zod";

/* ============================== GetMyRootShelfById ============================== */

export const GetMyRootShelfByIdRequestSchema = NotezyRequestSchema.extend({
  header: z
    .object({
      userAgent: z.string().min(1).optional(),
      authorization: z.string().optional(),
    })
    .optional(),
  param: z.object({
    rootShelfId: z.uuidv4(),
    isDeleted: z.boolean().optional().default(false),
  }),
});

export type GetMyRootShelfByIdRequest = z.input<
  typeof GetMyRootShelfByIdRequestSchema
>;

export const GetMyRootShelfByIdResponseSchema = NotezyResponseSchema.extend({
  data: z.object({
    id: z.uuidv4(),
    name: z.string(),
    permission: z.enum(AllAccessControlPermissions),
    subShelfCount: z.int32(),
    itemCount: z.int32(),
    lastAnalyzedAt: z.coerce.date(),
    deletedAt: z.coerce.date().nullable(),
    updatedAt: z.coerce.date(),
    createdAt: z.coerce.date(),
  }),
  embedded: z.object({
    publicId: z.string(),
  }),
});

export type GetMyRootShelfByIdResponse = z.infer<
  typeof GetMyRootShelfByIdResponseSchema
>;

/* ============================== SearchRecentRootShelves ============================== */

export const SearchRecentRootShelvesRequestSchema = NotezyRequestSchema.extend({
  header: z
    .object({
      userAgent: z.string().min(1).optional(),
      authorization: z.string().optional(),
    })
    .optional(),
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
        subShelfCount: z.int32(),
        itemCount: z.int32(),
        lastAnalyzedAt: z.coerce.date(),
        deletedAt: z.coerce.date().nullable(),
        updatedAt: z.coerce.date(),
        createdAt: z.coerce.date(),
      })
    ),
    embedded: z.object({
      publicId: z.string(),
    }),
  });

export type SearchRecentRootShelvesResponse = z.infer<
  typeof SearchRecentRootShelvesResponseSchema
>;

/* ============================== CreateRootShelf ============================== */

export const CreateRootShelfRequestSchema = NotezyRequestSchema.extend({
  header: z
    .object({
      userAgent: z.string().min(1).optional(),
      authorization: z.string().optional(),
    })
    .optional(),
  body: z.object({
    id: z.uuidv4().optional(),
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
  embedded: z.object({
    publicId: z.string(),
  }),
});

export type CreateRootShelfResponse = z.infer<
  typeof CreateRootShelfResponseSchema
>;

/* ============================== CreateRootShelvesRequest ============================== */

export const CreateRootShelvesRequestSchema = NotezyRequestSchema.extend({
  header: z
    .object({
      userAgent: z.string().min(1).optional(),
      authorization: z.string().optional(),
    })
    .optional(),
  body: z.object({
    createdRootShelves: z
      .array(
        z.object({
          id: z.uuidv4().optional(),
          name: z.string().min(1).max(128),
        })
      )
      .min(1),
  }),
});

export type CreateRootShelvesRequest = z.infer<
  typeof CreateRootShelvesRequestSchema
>;

export const CreateRootShelvesResponseSchema = NotezyResponseSchema.extend({
  data: z.object({
    ids: z.array(z.uuid()),
    lastAnalyzedAt: z.coerce.date(),
    createdAt: z.coerce.date(),
  }),
  embedded: z.object({
    publicId: z.string(),
  }),
});

export type CreateRootShelvesResponse = z.infer<
  typeof CreateRootShelvesResponseSchema
>;

/* ============================== UpdateMyRootShelfById ============================== */

export const UpdateMyRootShelfByIdRequestSchema = NotezyRequestSchema.extend({
  header: z
    .object({
      userAgent: z.string().min(1).optional(),
      authorization: z.string().optional(),
    })
    .optional(),
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
  embedded: z.object({
    publicId: z.string(),
  }),
});

export type UpdateMyRootShelfByIdResponse = z.infer<
  typeof UpdateMyRootShelfByIdResponseSchema
>;

/* ============================== UpdateMyRootShelvesByIds ============================== */

export const UpdateMyRootShelvesByIdsRequestSchema = NotezyRequestSchema.extend(
  {
    header: z
      .object({
        userAgent: z.string().min(1).optional(),
        authorization: z.string().optional(),
      })
      .optional(),
    body: z.object({
      updatedRootShelves: z.array(
        z.object({
          rootShelfId: z.uuidv4(),
          values: z
            .object({
              name: z.string().min(1).max(128),
            })
            .partial(),
          setNull: z.record(z.string(), z.boolean()).optional(),
        })
      ),
    }),
  }
);

export type UpdateMyRootShelvesByIdsRequest = z.infer<
  typeof UpdateMyRootShelvesByIdsRequestSchema
>;

export const UpdateMyRootShelvesByIdsResponseSchema =
  NotezyResponseSchema.extend({
    data: z.object({
      updatedAt: z.coerce.date(),
    }),
    embedded: z.object({
      publicId: z.string(),
    }),
  });

export type UpdateMyRootShelvesByIdsResponse = z.infer<
  typeof UpdateMyRootShelvesByIdsResponseSchema
>;

/* ============================== RestoreMyRootShelfById ============================== */

export const RestoreMyRootShelfByIdRequestSchema = NotezyRequestSchema.extend({
  header: z
    .object({
      userAgent: z.string().min(1).optional(),
      authorization: z.string().optional(),
    })
    .optional(),
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
      id: z.uuidv4(),
      name: z.string(),
      subShelfCount: z.int32(),
      itemCount: z.int32(),
      lastAnalyzedAt: z.coerce.date(),
      deletedAt: z.coerce.date().nullable(),
      updatedAt: z.coerce.date(),
      createdAt: z.coerce.date(),
    }),
    embedded: z.object({
      publicId: z.string(),
    }),
  }
);

export type RestoreMyRootShelfByIdResponse = z.infer<
  typeof RestoreMyRootShelfByIdResponseSchema
>;

/* ============================== RestoreMyRootShelvesByIds ============================== */

export const RestoreMyRootShelvesByIdsRequestSchema =
  NotezyRequestSchema.extend({
    header: z
      .object({
        userAgent: z.string().min(1).optional(),
        authorization: z.string().optional(),
      })
      .optional(),
    body: z.object({
      rootShelfIds: z.array(z.uuidv4()).min(1).max(128),
    }),
  });

export type RestoreMyRootShelvesByIdsRequest = z.infer<
  typeof RestoreMyRootShelvesByIdsRequestSchema
>;

export const RestoreMyRootShelvesByIdsResponseSchema =
  NotezyResponseSchema.extend({
    data: z.array(
      z.object({
        id: z.uuidv4(),
        name: z.string(),
        subShelfCount: z.int32(),
        itemCount: z.int32(),
        lastAnalyzedAt: z.coerce.date(),
        deletedAt: z.coerce.date().nullable(),
        updatedAt: z.coerce.date(),
        createdAt: z.coerce.date(),
      })
    ),
    embedded: z.object({
      publicId: z.string(),
    }),
  });

export type RestoreMyRootShelvesByIdsResponse = z.infer<
  typeof RestoreMyRootShelvesByIdsResponseSchema
>;

/* ============================== DeleteMyRootShelfById ============================== */

export const DeleteMyRootShelfByIdRequestSchema = NotezyRequestSchema.extend({
  header: z
    .object({
      userAgent: z.string().min(1).optional(),
      authorization: z.string().optional(),
    })
    .optional(),
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
  embedded: z.object({
    publicId: z.string(),
  }),
});

export type DeleteMyRootShelfByIdResponse = z.infer<
  typeof DeleteMyRootShelfByIdResponseSchema
>;

/* ============================== DeleteMyRootShelvesByIds ============================== */

export const DeleteMyRootShelvesByIdsRequestSchema = NotezyRequestSchema.extend(
  {
    header: z
      .object({
        userAgent: z.string().min(1).optional(),
        authorization: z.string().optional(),
      })
      .optional(),
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
    embedded: z.object({
      publicId: z.string(),
    }),
  });

export type DeleteMyRootShelvesByIdsResponse = z.infer<
  typeof DeleteMyRootShelvesByIdsResponseSchema
>;
