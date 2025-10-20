import { NotezyAPIError } from "@shared/api/exceptions";
import {
  CreateSubShelfByRootShelfId,
  DeleteMySubShelfById,
  DeleteMySubShelvesByIds,
  GetAllMySubShelvesByRootShelfId,
  GetMySubShelfById,
  GetMySubShelvesByPrevSubShelfId,
  MoveMySubShelf,
  MoveMySubShelves,
  RestoreMySubShelfById,
  RestoreMySubShelvesByIds,
  UpdateMySubShelfById,
} from "@shared/api/functions/subShelf.api";
import {
  CreateSubShelfByRootShelfIdRequest,
  CreateSubShelfByRootShelfIdRequestSchema,
  DeleteMySubShelfByIdRequest,
  DeleteMySubShelfByIdRequestSchema,
  DeleteMySubShelvesByIdsRequest,
  DeleteMySubShelvesByIdsRequestSchema,
  GetAllMySubShelvesByRootShelfIdRequest,
  GetAllMySubShelvesByRootShelfIdRequestSchema,
  GetAllMySubShelvesByRootShelfIdResponse,
  GetMySubShelfByIdRequest,
  GetMySubShelfByIdRequestSchema,
  GetMySubShelfByIdResponse,
  GetMySubShelvesByPrevSubShelfIdRequest,
  GetMySubShelvesByPrevSubShelfIdRequestSchema,
  GetMySubShelvesByPrevSubShelfIdResponse,
  MoveMySubShelfRequest,
  MoveMySubShelfRequestSchema,
  MoveMySubShelvesRequest,
  MoveMySubShelvesRequestSchema,
  RestoreMySubShelfByIdRequest,
  RestoreMySubShelfByIdRequestSchema,
  RestoreMySubShelvesByIdsRequest,
  RestoreMySubShelvesByIdsRequestSchema,
  UpdateMySubShelfByIdRequest,
  UpdateMySubShelfByIdRequestSchema,
} from "@shared/api/interfaces/subShelf.interface";
import { LocalStorageKeys } from "@shared/types/localStorage.type";
import {
  useMutation,
  useQuery,
  useQueryClient,
  UseQueryOptions,
} from "@tanstack/react-query";
import { UUID } from "crypto";
import { ZodError } from "zod";
import {
  QueryAsyncDefaultOptions,
  UseQueryDefaultOptions,
} from "../interfaces/queryHookOptions";
import { queryKeys } from "../queryKeys";

export const useGetMySubShelfById = (
  hookRequest?: GetMySubShelfByIdRequest,
  options?: Partial<UseQueryOptions>
) => {
  const queryClient = useQueryClient();

  const queryFunction = async (request?: GetMySubShelfByIdRequest) => {
    if (!request) return;

    try {
      const validatedRequest = GetMySubShelfByIdRequestSchema.parse(request);
      const response = await GetMySubShelfById(validatedRequest);
      if (response.newAccessToken) {
        localStorage.removeItem(LocalStorageKeys.AccessToken);
        localStorage.setItem(
          LocalStorageKeys.AccessToken,
          response.newAccessToken
        );
      }
      return response;
    } catch (error) {
      if (error instanceof ZodError) {
        const errorMessage = error.issues
          .map(issue => issue.message)
          .join(", ");
        throw new Error(`validation failed : ${errorMessage}`);
      }
      if (error instanceof NotezyAPIError) {
        switch (error.unWrap.reason) {
          default:
            throw new Error(error.unWrap.message);
        }
      }
      throw error;
    }
  };

  const query = useQuery({
    queryKey: queryKeys.subShelf.myOneById(
      hookRequest?.param.subShelfId as UUID | undefined
    ),
    queryFn: async () => await queryFunction(hookRequest),
    staleTime: UseQueryDefaultOptions.staleTime,
    refetchOnWindowFocus: UseQueryDefaultOptions.refetchOnWindowFocus,
    refetchOnMount: UseQueryDefaultOptions.refetchOnMount,
    ...options,
    enabled: !!hookRequest && options && options.enabled,
  });

  const queryAsync = async (
    callbackRequest: GetMySubShelfByIdRequest
  ): Promise<GetMySubShelfByIdResponse> => {
    return await queryClient.fetchQuery({
      queryKey: queryKeys.subShelf.myOneById(
        callbackRequest.param.subShelfId as UUID
      ),
      queryFn: async () => await queryFunction(callbackRequest),
      staleTime: QueryAsyncDefaultOptions.staleTime as number,
    });
  };

  return {
    ...query,
    queryAsync,
    name: "GET_MY_SUB_SHELF_BY_ID",
  };
};

