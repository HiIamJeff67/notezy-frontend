import {
  NotezyRequestSchema,
  NotezyResponseSchema,
} from "@shared/api/interfaces/context.interface";
import {
  AllRoutinePeriods,
  AllRoutineTaskPurposes,
  AllRoutineTaskStatuses,
} from "@shared/api/interfaces/enums";
import { z } from "zod";
import {
  VisualizePermissionRequestSchema,
  VisualizeResponseSchema,
  VisualizeTimeBucketRequestSchema,
} from "./visualize.interface";

/* ============================== Visualize Routine Task Charts ============================== */

export const VisualizeMyRoutineTaskStatusCountRequestSchema =
  VisualizePermissionRequestSchema;
export type VisualizeMyRoutineTaskStatusCountRequest = z.infer<
  typeof VisualizeMyRoutineTaskStatusCountRequestSchema
>;
export const VisualizeMyRoutineTaskStatusCountResponseSchema =
  VisualizeResponseSchema;
export type VisualizeMyRoutineTaskStatusCountResponse = z.infer<
  typeof VisualizeMyRoutineTaskStatusCountResponseSchema
>;

export const VisualizeMyRoutineTaskPurposeCountRequestSchema =
  VisualizePermissionRequestSchema;
export type VisualizeMyRoutineTaskPurposeCountRequest = z.infer<
  typeof VisualizeMyRoutineTaskPurposeCountRequestSchema
>;
export const VisualizeMyRoutineTaskPurposeCountResponseSchema =
  VisualizeResponseSchema;
export type VisualizeMyRoutineTaskPurposeCountResponse = z.infer<
  typeof VisualizeMyRoutineTaskPurposeCountResponseSchema
>;

export const VisualizeMyRoutineTaskScheduledAtCountRequestSchema =
  VisualizeTimeBucketRequestSchema;
export type VisualizeMyRoutineTaskScheduledAtCountRequest = z.infer<
  typeof VisualizeMyRoutineTaskScheduledAtCountRequestSchema
>;
export const VisualizeMyRoutineTaskScheduledAtCountResponseSchema =
  VisualizeResponseSchema;
export type VisualizeMyRoutineTaskScheduledAtCountResponse = z.infer<
  typeof VisualizeMyRoutineTaskScheduledAtCountResponseSchema
>;

export const VisualizeMyRoutineTaskActualStartedAtCountRequestSchema =
  VisualizeTimeBucketRequestSchema;
export type VisualizeMyRoutineTaskActualStartedAtCountRequest = z.infer<
  typeof VisualizeMyRoutineTaskActualStartedAtCountRequestSchema
>;
export const VisualizeMyRoutineTaskActualStartedAtCountResponseSchema =
  VisualizeResponseSchema;
export type VisualizeMyRoutineTaskActualStartedAtCountResponse = z.infer<
  typeof VisualizeMyRoutineTaskActualStartedAtCountResponseSchema
>;

export const VisualizeMyRoutineTaskActualEndedAtCountRequestSchema =
  VisualizeTimeBucketRequestSchema;
export type VisualizeMyRoutineTaskActualEndedAtCountRequest = z.infer<
  typeof VisualizeMyRoutineTaskActualEndedAtCountRequestSchema
>;
export const VisualizeMyRoutineTaskActualEndedAtCountResponseSchema =
  VisualizeResponseSchema;
export type VisualizeMyRoutineTaskActualEndedAtCountResponse = z.infer<
  typeof VisualizeMyRoutineTaskActualEndedAtCountResponseSchema
>;

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
    isDeleted: z.boolean().optional().default(false),
  }),
});

export type GetMyRoutineTaskByIdRequest = z.input<
  typeof GetMyRoutineTaskByIdRequestSchema
>;

