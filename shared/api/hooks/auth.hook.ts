import { Register } from "@shared/api/functions/auth.api";
import {
  RegisterRequest,
  RegisterRequestSchema,
} from "@shared/api/interfaces/auth.interface";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export const useRegister = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (request: RegisterRequest) => {
      try {
        const validatedRequest = RegisterRequestSchema.parse(request);
        return await Register(validatedRequest);
      } catch (error) {}
    },
  });
};
