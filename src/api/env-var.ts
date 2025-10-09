import { api } from "./axios";
import type {
  CreateEnvVarRequest,
  CreateEnvVarResponse,
  EnvVarsResponse,
  UpdateEnvVarRequest,
  UpdateEnvVarResponse,
  DeleteEnvVarResponse,
} from "../types/project";

const BASE_URL = "https://dev.begamob.com/project/revenue-cow/api/v1";

export const envVarApi = {
  createEnvVar: async (
    projectId: string,
    payload: CreateEnvVarRequest
  ): Promise<CreateEnvVarResponse> => {
    const response = await api.post(
      `${BASE_URL}/project/${projectId}/environment/env-vars`,
      payload
    );
    return response.data;
  },

  getEnvVars: async (
    projectId: string,
    page: number = 1,
    limit: number = 10,
    sortBy: string = "createdAt",
    sortOrder: "asc" | "desc" = "desc",
    environment_id: string | null = null
  ): Promise<EnvVarsResponse> => {
    const response = await api.get(
      `${BASE_URL}/project/${projectId}/environment/env-vars`,
      {
        params: {
          environment_id: environment_id || undefined,
          page,
          limit,
          sortBy,
          sortOrder,
        },
      }
    );
    return response.data;
  },

  updateEnvVar: async (
    projectId: string,
    envVarId: string,
    payload: UpdateEnvVarRequest
  ): Promise<UpdateEnvVarResponse> => {
    const response = await api.patch(
      `${BASE_URL}/project/${projectId}/environment/env-vars/${envVarId}`,
      payload
    );
    return response.data;
  },

  deleteEnvVar: async (
    projectId: string,
    envVarId: string
  ): Promise<DeleteEnvVarResponse> => {
    const response = await api.delete(
      `${BASE_URL}/project/${projectId}/environment/env-vars/${envVarId}`
    );
    return response.data;
  },
};
