import {
  NotezyRequestSchema,
  NotezyResponseSchema,
} from "@shared/api/interfaces/context.interface";
import { AllSupportedBlockPackIcon } from "@shared/types/enums/supportedBlockPackIcon.enum";
import { z } from "zod";

/* ============================== GetMyBlockPackById ============================== */

export const GetMyBlockPackByIdRequestSchema = NotezyRequestSchema.extend({
  header: z.object({
    userAgent: z.string().min(1),
    authorization: z.string().optional(),
  }),
  param: z.object({
    blockPackId: z.uuidv4(),
  }),
});

export type GetMyBlockPackByIdRequest = z.infer<
  typeof GetMyBlockPackByIdRequestSchema
>;

export const GetMyBlockPackByIdResponseSchema = NotezyResponseSchema.extend({
  data: z.object({
    id: z.uuidv4(),
    parentSubShelfId: z.uuidv4(),
    name: z.string(),
    icon: z.enum(AllSupportedBlockPackIcon).nullable(),
    headerBackgroundURL: z.url().nullable(),
    blockCount: z.int32(),
    deletedAt: z.coerce.date().nullable(),
    updatedAt: z.coerce.date(),
    createdAt: z.coerce.date(),
  }),
});

export type GetMyBlockPackByIdResponse = z.infer<
  typeof GetMyBlockPackByIdResponseSchema
>;

/* ============================== GetMyBlockPackAndItsParentById ============================== */

export const GetMyBlockPackAndItsParentByIdRequestSchema =
  NotezyRequestSchema.extend({
    header: z.object({
      userAgent: z.string().min(1),
      authorization: z.string().optional(),
    }),
    param: z.object({
      blockPackId: z.uuidv4(),
    }),
  });

export type GetMyBlockPackAndItsParentByIdRequest = z.infer<
  typeof GetMyBlockPackAndItsParentByIdRequestSchema
>;

export const GetMyBlockPackAndItsParentByIdResponseSchema =
  NotezyResponseSchema.extend({
    data: z.object({
      id: z.uuidv4(),
      name: z.string(),
      icon: z.enum(AllSupportedBlockPackIcon).nullable(),
      headerBackgroundURL: z.url().nullable(),
      blockCount: z.int32(),
      deletedAt: z.coerce.date().nullable(),
      updatedAt: z.coerce.date(),
      createdAt: z.coerce.date(),
      rootShelfId: z.uuidv4(),
      parentSubShelfId: z.uuidv4(),
      parentSubShelfPrevSubShelfId: z.uuidv4().nullable(),
      parentSubShelfName: z.string(),
      parentSubShelfPath: z.array(z.uuidv4()),
      parentSubShelfDeletedAt: z.coerce.date().nullable(),
      parentSubShelfUpdatedAt: z.coerce.date(),
      parentSubShelfCreatedAt: z.coerce.date(),
    }),
  });

export type GetMyBlockPackAndItsParentByIdResponse = z.infer<
  typeof GetMyBlockPackAndItsParentByIdResponseSchema
>;

/* ============================== GetMyBlockPacksByParentSubShelfId ============================== */

export const GetMyBlockPacksByParentSubShelfIdRequestSchema =
  NotezyRequestSchema.extend({
    header: z.object({
      userAgent: z.string().min(1),
      authorization: z.string().optional(),
    }),
    param: z.object({
      parentSubShelfId: z.uuidv4(),
    }),
  });

export type GetMyBlockPacksByParentSubShelfIdRequest = z.infer<
  typeof GetMyBlockPacksByParentSubShelfIdRequestSchema
>;

export const GetMyBlockPacksByParentSubShelfIdResponseSchema =
  NotezyResponseSchema.extend({
    data: z.array(
      z.object({
        id: z.uuidv4(),
        parentSubShelfId: z.uuidv4(),
        name: z.string(),
        icon: z.enum(AllSupportedBlockPackIcon).nullable(),
        headerBackgroundURL: z.url().nullable(),
        blockCount: z.int32(),
        deletedAt: z.coerce.date().nullable(),
        updatedAt: z.coerce.date(),
        createdAt: z.coerce.date(),
      })
    ),
  });

export type GetMyBlockPacksByParentSubShelfIdResponse = z.infer<
  typeof GetMyBlockPacksByParentSubShelfIdResponseSchema
>;

/* ============================== GetAllMyBlockPacksByRootShelfId ============================== */

export const GetAllMyBlockPacksByRootShelfIdRequestSchema =
  NotezyRequestSchema.extend({
    header: z.object({
      userAgent: z.string().min(1),
      authorization: z.string().optional(),
    }),
    param: z.object({
      rootShelfId: z.uuidv4(),
    }),
  });