export const useGetMySubShelvesByPrevSubShelfId = (
  hookRequest?: GetMySubShelvesByPrevSubShelfIdRequest,
  options?: Partial<UseQueryOptions>
) => {
  const queryClient = useQueryClient();

  const queryFunction = async (
    request?: GetMySubShelvesByPrevSubShelfIdRequest
  ) => {
    if (!request) return;

    try {
      const validatedRequest =
        GetMySubShelvesByPrevSubShelfIdRequestSchema.parse(request);
      const response = await GetMySubShelvesByPrevSubShelfId(validatedRequest);
      if (response.newAccessToken) {
        localStorage.removeItem(LocalStorageKeys.AccessToken);
        localStorage.setItem(
          LocalStorageKeys.AccessToken,
          response.newAccessToken
        );
      }
      return response;
    } catch (error) {
      if (error instanceof ZodError) {
        const errorMessage = error.issues
          .map(issue => issue.message)
          .join(", ");
        throw new Error(`validation failed : ${errorMessage}`);
      }
      if (error instanceof NotezyAPIError) {
        switch (error.unWrap.reason) {
          default:
            throw new Error(error.unWrap.message);
        }
      }
      throw error;
    }
  };

  const query = useQuery({
    queryKey: queryKeys.subShelf.myManyByPrevSubShelfId(
      hookRequest?.param.prevSubShelfId as UUID | undefined
    ),
    queryFn: async () => await queryFunction(hookRequest),
    staleTime: UseQueryDefaultOptions.staleTime,
    refetchOnWindowFocus: UseQueryDefaultOptions.refetchOnWindowFocus,
    refetchOnMount: UseQueryDefaultOptions.refetchOnMount,
    ...options,
    enabled: !!hookRequest && options && options.enabled,
  });

  const queryAsync = async (
    callbackRequest: GetMySubShelvesByPrevSubShelfIdRequest
  ): Promise<GetMySubShelvesByPrevSubShelfIdResponse> => {
    return await queryClient.fetchQuery({
      queryKey: queryKeys.subShelf.myManyByPrevSubShelfId(
        callbackRequest.param.prevSubShelfId as UUID
      ),
      queryFn: async () => await queryFunction(callbackRequest),
      staleTime: QueryAsyncDefaultOptions.staleTime as number,
    });
  };

  return {
    ...query,
    queryAsync,
    name: "GET_ALL_MY_SUB_SHELVES_BY_ROOT_SHELF_ID" as const,
  };
};

export const useGetAllMySubShelvesByRootShelfId = (
  hookRequest?: GetAllMySubShelvesByRootShelfIdRequest,
  options?: Partial<UseQueryOptions>
) => {
  const queryClient = useQueryClient();

  const queryFunction = async (
    request?: GetAllMySubShelvesByRootShelfIdRequest
  ) => {
    if (!request) return;

    try {
      const validatedRequest =
        GetAllMySubShelvesByRootShelfIdRequestSchema.parse(request);
      const response = await GetAllMySubShelvesByRootShelfId(validatedRequest);
      if (response.newAccessToken) {
        localStorage.removeItem(LocalStorageKeys.AccessToken);
        localStorage.setItem(
          LocalStorageKeys.AccessToken,
          response.newAccessToken
        );
      }
      return response;
    } catch (error) {
      if (error instanceof ZodError) {
        const errorMessage = error.issues
          .map(issue => issue.message)
          .join(", ");
        throw new Error(`validation failed : ${errorMessage}`);
      }
      if (error instanceof NotezyAPIError) {
        switch (error.unWrap.reason) {
          default:
            throw new Error(error.unWrap.message);
        }
      }
      throw error;
    }
  };

  const query = useQuery({
    queryKey: queryKeys.subShelf.myManyByRootShelfId(
      hookRequest?.param.rootShelfId as UUID | undefined
    ),
    queryFn: async () => await queryFunction(hookRequest),
    staleTime: UseQueryDefaultOptions.staleTime,
    refetchOnWindowFocus: UseQueryDefaultOptions.refetchOnWindowFocus,
    refetchOnMount: UseQueryDefaultOptions.refetchOnMount,
    ...options,
    enabled: !!hookRequest && options && options.enabled,
  });

  const queryAsync = async (
    callbackRequest: GetAllMySubShelvesByRootShelfIdRequest
  ): Promise<GetAllMySubShelvesByRootShelfIdResponse> => {
    return await queryClient.fetchQuery({
      queryKey: queryKeys.subShelf.myManyByRootShelfId(
        callbackRequest.param.rootShelfId as UUID
      ),
      queryFn: async () => await queryFunction(callbackRequest),
      staleTime: QueryAsyncDefaultOptions.staleTime as number,
    });
  };

  return {
    ...query,
    queryAsync,
    name: "GET_ALL_MY_SUB_SHELVES_BY_ROOT_SHELF_ID" as const,
  };
};

