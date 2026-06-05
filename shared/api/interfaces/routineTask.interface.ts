import {
  NotezyRequestSchema,
  NotezyResponseSchema,
} from "@shared/api/interfaces/context.interface";
import {
  AllRoutineTaskPurposes,
  AllRoutineTaskStatuses,
} from "@shared/api/interfaces/enums";
import { z } from "zod";

/* ============================== GetMyRoutineTaskById ============================== */

export const GetMyRoutineTaskByIdRequestSchema = NotezyRequestSchema.extend({
  header: z
    .object({
      userAgent: z.string().min(1).optional(),
      authorization: z.string().optional(),
    })
    .optional(),
  param: z.object({
    routineTaskId: z.uuidv4(),
  }),
});

export type GetMyRoutineTaskByIdRequest = z.infer<
  typeof GetMyRoutineTaskByIdRequestSchema
>;

export const GetMyRoutineTaskByIdResponseSchema = NotezyResponseSchema.extend({
  data: z.object({
    id: z.uuidv4(),
    stationId: z.uuidv4(),
    purpose: z.enum(AllRoutineTaskPurposes),
    payload: z.any(),
    priority: z.int32(),
    status: z.enum(AllRoutineTaskStatuses),
    attempts: z.int32(),
    maxAttempts: z.int32(),
    scheduledAt: z.coerce.date(),
    actualStartedAt: z.coerce.date().nullable(),
    actualEndedAt: z.coerce.date().nullable(),
    updatedAt: z.coerce.date(),
    createdAt: z.coerce.date(),
  }),
  embedded: z.object({
    publicId: z.string(),
  }),
});

export type GetMyRoutineTaskByIdResponse = z.infer<
  typeof GetMyRoutineTaskByIdResponseSchema
>;

/* ============================== CreateRoutineTaskByStationId ============================== */

export const CreateRoutineTaskByStationIdRequestSchema =
  NotezyRequestSchema.extend({
    header: z
      .object({
        userAgent: z.string().min(1).optional(),
        authorization: z.string().optional(),
      })
      .optional(),
    body: z
      .object({
        stationId: z.uuidv4(),
        purpose: z.enum(AllRoutineTaskPurposes),
        payload: z.any(),
        priority: z.int32().min(0),
        maxAttempts: z.int32().min(1).max(20),
      })
      .partial({
        payload: true,
        priority: true,
        maxAttempts: true,
      }),
  });

export type CreateRoutineTaskByStationIdRequest = z.infer<
  typeof CreateRoutineTaskByStationIdRequestSchema
>;

export const CreateRoutineTaskByStationIdResponseSchema =
  NotezyResponseSchema.extend({
    data: z.object({
      id: z.uuidv4(),
      createdAt: z.coerce.date(),
    }),
    embedded: z.object({
      publicId: z.string(),
    }),
  });

export type CreateRoutineTaskByStationIdResponse = z.infer<
  typeof CreateRoutineTaskByStationIdResponseSchema
>;

/* ============================== UpdateMyRoutineTaskById ============================== */

export const UpdateMyRoutineTaskByIdRequestSchema = NotezyRequestSchema.extend({
  header: z
    .object({
      userAgent: z.string().min(1).optional(),
      authorization: z.string().optional(),
    })
    .optional(),
  body: z.object({
    routineTaskId: z.uuidv4(),
    values: z
      .object({
        stationId: z.uuidv4(),
        purpose: z.enum(AllRoutineTaskPurposes),
        payload: z.any(),
        priority: z.int32().min(0),
        maxAttempts: z.int32().min(1).max(20),
      })
      .partial(),
    setNull: z.record(z.string(), z.boolean()).optional(),
  }),
});

export type UpdateMyRoutineTaskByIdRequest = z.infer<
  typeof UpdateMyRoutineTaskByIdRequestSchema
>;

export const UpdateMyRoutineTaskByIdResponseSchema =
  NotezyResponseSchema.extend({
    data: z.object({
      updatedAt: z.coerce.date(),
    }),
    embedded: z.object({
      publicId: z.string(),
    }),
  });

export type UpdateMyRoutineTaskByIdResponse = z.infer<
  typeof UpdateMyRoutineTaskByIdResponseSchema
>;

/* ============================== HardDeleteMyRoutineTaskById ============================== */

export const HardDeleteMyRoutineTaskByIdRequestSchema =
  NotezyRequestSchema.extend({
    header: z
      .object({
        userAgent: z.string().min(1).optional(),
        authorization: z.string().optional(),
      })
      .optional(),
    body: z.object({
      routineTaskId: z.uuidv4(),
    }),
  });

export type HardDeleteMyRoutineTaskByIdRequest = z.infer<
  typeof HardDeleteMyRoutineTaskByIdRequestSchema
>;

export const HardDeleteMyRoutineTaskByIdResponseSchema =
  NotezyResponseSchema.extend({
    data: z.object({
      deletedAt: z.coerce.date(),
    }),
    embedded: z.object({
      publicId: z.string(),
    }),
  });

export type HardDeleteMyRoutineTaskByIdResponse = z.infer<
  typeof HardDeleteMyRoutineTaskByIdResponseSchema
>;

/* ============================== HardDeleteMyRoutineTasksByIds ============================== */

export const HardDeleteMyRoutineTasksByIdsRequestSchema =
  NotezyRequestSchema.extend({
    header: z
      .object({
        userAgent: z.string().min(1).optional(),
        authorization: z.string().optional(),
      })
      .optional(),
    body: z.object({
      routineTaskIds: z.array(z.uuidv4()),
    }),
  });

export type HardDeleteMyRoutineTasksByIdsRequest = z.infer<
  typeof HardDeleteMyRoutineTasksByIdsRequestSchema
>;

export const HardDeleteMyRoutineTasksByIdsResponseSchema =
  NotezyResponseSchema.extend({
    data: z.object({
      deletedAt: z.coerce.date(),
    }),
    embedded: z.object({
      publicId: z.string(),
    }),
  });

export type HardDeleteMyRoutineTasksByIdsResponse = z.infer<
  typeof HardDeleteMyRoutineTasksByIdsResponseSchema
>;