export type GetAllMyBlockPacksByRootShelfIdRequest = z.infer<
  typeof GetAllMyBlockPacksByRootShelfIdRequestSchema
>;

export const GetAllMyBlockPacksByRootShelfIdResponseSchema =
  NotezyResponseSchema.extend({
    data: z.array(
      z.object({
        id: z.uuidv4(),
        parentSubShelfId: z.uuidv4(),
        name: z.string(),
        icon: z.enum(AllSupportedBlockPackIcon).nullable(),
        headerBackgroundURL: z.url().nullable(),
        blockCount: z.int32(),
        deletedAt: z.coerce.date().nullable(),
        updatedAt: z.coerce.date(),
        createdAt: z.coerce.date(),
      })
    ),
  });

export type GetAllMyBlockPacksByRootShelfIdResponse = z.infer<
  typeof GetAllMyBlockPacksByRootShelfIdResponseSchema
>;

/* ============================== CreateBlockPack ============================== */

export const CreateBlockPackRequestSchema = NotezyRequestSchema.extend({
  header: z.object({
    userAgent: z.string().min(1),
    authorization: z.string().optional(),
  }),
  body: z.object({
    parentSubShelfId: z.uuidv4(),
    name: z.string().min(1).max(128),
    icon: z.enum(AllSupportedBlockPackIcon).nullable(),
    headerBackgroundURL: z.url().nullable(),
  }),
  affected: z.object({
    rootShelfId: z.uuidv4(),
    parentSubShelfId: z.uuidv4(),
  }),
});

export type CreateBlockPackRequest = z.infer<
  typeof CreateBlockPackRequestSchema
>;

export const CreateBlockPackResponseSchema = NotezyResponseSchema.extend({
  data: z.object({
    id: z.uuidv4(),
    createdAt: z.coerce.date(),
  }),
});

export type CreateBlockPackResponse = z.infer<
  typeof CreateBlockPackResponseSchema
>;

/* ============================== UpdateMyBlockPackById ============================== */

export const UpdateMyBlockPackByIdRequestSchema = NotezyRequestSchema.extend({
  header: z.object({
    userAgent: z.string().min(1),
    authorization: z.string().optional(),
  }),
  body: z.object({
    blockPackId: z.uuidv4(),
    values: z
      .object({
        name: z.string().min(1).max(128),
        icon: z.enum(AllSupportedBlockPackIcon),
        headerBackgroundURL: z.url(),
      })
      .partial(),
    setNull: z.record(z.string(), z.boolean()).optional(),
  }),
  affected: z.object({
    parentSubShelfId: z.uuidv4(),
  }),
});

export type UpdateMyBlockPackByIdRequest = z.infer<
  typeof UpdateMyBlockPackByIdRequestSchema
>;

export const UpdateMyBlockPackByIdResponseSchema = NotezyResponseSchema.extend({
  data: z.object({
    updatedAt: z.coerce.date(),
  }),
});

export type UpdateMyBlockPackByIdResponse = z.infer<
  typeof UpdateMyBlockPackByIdResponseSchema
>;

/* ============================== MoveMyBlockPackById ============================== */

export const MoveMyBlockPackByIdRequestSchema = NotezyRequestSchema.extend({
  header: z.object({
    userAgent: z.string().min(1),
    authorization: z.string().optional(),
  }),
  body: z.object({
    blockPackId: z.uuidv4(),
    destinationParentSubShelfId: z.uuidv4(),
  }),
  affected: z.object({
    rootShelfId: z.uuidv4(),
    sourceParentSubShelfId: z.uuidv4(),
  }),
});

export type MoveMyBlockPackByIdRequest = z.infer<
  typeof MoveMyBlockPackByIdRequestSchema
>;

export const MoveMyBlockPackByIdResponseSchema = NotezyResponseSchema.extend({
  data: z.object({
    updatedAt: z.coerce.date(),
  }),
});

export type MoveMyBlockPackByIdResponse = z.infer<
  typeof MoveMyBlockPackByIdResponseSchema
>;

/* ============================== MoveMyBlockPacksByIds ============================== */

export const MoveMyBlockPacksByIdsRequestSchema = NotezyRequestSchema.extend({
  header: z.object({
    userAgent: z.string().min(1),
    authorization: z.string().optional(),
  }),
  body: z.object({
    blockPackIds: z.array(z.uuidv4()),
    destinationParentSubShelfId: z.uuidv4(),
  }),
  affected: z.object({
    rootShelfId: z.uuidv4(),
    sourceParentSubShelfIds: z.array(z.uuidv4()),
  }),
});

export type MoveMyBlockPacksByIdsRequest = z.infer<
  typeof MoveMyBlockPacksByIdsRequestSchema
>;

export const MoveMyBlockPacksByIdsResponseSchema = NotezyResponseSchema.extend({
  data: z.object({
    updatedAt: z.coerce.date(),
  }),
});

