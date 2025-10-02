import { api } from "./axios";
import type {
  ApiKeysResponse,
  CreateApiKeyRequest,
  CreateApiKeyResponse,
} from "../types/project";

const BASE_URL = "https://dev.begamob.com/project/revenue-cow/api/v1";

export const apiKeyApi = {
  getApiKeys: async (
    projectId: string,
    page: number = 1,
    limit: number = 10,
    sortBy: string = "createdAt",
    sortOrder: "asc" | "desc" = "desc"
  ): Promise<ApiKeysResponse> => {
    const response = await api.get(
      `${BASE_URL}/project/${projectId}/api-keys`,
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

  createApiKey: async (
    projectId: string,
    apiKeyData: CreateApiKeyRequest
  ): Promise<CreateApiKeyResponse> => {
    const response = await api.post(
      `${BASE_URL}/project/${projectId}/api-keys`,
      apiKeyData
    );
    return response.data;
  },
};