export const useCreateSubShelfByRootShelfId = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (request: CreateSubShelfByRootShelfIdRequest) => {
      const validatedRequest =
        CreateSubShelfByRootShelfIdRequestSchema.parse(request);
      return await CreateSubShelfByRootShelfId(validatedRequest);
    },
    onSuccess: (response, variables) => {
      const prevSubShelfId = variables.affected.prevSubShelfId;
      const rootShelfId = variables.affected.rootShelfId;
      queryClient.invalidateQueries({
        predicate: q => {
          const k = q.queryKey as any[];
          if (!Array.isArray(k) || k.length < 3) return false;

          switch (k[0]) {
            case "rootShelf":
              if (k[1] === "myOneById" && rootShelfId === k[2]) return true;
            case "subShelf":
              switch (k[1]) {
                case "myOneById":
                case "myManyByPrevSubShelfId":
                  if (prevSubShelfId === k[2]) return true;
                case "myManyByRootShelfId":
                  if (rootShelfId === k[2]) return true;
              }
          }

          return false;
        },
        refetchType: "active",
      });
      if (response.newAccessToken) {
        localStorage.removeItem(LocalStorageKeys.AccessToken);
        localStorage.setItem(
          LocalStorageKeys.AccessToken,
          response.newAccessToken
        );
      }
    },
    onError: error => {
      if (error instanceof ZodError) {
        const errorMessage = error.issues
          .map(issue => issue.message)
          .join(", ");
        throw new Error(`validation failed : ${errorMessage}`);
      }
      if (error instanceof NotezyAPIError) {
        switch (error.unWrap.reason) {
          default:
            throw new Error(error.unWrap.message);
        }
      }
      throw error;
    },
  });

  return {
    ...mutation,
    name: "CREATE_SUB_SHELF_BY_ROOT_SHELF_ID" as const,
  };
};

export const useUpdateMySubShelfById = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (request: UpdateMySubShelfByIdRequest) => {
      const validatedRequest = UpdateMySubShelfByIdRequestSchema.parse(request);
      return await UpdateMySubShelfById(validatedRequest);
    },
    onSuccess: (response, variables) => {
      const prevSubShelfId = variables.affected.prevSubShelfId;
      const rootShelfId = variables.affected.rootShelfId;
      queryClient.invalidateQueries({
        predicate: q => {
          const k = q.queryKey as any[];
          if (!Array.isArray(k) || k.length < 3) return false;

          switch (k[0]) {
            case "rootShelf":
              if (k[1] === "myOneById" && rootShelfId === k[2]) return true;
            case "subShelf":
              switch (k[1]) {
                case "myOneById":
                case "myManyByPrevSubShelfId":
                  if (prevSubShelfId !== null && prevSubShelfId === k[2])
                    return true;
                case "myManyByRootShelfId":
                  if (rootShelfId === k[2]) return true;
              }
          }

          return false;
        },
        refetchType: "active",
      });
      if (response.newAccessToken) {
        localStorage.removeItem(LocalStorageKeys.AccessToken);
        localStorage.setItem(
          LocalStorageKeys.AccessToken,
          response.newAccessToken
        );
      }
    },
    onError: error => {
      if (error instanceof ZodError) {
        const errorMessage = error.issues
          .map(issue => issue.message)
          .join(", ");
        throw new Error(`validation failed : ${errorMessage}`);
      }
      if (error instanceof NotezyAPIError) {
        switch (error.unWrap.reason) {
          default:
            throw new Error(error.unWrap.message);
        }
      }
      throw error;
    },
  });

  return {
    ...mutation,
    name: "UPDATE_MY_SUB_SHELF_BY_ID" as const,
  };
};

