import {
  NotezyRequestSchema,
  NotezyResponseSchema,
} from "@shared/api/interfaces/context.interface";
import { AllMaterialTypes, MaterialType } from "@shared/types/enums";
import z from "zod";

/* ============================== GetMyMaterialById ============================== */

export const GetMyMaterialByIdRequestSchema = NotezyRequestSchema.extend({
  header: z.object({
    userAgent: z.string().min(1),
    authorization: z.string().optional(),
  }),
  param: z.object({
    materialId: z.uuidv4(),
  }),
});

export type GetMyMaterialByIdRequest = z.infer<
  typeof GetMyMaterialByIdRequestSchema
>;

export const GetMyMaterialByIdResponseSchema = NotezyResponseSchema.extend({
  data: z.object({
    id: z.uuidv4(),
    parentSubShelfId: z.uuidv4(),
    name: z.string(),
    type: z.enum(AllMaterialTypes),
    size: z.number(),
    downloadURL: z.url(),
    updatedAt: z.coerce.date(),
    createdAt: z.coerce.date(),
  }),
});

export type GetMyMaterialByIdResponse = z.infer<
  typeof GetMyMaterialByIdResponseSchema
>;

/* ============================== GetMyMaterialAndItsParentById ============================== */

export const GetMyMaterialAndItsParentByIdRequestSchema =
  NotezyRequestSchema.extend({
    header: z.object({
      userAgent: z.string().min(1),
      authorization: z.string().optional(),
    }),
    param: z.object({
      materialId: z.uuidv4(),
    }),
  });

export type GetMyMaterialAndItsParentByIdRequest = z.infer<
  typeof GetMyMaterialAndItsParentByIdRequestSchema
>;

export const GetMyMaterialAndItsParentByIdResponseSchema =
  NotezyResponseSchema.extend({
    data: z.object({
      id: z.uuidv4(),
      name: z.string(),
      type: z.enum(AllMaterialTypes),
      size: z.number(),
      downloadURL: z.url(),
      updatedAt: z.coerce.date(),
      createdAt: z.coerce.date(),
      rootShelfId: z.uuidv4(),
      parentSubShelfId: z.uuidv4(),
      parentSubShelfName: z.string(),
      parentSubShelfPrevSubShelfId: z.uuidv4(),
      parentSubShelfPath: z.array(z.uuidv4()),
      parentSubShelfUpdatedAt: z.coerce.date(),
      parentSubShelfCreatedAt: z.coerce.date(),
    }),
  });

export type GetMyMaterialAndItsParentByIdResponse = z.infer<
  typeof GetMyMaterialAndItsParentByIdResponseSchema
>;

/* ============================== GetAllMyMaterialsByParentSubShelfId ============================== */

export const GetAllMyMaterialsByParentSubShelfIdRequestSchema =
  NotezyRequestSchema.extend({
    header: z.object({
      userAgent: z.string().min(1),
      authorization: z.string().optional(),
    }),
    param: z.object({
      parentSubShelfId: z.uuidv4(),
    }),
  });

export type GetAllMyMaterialsByParentSubShelfIdRequest = z.infer<
  typeof GetAllMyMaterialsByParentSubShelfIdRequestSchema
>;

export const GetAllMyMaterialsByParentSubShelfIdResponseSchema =
  NotezyResponseSchema.extend({
    data: z.array(
      z.object({
        id: z.uuidv4(),
        parentSubShelfId: z.uuidv4(),
        name: z.string(),
        type: z.enum(AllMaterialTypes),
        downloadURL: z.url(),
        updatedAt: z.coerce.date(),
        createdAt: z.coerce.date(),
      })
    ),
  });

export type GetAllMyMaterialsByParentSubShelfIdResponse = z.infer<
  typeof GetAllMyMaterialsByParentSubShelfIdResponseSchema
>;

/* ============================== GetAllMyMaterialsByRootShelfId ============================== */

export const GetAllMyMaterialsByRootShelfIdRequestSchema =
  NotezyRequestSchema.extend({
    header: z.object({
      userAgent: z.string().min(1),
      authorization: z.string().optional(),
    }),
    param: z.object({
      rootShelfId: z.uuidv4(),
    }),
  });

export type GetAllMyMaterialsByRootShelfIdRequest = z.infer<
  typeof GetAllMyMaterialsByRootShelfIdRequestSchema
>;

export const GetAllMyMaterialsByRootShelfIdResponseSchema =
  NotezyResponseSchema.extend({
    data: z.array(
      z.object({
        id: z.uuidv4(),
        parentSubShelfId: z.uuidv4(),
        name: z.string(),
        type: z.enum(AllMaterialTypes),
        downloadURL: z.url(),
        updatedAt: z.coerce.date(),
        createdAt: z.coerce.date(),
      })
    ),
  });

export type GetAllMyMaterialsByRootShelfIdResponse = z.infer<
  typeof GetAllMyMaterialsByRootShelfIdResponseSchema
