import { api } from "./axios";
import type {
  EnvironmentsResponse,
  CreateEnvironmentRequest,
  CreateEnvironmentResponse,
} from "../types/project";

const BASE_URL = "https://dev.begamob.com/project/revenue-cow/api/v1";

export const environmentsApi = {
  getEnvironments: async (
    projectId: string,
    page: number = 1,
    limit: number = 10,
    sortBy: string = "createdAt",
    sortOrder: "asc" | "desc" = "desc"
  ): Promise<EnvironmentsResponse> => {
    const response = await api.get(
      `${BASE_URL}/project/${projectId}/environments`,
      {
        params: {
          page,
          limit,
          sortBy,
          sortOrder,
        },
      }
    );
    return response.data;
  },

  createEnvironment: async (
    projectId: string,
    environmentData: CreateEnvironmentRequest
  ): Promise<CreateEnvironmentResponse> => {
    const response = await api.post(
      `${BASE_URL}/project/${projectId}/environments`,
      environmentData
    );
    return response.data;
  },

  updateEnvironment: async (
    projectId: string,
    environmentId: string,
    environmentData: CreateEnvironmentRequest
  ): Promise<CreateEnvironmentResponse> => {
    const response = await api.patch(
      `${BASE_URL}/project/${projectId}/environments/${environmentId}`,
      environmentData
    );
    return response.data;
  },

  deleteEnvironment: async (
    projectId: string,
    environmentId: string
  ): Promise<{ success: boolean } | void> => {
    const response = await api.delete(
      `${BASE_URL}/project/${projectId}/environments/${environmentId}`
    );
    return response.data;
  },
};