export const useMoveMySubShelf = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (request: MoveMySubShelfRequest) => {
      const validatedRequest = MoveMySubShelfRequestSchema.parse(request);
      return await MoveMySubShelf(validatedRequest);
    },
    onSuccess: (response, variables) => {
      const sourceSubShelfId = variables.body.sourceSubShelfId;
      const destinationSubShelfId = variables.body.destinationSubShelfId;
      const rootShelfId = variables.affected.rootShelfId;
      const childSubShelfIdsSet = new Set(
        (variables.affected.childSubShelfIds || []).filter(Boolean) as UUID[]
      );
      queryClient.invalidateQueries({
        predicate: q => {
          const k = q.queryKey as any[];
          if (!Array.isArray(k) || k.length < 3) return false;

          switch (k[0]) {
            case "rootShelf":
              if (k[1] === "myOneById" && rootShelfId === k[2]) return true;
            case "subShelf":
              switch (k[1]) {
                case "myOneById":
                  if (
                    sourceSubShelfId === k[2] ||
                    destinationSubShelfId === k[2] ||
                    childSubShelfIdsSet.has(k[2])
                  )
                    return true;
                case "myManyByPrevSubShelfId":
                  if (destinationSubShelfId === k[2]) return true;
                case "myManyByRootShelfId":
                  if (rootShelfId === k[2]) return true;
              }
            case "material":
              if (k[1] === "myManyByRootShelfId" && rootShelfId === k[2])
                return true;
          }

          return false;
        },
        refetchType: "active",
      });
      if (response.newAccessToken) {
        localStorage.removeItem(LocalStorageKeys.AccessToken);
        localStorage.setItem(
          LocalStorageKeys.AccessToken,
          response.newAccessToken
        );
      }
    },
    onError: error => {
      if (error instanceof ZodError) {
        const errorMessage = error.issues
          .map(issue => issue.message)
          .join(", ");
        throw new Error(`validation failed : ${errorMessage}`);
      }
      if (error instanceof NotezyAPIError) {
        switch (error.unWrap.reason) {
          default:
            throw new Error(error.unWrap.message);
        }
      }
      throw error;
    },
  });

  return {
    ...mutation,
    name: "MOVE_MY_SUB_SHELF" as const,
  };
};

export const useMoveMySubShelves = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (request: MoveMySubShelvesRequest) => {
      const validatedRequest = MoveMySubShelvesRequestSchema.parse(request);
      return await MoveMySubShelves(validatedRequest);
    },
    onSuccess: (response, variables) => {
      const sourceSubShelfIdsSet = new Set(
        (variables.body.sourceSubShelfIds || []).filter(Boolean) as UUID[]
      );
      const destinationSubShelfId = variables.body.destinationSubShelfId;
      const rootShelfIdsSet = new Set(
        (variables.affected.rootShelfIds || []).filter(Boolean) as UUID[]
      );
      const childSubShelfIdsSet = new Set(
        (variables.affected.childSubShelfIds || []).filter(Boolean) as UUID[]
      );
      queryClient.invalidateQueries({
        predicate: q => {
          const k = q.queryKey as any[];
          if (!Array.isArray(k) || k.length < 3) return false;

          switch (k[0]) {
            case "rootShelf":
              if (k[1] === "myOneById" && rootShelfIdsSet.has(k[2]))
                return true;
            case "subShelf":
              switch (k[1]) {
                case "myOneById":
                  if (
                    sourceSubShelfIdsSet.has(k[2]) ||
                    destinationSubShelfId === k[2] ||
                    childSubShelfIdsSet.has(k[2])
                  )
                    return true;
                case "myManyByPrevSubShelfId":
                  if (destinationSubShelfId === k[2]) return true;
                case "myManyByRootShelfId":
                  if (rootShelfIdsSet.has(k[2])) return true;
              }
            case "material":
              if (k[1] === "myManyByRootShelfId" && rootShelfIdsSet.has(k[2]))
                return true;
          }

          return false;
        },
        refetchType: "active",
      });
      if (response.newAccessToken) {
        localStorage.removeItem(LocalStorageKeys.AccessToken);
        localStorage.setItem(
          LocalStorageKeys.AccessToken,
          response.newAccessToken
        );
      }
    },
    onError: error => {
      if (error instanceof ZodError) {
        const errorMessage = error.issues
          .map(issue => issue.message)
          .join(", ");
        throw new Error(`validation failed : ${errorMessage}`);
      }
      if (error instanceof NotezyAPIError) {
        switch (error.unWrap.reason) {
          default:
            throw new Error(error.unWrap.message);
        }
      }
      throw error;
    },
  });

  return {
    ...mutation,
    name: "MOVE_MY_SUB_SHELVES" as const,
  };
};