>;

/* ============================== CreateTextbookMaterial ============================== */

export const CreateTextbookMaterialRequestSchema = NotezyRequestSchema.extend({
  header: z.object({
    userAgent: z.string().min(1),
    authorization: z.string().optional(),
  }),
  body: z.object({
    parentSubShelfId: z.uuidv4(),
    name: z.string().min(1).max(128),
  }),
  affected: z.object({
    rootShelfId: z.uuidv4(),
    parentSubShelfId: z.uuidv4(),
  }),
});

export type CreateTextbookMaterialRequest = z.infer<
  typeof CreateTextbookMaterialRequestSchema
>;

export const CreateTextbookMaterialResponseSchema = NotezyResponseSchema.extend(
  {
    data: z.object({
      id: z.uuidv4(),
      downloadURL: z.string(),
      createdAt: z.coerce.date(),
    }),
  }
);

export type CreateTextbookMaterialResponse = z.infer<
  typeof CreateTextbookMaterialResponseSchema
>;

/* ============================== CreateNotebookMaterial ============================== */

export const CreateNotebookMaterialRequestSchema = NotezyRequestSchema.extend({
  header: z.object({
    userAgent: z.string().min(1),
    authorization: z.string().optional(),
  }),
  body: z.object({
    parentSubShelfId: z.uuidv4(),
    name: z.string().min(1).max(128),
  }),
  affected: z.object({
    rootShelfId: z.uuidv4(),
    parentSubShelfId: z.uuidv4(),
  }),
});

export type CreateNotebookMaterialRequest = z.infer<
  typeof CreateNotebookMaterialRequestSchema
>;

export const CreateNotebookMaterialResponseSchema = NotezyResponseSchema.extend(
  {
    data: z.object({
      id: z.uuidv4(),
      downloadURL: z.string(),
      createdAt: z.coerce.date(),
    }),
  }
);

export type CreateNotebookMaterialResponse = z.infer<
  typeof CreateNotebookMaterialResponseSchema
>;

/* ============================== UpdateMyMaterialById ============================== */

export const UpdateMyMaterialByIdRequestSchema = NotezyRequestSchema.extend({
  header: z.object({
    userAgent: z.string().min(1),
    authorization: z.string().optional(),
  }),
  body: z.object({
    materialId: z.uuidv4(),
    values: z
      .object({
        name: z.string().min(1).max(128),
      })
      .partial(),
    setNull: z.record(z.string(), z.boolean()).optional(),
    type: z.enum(MaterialType),
  }),
  affected: z.object({
    parentSubShelfId: z.uuidv4(),
  }),
});

export type UpdateMyMaterialByIdRequest = z.infer<
  typeof UpdateMyMaterialByIdRequestSchema
>;

export const UpdateMyMaterialByIdResponseSchema = NotezyResponseSchema.extend({
  data: z.object({
    updatedAt: z.coerce.date(),
  }),
});

export type UpdateMyMaterialByIdResponse = z.infer<
  typeof UpdateMyMaterialByIdResponseSchema
>;

/* ============================== SaveMyMaterialById ============================== */

export const SaveMyNotebookMaterialByIdRequestSchema =
  NotezyRequestSchema.extend({
    header: z.object({
      userAgent: z.string().min(1),
      authorization: z.string().optional(),
    }),
    body: z.object({
      materialId: z.uuidv4(),
      contentFile: z.file().optional(),
    }),
    affected: z.object({
      parentSubShelfId: z.uuidv4(),
    }),
  });

export type SaveMyNotebookMaterialByIdRequest = z.infer<
  typeof SaveMyNotebookMaterialByIdRequestSchema
>;

export const SaveMyNotebookMaterialByIdResponseSchema =
  NotezyResponseSchema.extend({
    data: z.object({
      updatedAt: z.coerce.date(),
    }),
  });

export type SaveMyNotebookMaterialByIdResponse = z.infer<
  typeof SaveMyNotebookMaterialByIdResponseSchema
>;

/* ============================== MoveMyMaterialById ============================== */

export const MoveMyMaterialByIdRequestSchema = NotezyRequestSchema.extend({
  header: z.object({
    userAgent: z.string().min(1),
    authorization: z.string().optional(),
  }),
  body: z.object({
    materialId: z.uuidv4(),
    destinationParentSubShelfId: z.uuidv4(),
  }),
  affected: z.object({
    rootShelfId: z.uuidv4(),
    sourceParentSubShelfId: z.uuidv4(),
  }),
});

export type MoveMyMaterialByIdRequest = z.infer<
  typeof MoveMyMaterialByIdRequestSchema
>;

export const MoveMyMaterialByIdResponseSchema = NotezyResponseSchema.extend({
  data: z.object({
    updatedAt: z.coerce.date(),
  }),
});