export type MoveMyBlockPacksByIdsResponse = z.infer<
  typeof MoveMyBlockPacksByIdsResponseSchema
>;

/* ============================== RestoreMyBlockPackById ============================== */

export const RestoreMyBlockPackByIdRequestSchema = NotezyRequestSchema.extend({
  header: z.object({
    userAgent: z.string().min(1),
    authorization: z.string().optional(),
  }),
  body: z.object({
    blockPackId: z.uuidv4(),
  }),
  affected: z.object({
    rootShelfId: z.uuidv4(),
    parentSubShelfId: z.uuidv4(),
  }),
});

export type RestoreMyBlockPackByIdRequest = z.infer<
  typeof RestoreMyBlockPackByIdRequestSchema
>;

export const RestoreMyBlockPackByIdResponseSchema = NotezyResponseSchema.extend(
  {
    data: z.object({
      id: z.uuidv4(),
      parentSubShelfId: z.uuidv4(),
      name: z.string(),
      icon: z.enum(AllSupportedBlockPackIcon).nullable(),
      headerBackgroundURL: z.url().nullable(),
      blockCount: z.int32(),
      deletedAt: z.coerce.date().nullable(),
      updatedAt: z.coerce.date(),
      createdAt: z.coerce.date(),
    }),
  }
);

export type RestoreMyBlockPackByIdResponse = z.infer<
  typeof RestoreMyBlockPackByIdResponseSchema
>;

/* ============================== RestoreMyBlockPacksByIds ============================== */

export const RestoreMyBlockPacksByIdsRequestSchema = NotezyRequestSchema.extend(
  {
    header: z.object({
      userAgent: z.string().min(1),
      authorization: z.string().optional(),
    }),
    body: z.object({
      blockPackIds: z.array(z.uuidv4()),
    }),
    affected: z.object({
      rootShelfIds: z.array(z.uuidv4()),
      parentSubShelfIds: z.array(z.uuidv4()),
    }),
  }
);

export type RestoreMyBlockPacksByIdsRequest = z.infer<
  typeof RestoreMyBlockPacksByIdsRequestSchema
>;

export const RestoreMyBlockPacksByIdsResponseSchema =
  NotezyResponseSchema.extend({
    data: z.array(
      z.object({
        id: z.uuidv4(),
        parentSubShelfId: z.uuidv4(),
        name: z.string(),
        icon: z.enum(AllSupportedBlockPackIcon).nullable(),
        headerBackgroundURL: z.url().nullable(),
        blockCount: z.int32(),
        deletedAt: z.coerce.date().nullable(),
        updatedAt: z.coerce.date(),
        createdAt: z.coerce.date(),
      })
    ),
  });

export type RestoreMyBlockPacksByIdsResponse = z.infer<
  typeof RestoreMyBlockPacksByIdsResponseSchema
>;

/* ============================== DeleteMyBlockPackById ============================== */

export const DeleteMyBlockPackByIdRequestSchema = NotezyRequestSchema.extend({
  header: z.object({
    userAgent: z.string().min(1),
    authorization: z.string().optional(),
  }),
  body: z.object({
    blockPackId: z.uuidv4(),
  }),
  affected: z.object({
    rootShelfId: z.uuidv4(),
    parentSubShelfId: z.uuidv4(),
  }),
});

export type DeleteMyBlockPackByIdRequest = z.infer<
  typeof DeleteMyBlockPackByIdRequestSchema
>;

export const DeleteMyBlockPackByIdResponseSchema = NotezyResponseSchema.extend({
  data: z.object({
    deletedAt: z.coerce.date(),
  }),
});

export type DeleteMyBlockPackByIdResponse = z.infer<
  typeof DeleteMyBlockPackByIdResponseSchema
>;

/* ============================== DeleteMyBlockPacksByIds ============================== */

export const DeleteMyBlockPacksByIdsRequestSchema = NotezyRequestSchema.extend({
  header: z.object({
    userAgent: z.string().min(1),
    authorization: z.string().optional(),
  }),
  body: z.object({
    blockPackIds: z.array(z.uuidv4()),
  }),
  affected: z.object({
    rootShelfIds: z.array(z.uuidv4()),
    parentSubShelfIds: z.array(z.uuidv4()),
  }),
});

export type DeleteMyBlockPacksByIdsRequest = z.infer<
  typeof DeleteMyBlockPacksByIdsRequestSchema
>;

export const DeleteMyBlockPacksByIdsResponseSchema =
  NotezyResponseSchema.extend({
    data: z.object({
      deletedAt: z.coerce.date(),
    }),
  });

export type DeleteMyBlockPacksByIdsResponse = z.infer<
  typeof DeleteMyBlockPacksByIdsResponseSchema
>;