export const useRestoreMySubShelfById = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (request: RestoreMySubShelfByIdRequest) => {
      const validatedRequest =
        RestoreMySubShelfByIdRequestSchema.parse(request);
      return await RestoreMySubShelfById(validatedRequest);
    },
    onSuccess: (response, variables) => {
      queryClient.invalidateQueries({
        predicate: q => {
          const k = q.queryKey as any[];
          if (!Array.isArray(k) || k.length < 3) return false;

          switch (k[0]) {
            case "rootShelf":
              if (
                k[1] === "myOneById" &&
                variables.affected.rootShelfId === k[2]
              ) {
                return true;
              }
            case "subShelf":
              switch (k[1]) {
                case "myOneById":
                  if (variables.body.subShelfId === k[2]) return true;
                case "myManyByPrevSubShelfId":
                  if (variables.affected.prevSubShelfId === k[2]) return true;
                case "myManyByRootShelfId":
                  if (variables.affected.rootShelfId === k[2]) return true;
              }
            case "material":
              if (
                k[1] === "myManyByParentSubShelfId" &&
                variables.body.subShelfId === k[2]
              )
                return true;
          }

          return false;
        },
        refetchType: "active",
      });
      if (response.newAccessToken) {
        localStorage.removeItem(LocalStorageKeys.AccessToken);
        localStorage.setItem(
          LocalStorageKeys.AccessToken,
          response.newAccessToken
        );
      }
    },
    onError: error => {
      if (error instanceof ZodError) {
        const errorMessage = error.issues
          .map(issue => issue.message)
          .join(", ");
        throw new Error(`validation failed : ${errorMessage}`);
      }
      if (error instanceof NotezyAPIError) {
        switch (error.unWrap.reason) {
          default:
            throw new Error(error.unWrap.message);
        }
      }
      throw error;
    },
  });

  return {
    ...mutation,
    name: "RESTORE_MY_SUB_SHELF_BY_ID" as const,
  };
};

export const useRestoreMySubShelvesByIds = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (request: RestoreMySubShelvesByIdsRequest) => {
      const validatedRequest =
        RestoreMySubShelvesByIdsRequestSchema.parse(request);
      return await RestoreMySubShelvesByIds(validatedRequest);
    },
    onSuccess: (response, variables) => {
      const subShelfIdsSet = new Set(
        (variables.body.subShelfIds || []).filter(Boolean) as UUID[]
      );
      const rootShelfIdsSet = new Set(
        (variables.affected.rootShelfIds || []).filter(Boolean) as UUID[]
      );
      const prevSubShelfIdsSet = new Set(
        (variables.affected.prevSubShelfIds || []).filter(Boolean) as UUID[]
      );
      queryClient.invalidateQueries({
        predicate: q => {
          const k = q.queryKey as any[];
          if (!Array.isArray(k) || k.length < 3) return false;

          switch (k[0]) {
            case "rootShelf":
              if (k[1] === "myOneById" && rootShelfIdsSet.has(k[2]))
                return true;
            case "subShelf":
              switch (k[1]) {
                case "myManyByPrevSubShelfId":
                  if (prevSubShelfIdsSet.has(k[2])) return true;
                case "myManyByRootShelfId":
                  if (rootShelfIdsSet.has(k[2])) return true;
              }
            case "material":
              if (
                k[1] === "myManyByParentSubShelfId" &&
                subShelfIdsSet.has(k[2])
              )
                return true;
          }

          return false;
        },
        refetchType: "active",
      });
      if (response.newAccessToken) {
        localStorage.removeItem(LocalStorageKeys.AccessToken);
        localStorage.setItem(
          LocalStorageKeys.AccessToken,
          response.newAccessToken
        );
      }
    },
    onError: error => {
      if (error instanceof ZodError) {
        const errorMessage = error.issues
          .map(issue => issue.message)
          .join(", ");
        throw new Error(`validation failed : ${errorMessage}`);
      }
      if (error instanceof NotezyAPIError) {
        switch (error.unWrap.reason) {
          default:
            throw new Error(error.unWrap.message);
        }
      }
      throw error;
    },
  });

  return {
    ...mutation,
    name: "RESTORE_MY_SUB_SHELVES_BY_IDS" as const,
  };
};