export type MoveMyMaterialByIdResponse = z.infer<
  typeof MoveMyMaterialByIdResponseSchema
>;

/* ============================== MoveMyMaterialsByIds ============================== */

export const MoveMyMaterialsByIdsRequestSchema = NotezyRequestSchema.extend({
  header: z.object({
    userAgent: z.string().min(1),
    authorization: z.string().optional(),
  }),
  body: z.object({
    materialIds: z.array(z.uuidv4()).min(1).max(128),
    destinationParentSubShelfId: z.uuidv4(),
  }),
  affected: z.object({
    rootShelfIds: z.array(z.uuidv4()),
    sourceParentSubShelfIds: z.array(z.uuidv4()),
  }),
});

export type MoveMyMaterialsByIdsRequest = z.infer<
  typeof MoveMyMaterialsByIdsRequestSchema
>;

export const MoveMyMaterialsByIdsResponseSchema = NotezyResponseSchema.extend({
  data: z.object({
    updatedAt: z.coerce.date(),
  }),
});

export type MoveMyMaterialsByIdsResponse = z.infer<
  typeof MoveMyMaterialsByIdsResponseSchema
>;

/* ============================== RestoreMyMaterialById ============================== */

export const RestoreMyMaterialByIdRequestSchema = NotezyRequestSchema.extend({
  header: z.object({
    userAgent: z.string().min(1),
    authorization: z.string().optional(),
  }),
  body: z.object({
    materialId: z.uuidv4(),
  }),
  affected: z.object({
    rootShelfId: z.uuidv4(),
    parentSubShelfId: z.uuidv4(),
  }),
});

export type RestoreMyMaterialByIdRequest = z.infer<
  typeof RestoreMyMaterialByIdRequestSchema
>;

export const RestoreMyMaterialByIdResponseSchema = NotezyResponseSchema.extend({
  data: z.object({
    updatedAt: z.coerce.date(),
  }),
});

export type RestoreMyMaterialByIdResponse = z.infer<
  typeof RestoreMyMaterialByIdResponseSchema
>;

/* ============================== RestoreMyMaterialsByIds ============================== */

export const RestoreMyMaterialsByIdsRequestSchema = NotezyRequestSchema.extend({
  header: z.object({
    userAgent: z.string().min(1),
    authorization: z.string().optional(),
  }),
  body: z.object({
    materialIds: z.array(z.uuidv4()).min(1).max(128),
  }),
  affected: z.object({
    rootShelfIds: z.array(z.uuidv4()),
    parentSubShelfIds: z.array(z.uuidv4()),
  }),
});

export type RestoreMyMaterialsByIdsRequest = z.infer<
  typeof RestoreMyMaterialsByIdsRequestSchema
>;

export const RestoreMyMaterialsByIdsResponseSchema =
  NotezyResponseSchema.extend({
    data: z.object({
      updatedAt: z.coerce.date(),
    }),
  });

export type RestoreMyMaterialsByIdsResponse = z.infer<
  typeof RestoreMyMaterialsByIdsResponseSchema
>;

/* ============================== DeleteMyMaterialById ============================== */

export const DeleteMyMaterialByIdRequestSchema = NotezyRequestSchema.extend({
  header: z.object({
    userAgent: z.string().min(1),
    authorization: z.string().optional(),
  }),
  body: z.object({
    materialId: z.uuidv4(),
  }),
  affected: z.object({
    rootShelfId: z.uuidv4(),
    parentSubShelfId: z.uuidv4(),
  }),
});

export type DeleteMyMaterialByIdRequest = z.infer<
  typeof DeleteMyMaterialByIdRequestSchema
>;

export const DeleteMyMaterialByIdResponseSchema = NotezyResponseSchema.extend({
  data: z.object({
    deletedAt: z.coerce.date(),
  }),
});

export type DeleteMyMaterialByIdResponse = z.infer<
  typeof DeleteMyMaterialByIdResponseSchema
>;

/* ============================== DeleteMyMaterialsByIds ============================== */

export const DeleteMyMaterialsByIdsRequestSchema = NotezyRequestSchema.extend({
  header: z.object({
    userAgent: z.string().min(1),
    authorization: z.string().optional(),
  }),
  body: z.object({
    materialIds: z.array(z.uuidv4()).min(1).max(128),
  }),
  affected: z.object({
    rootShelfIds: z.array(z.uuidv4()),
    parentSubShelfIds: z.array(z.uuidv4()),
  }),
});

export type DeleteMyMaterialsByIdsRequest = z.infer<
  typeof DeleteMyMaterialsByIdsRequestSchema
>;

export const DeleteMyMaterialsByIdsResponseSchema = NotezyResponseSchema.extend(
  {
    data: z.object({
      deletedAt: z.coerce.date(),
    }),
  }
);

export type DeleteMyMaterialsByIdsResponse = z.infer<
  typeof DeleteMyMaterialsByIdsResponseSchema
>;