export const GetMyRoutineTaskByIdResponseSchema = NotezyResponseSchema.extend({
  data: z.object({
    id: z.uuidv4(),
    stationId: z.uuidv4(),
    title: z.string(),
    purpose: z.enum(AllRoutineTaskPurposes),
    costUnit: z.number(),
    payload: z.any(),
    priority: z.int32(),
    status: z.enum(AllRoutineTaskStatuses),
    attempts: z.int32(),
    maxAttempts: z.int32(),
    period: z.enum(AllRoutinePeriods).nullable(),
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

/* ============================== GetAllMyRoutineTasksByStationIds ============================== */

export const GetAllMyRoutineTasksByStationIdsRequestSchema =
  NotezyRequestSchema.extend({
    header: z
      .object({
        userAgent: z.string().min(1).optional(),
        authorization: z.string().optional(),
      })
      .optional(),
    param: z.object({
      stationIds: z.array(z.uuidv4()).min(1).max(1024),
      areDeleted: z.boolean().optional().default(false),
    }),
  });

export type GetAllMyRoutineTasksByStationIdsRequest = z.input<
  typeof GetAllMyRoutineTasksByStationIdsRequestSchema
>;

export const GetAllMyRoutineTasksByStationIdsResponseSchema =
  NotezyResponseSchema.extend({
    data: z.array(
      z.object({
        id: z.uuidv4(),
        stationId: z.uuidv4(),
        title: z.string(),
        purpose: z.enum(AllRoutineTaskPurposes),
        costUnit: z.number(),
        priority: z.int32(),
        status: z.enum(AllRoutineTaskStatuses),
        attempts: z.int32(),
        maxAttempts: z.int32(),
        period: z.enum(AllRoutinePeriods).nullable(),
        scheduledAt: z.coerce.date(),
        actualStartedAt: z.coerce.date().nullable(),
        actualEndedAt: z.coerce.date().nullable(),
        updatedAt: z.coerce.date(),
        createdAt: z.coerce.date(),
      })
    ),
    embedded: z.object({
      publicId: z.string(),
    }),
  });

export type GetAllMyRoutineTasksByStationIdsResponse = z.infer<
  typeof GetAllMyRoutineTasksByStationIdsResponseSchema
>;

/* ============================== GetAllMyRoutineTasks ============================== */

export const GetAllMyRoutineTasksRequestSchema = NotezyRequestSchema.extend({
  header: z
    .object({
      userAgent: z.string().min(1).optional(),
      authorization: z.string().optional(),
    })
    .optional(),
  param: z
    .object({
      areDeleted: z.boolean().optional().default(false),
    })
    .optional()
    .default({ areDeleted: false }),
});

export type GetAllMyRoutineTasksRequest = z.input<
  typeof GetAllMyRoutineTasksRequestSchema
>;

export const GetAllMyRoutineTasksResponseSchema = NotezyResponseSchema.extend({
  data: z.array(
    z.object({
      id: z.uuidv4(),
      stationId: z.uuidv4(),
      title: z.string(),
      purpose: z.enum(AllRoutineTaskPurposes),
      costUnit: z.number(),
      payload: z.any(),
      priority: z.int32(),
      status: z.enum(AllRoutineTaskStatuses),
      attempts: z.int32(),
      maxAttempts: z.int32(),
      period: z.enum(AllRoutinePeriods).nullable(),
      scheduledAt: z.coerce.date(),
      actualStartedAt: z.coerce.date().nullable(),
      actualEndedAt: z.coerce.date().nullable(),
      updatedAt: z.coerce.date(),
      createdAt: z.coerce.date(),
    })
  ),
  embedded: z.object({
    publicId: z.string(),
  }),
});

export type GetAllMyRoutineTasksResponse = z.infer<
  typeof GetAllMyRoutineTasksResponseSchema
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
        title: z.string().min(1).max(128),
        purpose: z.enum(AllRoutineTaskPurposes),
        payload: z.any().refine(value => {
          try {
            return (
              new TextEncoder().encode(JSON.stringify(value ?? {})).length <=
              16_777_216
            );
          } catch {
            return false;
          }
        }, "Payload must be smaller than 16 MiB."),
        priority: z.int32().min(0),
        maxAttempts: z.int32().min(1).max(20),
        period: z.enum(AllRoutinePeriods).nullable(),
        scheduledAt: z.coerce.date(),
      })
      .partial({
        payload: true,
        priority: true,
        maxAttempts: true,
        period: true,
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
        title: z.string().min(1).max(128),
        purpose: z.enum(AllRoutineTaskPurposes),
        payload: z.any().refine(value => {
          try {
            return (
              new TextEncoder().encode(JSON.stringify(value ?? {})).length <=
              16_777_216
            );
          } catch {
            return false;
          }
        }, "Payload must be smaller than 16 MiB."),
        priority: z.int32().min(0),
        maxAttempts: z.int32().min(1).max(20),
        period: z.enum(AllRoutinePeriods).nullable(),
        scheduledAt: z.coerce.date(),
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