export const useDeleteMySubShelfById = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (request: DeleteMySubShelfByIdRequest) => {
      const validatedRequest = DeleteMySubShelfByIdRequestSchema.parse(request);
      return await DeleteMySubShelfById(validatedRequest);
    },
    onSuccess: (response, variables) => {
      queryClient.invalidateQueries({
        predicate: q => {
          const k = q.queryKey as any[];
          if (!Array.isArray(k) || k.length < 3) return false;
          switch (k[0]) {
            case "rootShelf":
              if (
                k[1] === "myOneById" &&
                variables.affected.rootShelfId === k[2]
              ) {
                return true;
              }
            case "subShelf":
              switch (k[1]) {
                case "myOneById":
                  if (variables.body.subShelfId === k[2]) return true;
                case "myManyByPrevSubShelfId":
                  if (variables.affected.prevSubShelfId === k[2]) return true;
                case "myManyByRootShelfId":
                  if (variables.affected.rootShelfId === k[2]) return true;
              }
            case "material":
              if (
                k[1] === "myManyByParentSubShelfId" &&
                variables.body.subShelfId === k[2]
              )
                return true;
          }

          return false;
        },
        refetchType: "active",
      });
      if (response.newAccessToken) {
        localStorage.removeItem(LocalStorageKeys.AccessToken);
        localStorage.setItem(
          LocalStorageKeys.AccessToken,
          response.newAccessToken
        );
      }
    },
    onError: error => {
      if (error instanceof ZodError) {
        const errorMessage = error.issues
          .map(issue => issue.message)
          .join(", ");
        throw new Error(`validation failed : ${errorMessage}`);
      }
      if (error instanceof NotezyAPIError) {
        switch (error.unWrap.reason) {
          default:
            throw new Error(error.unWrap.message);
        }
      }
      throw error;
    },
  });

  return {
    ...mutation,
    name: "DELETE_MY_SUB_SHELF_BY_ID" as const,
  };
};

export const useDeleteMySubShelvesByIds = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (request: DeleteMySubShelvesByIdsRequest) => {
      const validatedRequest =
        DeleteMySubShelvesByIdsRequestSchema.parse(request);
      return await DeleteMySubShelvesByIds(validatedRequest);
    },
    onSuccess: (response, variables) => {
      const subShelfIdsSet = new Set(
        (variables.body.subShelfIds || []).filter(Boolean) as UUID[]
      );
      const rootShelfIdsSet = new Set(
        (variables.affected.rootShelfIds || []).filter(Boolean) as UUID[]
      );
      const prevSubShelfIdsSet = new Set(
        (variables.affected.prevSubShelfIds || []).filter(Boolean) as UUID[]
      );
      queryClient.invalidateQueries({
        predicate: q => {
          const k = q.queryKey as any[];
          if (!Array.isArray(k) || k.length < 3) return false;

          switch (k[0]) {
            case "rootShelf":
              if (k[1] === "myOneById" && rootShelfIdsSet.has(k[2]))
                return false;
            case "subShelf":
              switch (k[1]) {
                case "myOneById":
                  if (subShelfIdsSet.has(k[2])) return true;
                case "myManyByPrevSubShelfId":
                  if (prevSubShelfIdsSet.has(k[2])) return true;
                case "myManyByRootShelfId":
                  if (rootShelfIdsSet.has(k[2])) return true;
              }
            case "material":
              if (
                k[1] === "myManyByParentSubShelfId" &&
                subShelfIdsSet.has(k[2])
              )
                return true;
          }

          return false;
        },
        refetchType: "active",
      });
      if (response.newAccessToken) {
        localStorage.removeItem(LocalStorageKeys.AccessToken);
        localStorage.setItem(
          LocalStorageKeys.AccessToken,
          response.newAccessToken
        );
      }
    },
    onError: error => {
      if (error instanceof ZodError) {
        const errorMessage = error.issues
          .map(issue => issue.message)
          .join(", ");
        throw new Error(`validation failed : ${errorMessage}`);
      }
      if (error instanceof NotezyAPIError) {
        switch (error.unWrap.reason) {
          default:
            throw new Error(error.unWrap.message);
        }
      }
      throw error;
    },
  });

  return {
    ...mutation,
    name: "DELETE_MY_SUB_SHELVES_BY_IDS" as const,
  };
};
