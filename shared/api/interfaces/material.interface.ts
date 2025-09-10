import {
    NotezyRequestSchema,
    NotezyResponseSchema,
} from "@shared/api/interfaces/context.interface";
import { SimpleSearchParamSchema } from "@shared/api/interfaces/search.interface";
import { partialUpdateSchemaFactory } from "@shared/lib/zodSchemaFactories";
import { AllMaterialContentTypes, AllMaterialTypes } from "@shared/types/enums";
import z from "zod";

/* ============================== GetMyMaterialById ============================== */

export const GetMyMaterialByIdRequestSchema = NotezyRequestSchema.extend({
  header: z.object({
    userAgent: z.string().min(1),
    authorization: z.string().optional(),
  }),
  body: z.object({
    materialId: z.uuidv4(),
    rootShelfId: z.uuidv4(),
  }),
});

export type GetMyMaterialByIdRequest = z.infer<
  typeof GetMyMaterialByIdRequestSchema
>;

export const GetMyMaterialByIdResponseSchema = NotezyResponseSchema.extend({
  data: z.object({
    id: z.uuidv4(),
    rootShelfId: z.uuidv4(),
    parentShelfId: z.uuidv4(),
    name: z.string(),
    type: z.enum(AllMaterialTypes),
    downloadURL: z.url(),
    contentType: z.enum(AllMaterialContentTypes),
    deletedAt: z.coerce.date(),
    updatedAt: z.coerce.date(),
    createdAt: z.coerce.date(),
  }),
});

export type GetMyMaterialByIdResponse = z.infer<
  typeof GetMyMaterialByIdResponseSchema
>;

/* ============================== SearchMyMaterialsByShelfIds ============================== */

export const SearchMyMaterialsByShelfIdsRequestSchema =
  NotezyRequestSchema.extend({
    header: z.object({
      userAgent: z.string().min(1),
      authorization: z.string().optional(),
    }),
    body: z.object({
      rootShelfId: z.uuidv4(),
    }),
    param: SimpleSearchParamSchema.optional(),
  });

export type SearchMyMaterialsByShelfIdsRequest = z.infer<
  typeof SearchMyMaterialsByShelfIdsRequestSchema
>;

export const SearchMyMaterialsByShelfIdsResponseSchema =
  NotezyResponseSchema.extend({
    data: z.array(
      z.object({
        id: z.uuidv4(),
        rootShelfId: z.uuidv4(),
        parentShelfId: z.uuidv4(),
        name: z.string(),
        type: z.enum(AllMaterialTypes),
        downloadURL: z.url(),
        contentType: z.enum(AllMaterialContentTypes),
        deletedAt: z.coerce.date(),
        updatedAt: z.coerce.date(),
        createdAt: z.coerce.date(),
      })
    ),
  });

export type SearchMyMaterialsByShelfIdsResponse = z.infer<
  typeof SearchMyMaterialsByShelfIdsResponseSchema
>;

/* ============================== CreateMaterial ============================== */

export const CreateMaterialRequestSchema = NotezyRequestSchema.extend({
  header: z.object({
    userAgent: z.string().min(1),
    authorization: z.string().optional(),
  }),
  body: z.object({
    rootShelfId: z.uuidv4(),
    parentShelfId: z.uuidv4(),
    name: z.string().min(1).max(128),
  }),
});

export type CreateMaterialRequest = z.infer<typeof CreateMaterialRequestSchema>;

export const CreateMaterialResponseSchema = NotezyResponseSchema.extend({
  data: z.object({
    createdAt: z.coerce.date(),
  }),
});

export type CreateMaterialResponse = z.infer<
  typeof CreateMaterialResponseSchema
>;

/* ============================== SaveMyMaterialById ============================== */

export const SaveMyMaterialByIdRequestSchema = NotezyRequestSchema.extend({
  header: z.object({
    userAgent: z.string().min(1),
    authorization: z.string().optional(),
  }),
  body: z.object({
    materialId: z.uuidv4(),
    rootShelfId: z.uuidv4(),
    partialUpdate: partialUpdateSchemaFactory(
      z.object({
        name: z.string().min(1).max(128),
      })
    ),
    contentFile: z.file().optional(),
  }),
});

export type SaveMyMaterialByIdRequest = z.infer<
  typeof SaveMyMaterialByIdRequestSchema
>;

export const SaveMyMaterialByIdResponseSchema = NotezyResponseSchema.extend({
  data: z.object({
    updatedAt: z.coerce.date(),
  }),
});

export type SaveMyMaterialByIdResponse = z.infer<
  typeof SaveMyMaterialByIdResponseSchema
>;

/* ============================== MoveMyMaterialById ============================== */

export const MoveMyMaterialByIdRequestSchema = NotezyRequestSchema.extend({
  header: z.object({
    userAgent: z.string().min(1),
    authorization: z.string().optional(),
  }),
  body: z.object({
    materialId: z.uuidv4(),
    sourceRootShelfId: z.uuidv4(),
    destinationRootShelfId: z.uuidv4(),
    destinationParentShelfId: z.uuidv4(),
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

/* ============================== RestoreMyMaterialById ============================== */

export const RestoreMyMaterialByIdRequestSchema = NotezyRequestSchema.extend({
  header: z.object({
    userAgent: z.string().min(1),
    authorization: z.string().optional(),
  }),
  body: z.object({
    materialId: z.uuidv4(),
    rootShelfId: z.uuidv4(),
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
    materialIds: z.array(z.uuidv4()).min(1).max(32),
    rootShelfId: z.uuidv4(),
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
    rootShelfId: z.uuidv4(),
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
    materialIds: z.array(z.uuidv4()).min(1).max(32),
    rootShelfId: z.uuidv4(),
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
