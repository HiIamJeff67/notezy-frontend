import {
  FragmentedPrivateShelfFragmentDoc,
  PrivateShelf,
} from "@/graphql/generated/graphql";
import { useApolloClient } from "@apollo/client/react";
import { NotezyAPIError } from "@shared/api/exceptions";
import {
  CreateShelf,
  DeleteShelf,
  SynchronizeShelves,
} from "@shared/api/functions/shelf.api";
import {
  CreateShelfRequest,
  CreateShelfRequestSchema,
  DeleteShelfRequest,
  DeleteShelfRequestSchema,
  SynchronizeShelvesRequest,
  SynchronizeShelvesRequestSchema,
} from "@shared/api/interfaces/shelf.interface";
import { useMutation } from "@tanstack/react-query";
import { ZodError } from "zod";

export const useCreateShelf = () => {
  const apolloClient = useApolloClient();

  const mutation = useMutation({
    mutationFn: async (request: CreateShelfRequest) => {
      const validatedRequest = CreateShelfRequestSchema.parse(request);
      return await CreateShelf(validatedRequest);
    },
    onSuccess: (response, variables) => {
      const shelfNode: PrivateShelf = {
        __typename: "PrivateShelf",
        id: response.data.id,
        name: variables.body.name,
        encodedStructure: response.data.encodedStructure,
        encodedStructureByteSize: 36,
        totalShelfNodes: 1,
        totalMaterials: 0,
        maxWidth: 1,
        maxDepth: 1,
        lastAnalyzedAt: String(response.data.lastAnalyzedAt),
        updatedAt: String(response.data.createdAt),
        createdAt: String(response.data.createdAt),
        owner: [],
      };
      apolloClient.cache.modify({
        fields: {
          searchShelves(existing) {
            if (!existing) return existing;
            const edges = existing.searchEdges || [];
            const exists = edges.some((e: any) => e.node.id === shelfNode.id);
            if (exists) return existing;
            const writtenRef = apolloClient.cache.writeFragment({
              fragment: FragmentedPrivateShelfFragmentDoc,
              fragmentName: "FragmentedPrivateShelf",
              data: shelfNode,
            });
            const newEdge = {
              __typename: "SearchShelfEdge",
              encodedSearchCursor: "",
              node: writtenRef,
            };
            return {
              ...existing,
              searchEdges: [newEdge, ...edges],
            };
          },
        },
      });
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
    name: "CREATE_SHELF_HOOK" as const,
  };
};

export const useSynchronizeShelves = () => {
  const mutation = useMutation({
    mutationFn: async (request: SynchronizeShelvesRequest) => {
      const validatedRequest = SynchronizeShelvesRequestSchema.parse(request);
      return await SynchronizeShelves(validatedRequest);
    },
    onSuccess: (_, variables) => {},
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
    name: "SYNCHRONIZE_SHELVES_HOOK" as const,
  };
};

export const useDeleteShelf = () => {
  const apolloClient = useApolloClient();

  const mutation = useMutation({
    mutationFn: async (request: DeleteShelfRequest) => {
      const validatedRequest = DeleteShelfRequestSchema.parse(request);
      return await DeleteShelf(validatedRequest);
    },
    onSuccess: (_, variables) => {
      apolloClient.cache.modify({
        fields: {
          searchShelves(existing) {
            if (!existing) return existing;
            const edges = existing.searchEdges || [];
            const newEdges = edges.filter(
              (e: any) => e.node.id !== variables.body.shelfId
            );
            return {
              ...existing,
              searchEdges: newEdges,
            };
          },
        },
      });
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
    name: "DELETE_SHELF_HOOK" as const,
  };
};
